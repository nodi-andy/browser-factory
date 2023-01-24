import { Settings } from '../common.js'
import * as NC from 'nodicanvas'

class ResLayer extends NC.NodiGrid {
  render (view) {
    const ctx = view.ctx
    const beltsToDraw = [] // list of belts to draw the items in second stage of drawing
    const entsToDraw = [] // all other items
    // scan all tiles in view
    const minTile = this.screenToTile({ x: 0, y: 0 })
    const maxTile = this.screenToTile({ x: ctx.canvas.width, y: ctx.canvas.height })
    for (let ay = minTile.y - 3; ay < Math.min(maxTile.y + 5, this.gridSize.y); ay++) {
      for (let ax = minTile.x - 3; ax < Math.min(maxTile.x + 2, this.gridSize.x); ax++) {
        if (ax < 0 || ay < 0) continue
        // GET TILE
        const tile = Settings.game.map[ax][ay]

        const invID = tile[Settings.layers.inv]
        let ent
        if (invID !== undefined) {
          ent = Settings.allInvs[invID]
        }

        // DRAW RESOURCES
        const type = tile[Settings.layers.res].id
        const n = tile[Settings.layers.res].n

        if (type && Settings.resName[type].img && n) {
          ctx.drawImage(Settings.resName[type].img, Math.min(Math.floor(n / 100), 6) * 64, 2, 60, 60, ax * this.tileSize, ay * this.tileSize, 64, 64)
        }

        // ENTITY GROUNDS
        ctx.save()
        ctx.translate(ax * this.tileSize, ay * this.tileSize)

        if (ent?.type && Settings.resName[ent?.type]?.img && ent.drawn === 0) {
          const type = Settings.resName[ent.type]
          if (type && type.size) {
            ctx.translate(type.size[0] / 2 * this.tileSize, type.size[1] / 2 * this.tileSize)
            if (Settings.resName[ent.type].rotatable !== false) ctx.rotate(ent.dir * Math.PI / 2)
            ctx.translate(-type.size[0] / 2 * this.tileSize, -type.size[1] / 2 * this.tileSize)
          }

          if (ent?.draw) ent.draw(ctx)
          else ctx.drawImage(Settings.resName[ent.type].img, 0, 0)
          ent.drawn = 1 // static objects are drawn now

          if (ent.type === Settings.resDB.belt1.id) {
            ent.searching = false // no circular dependency for belts
            beltsToDraw.push(ent)
          } else entsToDraw.push(ent)
        }

        // ITEMS ON GROUND
        if (invID !== undefined && Settings.allInvs[invID]?.type === 'empty') {
          const packs = Settings.allInvs[invID].stack.INV
          if (packs) {
            ctx.scale(0.5, 0.5)

            for (let iitem = 0; iitem < packs.length; iitem++) {
              const item = packs[iitem]
              if (item.id !== undefined) {
                ctx.drawImage(Settings.resName[item.id].img, 0, 0)
                if (iitem !== 1) {
                  ctx.translate(1.0 * this.tileSize, 0.0 * this.tileSize)
                } else {
                  ctx.translate(-1.0 * this.tileSize, 1 * this.tileSize)
                }
              }
            }
            ctx.scale(2, 2)
          }
        }

        ctx.restore()
      }
    }

    // BELTS
    // TBD: Thats is copypasted from loop update
    for (let ibelt = 0; ibelt < beltsToDraw.length;) {
      let belt = beltsToDraw[ibelt]
      if (belt.drawn > 1) ibelt++
      else {
        // go forward until the first belt
        while (belt) {
          const x = belt.pos.x
          const y = belt.pos.y

          const nbPos = Settings.dirToVec[belt.dir]
          const nbTile = Settings.game.map[x + nbPos.x][y + nbPos.y]
          const nbEntity = Settings.allInvs[nbTile[Settings.layers.inv]]
          if (nbEntity?.type === Settings.resDB.belt1.id && // is it a belt?
                      nbEntity.drawn === 1 && // already processed?
                      (nbEntity.searching === false || nbEntity.searching === undefined) && // circular network?
                      Math.abs(belt.dir - nbEntity.dir) !== 2) { // not heading to current belt
            belt.searching = true
            belt = nbEntity
          } else break
        }

        belt.drawItems(ctx)
      }
    }
  }
}

export { ResLayer }
