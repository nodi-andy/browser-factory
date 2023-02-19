import { Settings, dist } from '../common.js'
import { invfuncs } from '../core/inventory.js'
import { wssend } from '../core/socket.js'
import * as NC from 'nodicanvas'

// Gets the relevant location from a mouse or single touch event
function getEventLocation (e) {
  if (e.touches && e.touches.length === 1) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY }
  } else if (e.clientX && e.clientY) {
    return { x: e.clientX, y: e.clientY }
  }
}

export class EntityLayer extends NC.NodiGrid {
  constructor (name, gridSize, tileSize, map) {
    super(name, gridSize, tileSize)
    this.map = map
    if (this.map == null) this.map = Array(this.gridSize.x).fill(0).map(() => Array(this.gridSize.y).fill(0).map(() => (undefined)))
  }

  onKeyDown (e) {
    window.player.onKeyDown(e)
    if (e.code === 'Escape') {
      if (Settings.pointer.stack?.INV?.length) {
        invfuncs.moveStack({ fromInvID: Settings.pointer.id, fromInvKey: 'INV', fromStackPos: 0, toInvID: window.player.invID, toInvKey: 'INV' })
      }
      window.invMenu.vis = false
      window.entityMenu.vis = false
      window.craftMenu.vis = false
    }
    if (e.code === 'Enter') {
      this.setOnMap(NC.Vec2.add(window.player.tilePos, Settings.curResPos))
    }
    window.player.stopMining(window.game.allInvs[window.game.playerID])
  }

  onKeyUp (e) {
    window.player.onKeyUp(e)
    if (e.code === 'KeyQ') {
      const searchPack = { id: invfuncs.getInvP(Settings.curTilePos).type, n: 1 }
      const playerInv = window.game.allInvs[window.player.invID]
      const pack = playerInv.hasPack('INV', searchPack)
      if (pack) invfuncs.moveStack({ fromInvID: window.player.invID, fromInvKey: 'INV', fromStackPos: pack, toInvID: Settings.pointer.id, toInvKey: 'INV', toStackPos: 0 })
    }
    if (e.code === 'KeyR') {
      Settings.buildDir = (Settings.buildDir + 1) % 4
    }
    if (e.code === 'KeyE') {
      window.game.updateInventoryMenu(window.player)
      window.invMenu.vis = !window.invMenu.vis
      window.craftMenu.vis = window.invMenu.vis
      if (window.invMenu.vis === false) window.entityMenu.vis = false
    }
    window.player.stopMining(window.game.allInvs[window.game.playerID])
  }

  setOnMap (tileCoordinate) {
    if (Settings.pointer?.stack?.INV == null) return
    if (Settings.pointer?.stack?.INV[0] == null) return
    Settings.pointer.type = Settings.resName[Settings.pointer?.stack?.INV[0].id].type
    if (Settings.pointer.type === 'entity') {
      wssend({ cmd: 'addEntity', data: { pos: { x: tileCoordinate.x, y: tileCoordinate.y }, dir: Settings.buildDir, type: Settings.pointer.stack.INV[0].id } })
    } else {
      wssend({ cmd: 'addItem', data: { pos: tileCoordinate, dir: Settings.buildDir, inv: { item: Settings.pointer.item } } })
    }
    window.isDragStarted = false
    window.isBuilding = true
  }

  onMouseDown (e, hit) {
    if (hit) return
    const worldCordinate = window.game.screenToWorld(getEventLocation(e))
    const tileCoordinate = this.worldToTile(worldCordinate)
    const inv = invfuncs.getInvP(tileCoordinate)

    if (e.buttons === 1) {
      if (window.invMenu.vis) {
        window.invMenu.vis = false
        window.craftMenu.vis = false
        Settings.pointer.item = undefined
        return
      }
      window.dragStart = worldCordinate
      const res = window.res.getResource(tileCoordinate)
      const d = dist(window.game.allInvs[window.game.playerID].pos, worldCordinate)

      if (Settings.pointer?.stack?.INV?.length && (inv == null || inv.type === Settings.resDB.Empty.id)) {
        this.setOnMap(tileCoordinate)
      } else {
        window.isDragStarted = true
        window.isBuilding = false
        if ((res?.id || inv?.id) && d < 5 * Settings.tileSize) window.player.startMining(tileCoordinate, window.game.allInvs[window.game.playerID])
      }

      if (Settings.pointer?.stack?.INV?.length == null || Settings.pointer?.stack?.INV?.length === 0) Settings.pointer.type = undefined
    } else if (e.buttons === 2) {
      this.removeEntity(tileCoordinate)
    }
  }

  removeEntity (tileCoordinate) {
    const inv = this.map[tileCoordinate.x][tileCoordinate.y]
    if (inv) {
      window.game.allInvs[window.game.playerID].addItem({ id: window.game.allInvs[inv].type, n: 1 })
      window.game.allInvs[inv] = undefined

      for (let ix = 0; ix < this.map.length; ix++) {
        for (let iy = 0; iy < this.map[ix].length; iy++) {
          if (this.map[ix][iy] === inv) this.map[ix][iy] = undefined
        }
      }
      // Update Neighbours
      for (const nbV of Settings.nbVec) {
        const nb = invfuncs.getInv(tileCoordinate.x + nbV.x, tileCoordinate.y + nbV.y)
        if (nb?.updateNB) nb.updateNB()
      }
    }
  }

  onMouseMove (e, hit) {
    if (hit) return
    this.extendMouseData(e)
    Settings.curTilePos = { x: e.gridX, y: e.gridY }
    Settings.curResPos.x = e.gridX - window.player.tilePos.x
    Settings.curResPos.y = e.gridY - window.player.tilePos.y
  }

  onMouseUp (e, hit) {
    window.player.stopMining(window.game.allInvs[window.game.playerID])
    if (hit) return

    const worldPos = window.game.screenToWorld({ x: e.offsetX, y: e.offsetY })
    const tilePos = this.worldToTile(worldPos)
    const inv = invfuncs.getInvP(tilePos)

    if (hit === false) {
      if (e.which === 1) {
        // SHOW ENTITY
        if (Settings.pointer?.type == null && inv) {
          const invID = invfuncs.getInvP(tilePos).id
          Settings.selEntity = window.game.allInvs[invID]

          window.game.updateEntityMenu(Settings.selEntity, true)

          if (inv) {
            window.entityMenu.vis = window.invMenu.vis = true; window.craftMenu.vis = false
          } else {
            window.entityMenu.vis = window.invMenu.vis = false; window.craftMenu.vis = true
          }
        }

        if (inv == null) window.entityMenu.vis = false

        window.isDragging = false
        window.dragStart = undefined
        window.isBuilding = false
      }
    }
  }

  render (view) {
    const ctx = view.ctx
    const minTile = this.screenToTile({ x: 0, y: 0 })
    const maxTile = this.screenToTile({ x: ctx.canvas.width, y: ctx.canvas.height })

    // Mark all entities as "still not drawn"
    window.game.allInvs.forEach(e => { if (e) e.drawn = 0 })
    const beltsToDraw = [] // list of belts to draw the items in second stage of drawing
    const entsToDraw = [] // all other items

    // scan all tiles in view
    for (let ay = minTile.y - 3; ay < Math.min(maxTile.y + 5, Settings.gridSize.y); ay++) {
      for (let ax = minTile.x - 3; ax < Math.min(maxTile.x + 2, Settings.gridSize.x); ax++) {
        if (ax < 0 || ay < 0) continue
        // GET TILE
        const invID = this.map[ax][ay]
        let ent
        if (invID !== undefined) {
          ent = window.game.allInvs[invID]
        }

        // ENTITY GROUNDS
        ctx.save()
        ctx.translate(ax * Settings.tileSize, ay * Settings.tileSize)

        if (Settings.resName[ent?.type]?.img && ent.drawn === 0) {
          const type = Settings.resName[ent.type]
          if (type && type.size) {
            ctx.translate(type.size[0] / 2 * Settings.tileSize, type.size[1] / 2 * Settings.tileSize)
            if (Settings.resName[ent.type].rotatable !== false) ctx.rotate(ent.dir * Math.PI / 2)
            ctx.translate(-type.size[0] / 2 * Settings.tileSize, -type.size[1] / 2 * Settings.tileSize)
          }

          if (ent?.draw) ent.draw(ctx)
          else ctx.drawImage(Settings.resName[ent.type].img, 0, 0)
          ent.drawn = 1 // static objects are drawn now

          if (ent.belt) {
            ent.searching = false // no circular dependency for belts
            beltsToDraw.push(ent)
          } else entsToDraw.push(ent)
        }

        // ITEMS ON GROUND
        if (invID !== undefined && window.game.allInvs[invID]?.type === Settings.resDB.Empty.id) {
          const packs = window.game.allInvs[invID].stack.INV
          if (packs) {
            ctx.scale(0.5, 0.5)

            for (let iitem = 0; iitem < packs.length; iitem++) {
              const item = packs[iitem]
              if (item.id !== undefined) {
                ctx.drawImage(Settings.resName[item.id].img, 0, 0)
                if (iitem !== 1) {
                  ctx.translate(1.0 * Settings.tileSize, 0.0 * Settings.tileSize)
                } else {
                  ctx.translate(-1.0 * Settings.tileSize, 1 * Settings.tileSize)
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
    // TBD: This is copypasted from loop update
    for (let ibelt = 0; ibelt < beltsToDraw.length;) {
      let belt = beltsToDraw[ibelt]
      if (belt.drawn > 1) ibelt++
      else {
      // go forward until the first belt
        while (belt) {
          const x = belt.pos.x
          const y = belt.pos.y

          const nbPos = Settings.dirToVec[belt.dir]
          const nbTile = this.map[x + nbPos.x][y + nbPos.y]
          const nbEntity = window.game.allInvs[nbTile]
          if (nbEntity?.belt && // is it a belt?
                    nbEntity.drawn === 1 && // already processed?
                    (nbEntity.searching === false || nbEntity.searching == null) && // circular network?
                    Math.abs(belt.dir - nbEntity.dir) !== 2) { // not heading to current belt
            belt.searching = true
            belt = nbEntity
          } else break
        }

        belt.drawItems(ctx)
      }
    }

    // ITEMS
    for (let ay = minTile.y - 3; ay < Math.min(maxTile.y + 5, Settings.gridSize.y); ay++) {
      for (let ax = minTile.x - 3; ax < Math.min(maxTile.x + 2, Settings.gridSize.x); ax++) {
        if (ax < 0 || ay < 0) continue
        const entID = this.map[ax][ay]
        let ent
        if (entID) ent = window.game.allInvs[entID]
        if (ent?.drawn < 2 && !ent.belt) {
          ctx.save()
          ctx.translate(ax * Settings.tileSize, ay * Settings.tileSize)
          const type = Settings.resName[ent.type]
          if (type?.size) {
            ctx.translate(type.size[0] / 2 * Settings.tileSize, type.size[1] / 2 * Settings.tileSize)
            if (Settings.resName[ent.type].rotatable !== false) ctx.rotate(ent.dir * Math.PI / 2)
            ctx.translate(-type.size[0] / 2 * Settings.tileSize, -type.size[1] / 2 * Settings.tileSize)
          }
          if (ent?.drawItems) ent.drawItems(ctx)
          ent.drawn = 2
          ctx.restore()
        }

        // PLAYERS
        if (ax - 2 === window.player?.tilePos.x && ay === window.player?.tilePos.y) {
          ctx.save()
          window.player.draw(ctx)
          ctx.restore()
        }
      }
    }

    this.drawEntityCandidate(ctx)
  }

  drawEntityCandidate (ctx) {
    if (Settings.pointer?.stack?.INV == null) return
    if (Settings.curResPos == null) return
    if (Settings.pointer.stack.INV.length === 0) return
    // ENTITY CANDIDATE

    const item = Settings.resName[Settings.pointer.stack.INV[0].id]
    if (item) {
      let size = item.size
      if (size == null) size = [1, 1]

      Settings.drawResPos = NC.Vec2.add(window.player.tilePos, Settings.curResPos)
      ctx.save()

      ctx.translate(Settings.drawResPos.x * Settings.tileSize, Settings.drawResPos.y * Settings.tileSize)

      ctx.translate(size[0] / 2 * Settings.tileSize, size[1] / 2 * Settings.tileSize)
      if (item.type === 'entity' && item.rotatable !== false) ctx.rotate(Settings.buildDir * Math.PI / 2)
      ctx.translate(-size[0] / 2 * Settings.tileSize, -size[1] / 2 * Settings.tileSize)

      if (item?.draw) item.draw(ctx, Settings.pointer.item)
      else if (item?.drawItems) item.drawItems(ctx, Settings.pointer.item)
      else ctx.drawImage(item.img, 0, 0)
      if (Settings.pointer.stack.INV[0].n != null) {
        ctx.font = (Settings.buttonSize.y / 2) + 'px Arial'
        ctx.fillStyle = 'white'
        ctx.fillText(Settings.pointer.stack.INV[0].n, 0, 0 + Settings.buttonSize.x)
      }
      ctx.restore()
    }
  }
}
