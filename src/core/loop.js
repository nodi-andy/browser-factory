import { Settings } from '../common.js'

class TimeLoop {
  // LOOP
  gameLoop () {
    if (window.game.state === 0) {
      setTimeout(window.Time.gameLoop, 20)
      return
    }

    if (window.game.state === 2) {
      window.game.stopped()
      return
    }

    // Game tick increment
    window.game.tick++

    // Autosave
    if (window.game.tick % 1000 === 0) window.saveGame()

    // belts excluded
    const belts = []
    for (let ient = 0; ient < window.game.allInvs.length; ient++) {
      const entity = window.game.allInvs[ient]
      if (!entity) continue
      if (entity?.belt) {
        entity.done = false
        entity.searching = false
        belts.push(entity)
      } else {
        if (entity.update) {
          entity.update(window.entityLayer.map, entity)
        } else entity.draw(window.context)
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
          const nbTile = window.entityLayer.map[x + nbPos.x][y + nbPos.y]
          const nbEntity = window.game.allInvs[nbTile]
          if ((nbEntity?.type === Settings.resDB.belt1.id || nbEntity?.type === Settings.resDB.belt2.id || nbEntity?.type === Settings.resDB.belt3.id) && // is it a belt?
                      nbEntity.done === false && // already processed?
                      (nbEntity.searching === false || nbEntity.searching == null) && // circular network?
                      Math.abs(belt.dir - nbEntity.dir) !== 2) { // not heading to current belt
            belt.searching = true
            belt = nbEntity
          } else break
        }
        belt.update(window.entityLayer.map, belt)
      }
    }

    if (Settings.selEntity) window.game.updateEntityMenu(Settings.selEntity, true)
    setTimeout(window.Time.gameLoop, 20)
  }
}

export const Time = new TimeLoop()
