import { Settings } from '../common.js'

export class TimeLoop {
  constructor(game) {
    this.game = game
    this.gameLoop()
  }

  start() {
    this.timeout = setInterval(this.gameLoop.bind(this), 33)
  }
  stop() {
    clearInterval(this.timeout)
  }
  // LOOP
  gameLoop () {

    // Game tick increment
    this.game.tick++

    // belts excluded
    const belts = []
    for (let ient = 0; ient < this.game.allInvs.length; ient++) {
      const entity = this.game.allInvs[ient]
      if (!entity) continue
      if (entity?.isBelt) {
        entity.done = false
        entity.searching = false
        belts.push(entity)
      } else {
        if (entity.update) {
          entity.update(this.game.entityLayer.map, entity)
        } //else entity.draw(this.game.canvas?.getContext('2d'))
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
          if (( nbEntity?.isBelt) && // is it a belt?
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

  }
}
