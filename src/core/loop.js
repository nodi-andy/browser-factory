import { Settings } from '../common.js'

export class TimeLoop {
  constructor(game) {
    this.game = game
    this.gameLoop()
  }
  // LOOP
  gameLoop () {
    if (this.game.state === 0) {
      setTimeout(window.Time.gameLoop, 20)
      return
    }

    if (this.game.state === 2) {
      this.game.stopped()
      return
    }

    // Game tick increment
    this.game.tick++

    // belts excluded
    const belts = []
    for (let ient = 0; ient < this.game.allInvs.length; ient++) {
      const entity = this.game.allInvs[ient]
      if (!entity) continue
      if (entity?.belt) {
        entity.done = false
        entity.searching = false
        belts.push(entity)
      } else {
        if (entity.update) {
          entity.update(this.game.entityLayer.map, entity)
        } else entity.draw(this.game.canvas?.getContext('2d'))
      }
    }

    for (let ibelt = 0; ibelt < belts.length;) {
      let belt = belts[ibelt]
      if (belt.done) ibelt++
      else {
        // go forward until the first belt
        while (belt) {
          const x = belt.pos.x
          const y = belt.pos.y

          const nbPos = Settings.dirToVec[belt.dir]
          const nbTile = this.game.entityLayer.map[x + nbPos.x][y + nbPos.y]
          const nbEntity = this.game.allInvs[nbTile]
          if ((nbEntity?.type === Settings.resDB.belt1.id || nbEntity?.type === Settings.resDB.belt2.id || nbEntity?.type === Settings.resDB.belt3.id) && // is it a belt?
                      nbEntity.done === false && // already processed?
                      (nbEntity.searching === false || nbEntity.searching == null) && // circular network?
                      Math.abs(belt.dir - nbEntity.dir) !== 2) { // not heading to current belt
            belt.searching = true
            belt = nbEntity
          } else break
        }
        belt.update(this.game.entityLayer.map, belt)
      }
    }

    if (Settings.selEntity) this.game.updateEntityMenu(Settings.selEntity, true)
    setTimeout(this.gameLoop.bind(this), 20)
  }
}
