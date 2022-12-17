import { Settings } from '../common.js'

class TimeLoop {
  // LOOP
  gameLoop () {
    if (Settings.gameState === 0) {
      setTimeout(this.gameLoop, 20)
      return
    }

    if (Settings.gameState === 2) {
      Settings.game.stopped()
      return
    }

    // SETUP
    /*
      if (Settings.game.tick === 0) {
          for(let ient = 0; ient < Settings.allInvs.length; ient++) {
              let entity = Settings.allInvs[ient];
              if (entity?.setup) entity.setup(Settings.game.map, entity);
              else Settings.resName[entity?.type]?.mach?.setup(Settings.game.map, entity);
          }
      }
      */
    // Game tick increment
    Settings.game.tick++

    // Autosave
    if (Settings.game.tick % 1000 === 0) window.saveGame()

    // belts excluded
    const belts = []
    for (let ient = 0; ient < Settings.allInvs.length; ient++) {
      const entity = Settings.allInvs[ient]
      if (!entity) continue
      if (entity?.type === Settings.resDB.belt1.id) {
        entity.done = false
        entity.searching = false
        belts.push(entity)
      } else {
        if (entity.update) {
          entity.update(Settings.game.map, entity)
        } else entity.draw(window.context)
      }
    }

    // BELTS SYSTEM
    Settings.decidingMoving = ((Settings.game.tick + 0) % 8 === 0)
    Settings.movingParts = ((Settings.game.tick + 1) % 8 === 0)

    for (let ibelt = 0; ibelt < belts.length;) {
      let belt = belts[ibelt]
      if (belt.done) ibelt++
      else {
        // go forward until the first belt
        while (belt) {
          const x = belt.pos.x
          const y = belt.pos.y

          const nbPos = Settings.dirToVec[belt.dir]
          const nbTile = Settings.game.map[x + nbPos.x][y + nbPos.y]
          const nbEntity = Settings.allInvs[nbTile[Settings.layers.inv]]
          if (nbEntity?.type === Settings.resDB.belt1.id && // is it a belt?
                      nbEntity.done === false && // already processed?
                      (nbEntity.searching === false || nbEntity.searching === undefined) && // circular network?
                      Math.abs(belt.dir - nbEntity.dir) !== 2) { // not heading to current belt
            belt.searching = true
            belt = nbEntity
          } else break
        }
        belt.update(Settings.game.map, belt)
      }
    }

    setTimeout(this.gameLoop, 20)
  }
}

const Time = new TimeLoop()

export { Time }
