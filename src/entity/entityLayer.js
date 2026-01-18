import { Settings, dist } from '../common.js'
import { Inventory } from '../core/inventory.js'
import { wssend } from '../core/socket.js'
import * as NC from 'nodicanvas'
import { Empty } from './empty/empty.js'

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
      if (Settings.pointer?.stack?.INV?.packs.length) {
        Inventory.moveStack({ fromInvID: Settings.pointer.id, fromInvKey: 'INV', fromStackPos: 0, toInvID: window.player.invID, toInvKey: 'INV' })
      }
      window.invMenu.vis = false
      window.entityMenu.vis = false
      window.craftMenu.vis = false
    }
    if (e.code === 'Enter') {
      this.setOnMap(NC.Vec2.add(window.player.tilePos, window.curResPos))
    }
    window.player.stopMining(game.allInvs[game.playerID])
  }

  onKeyUp (e) {
    window.player.onKeyUp(e)
    if (e.code === 'KeyQ') {
      const searchPack = { id: this.getInvP(window.curTilePos).type, n: 1 }
      const playerInv = game.allInvs[window.player.invID]
      const pack = playerInv.hasPack('INV', searchPack)
      if (pack) Inventory.moveStack({ fromInvID: window.player.invID, fromInvKey: 'INV', fromStackPos: pack, toInvID: Settings.pointer.id, toInvKey: 'INV', toStackPos: 0 })
    }
    if (e.code === 'KeyR') {
      Settings.buildDir = (Settings.buildDir + 1) % 4
    }
    if (e.code === 'KeyE') {
      game.updateInventoryMenu(window.player)
      window.invMenu.vis = !window.invMenu.vis
      window.craftMenu.vis = window.invMenu.vis
      if (window.invMenu.vis === false) window.entityMenu.vis = false
    }
    window.player.stopMining(game.allInvs[game.playerID])
  }

  setOnMap (tileCoordinate) {
    window.isBuilding = true
    if (Settings.pointer?.stack?.INV?.packs[0] == null) return
    if (classDBi[Settings.pointer?.stack?.INV.packs[0]?.id].type === 'entity') {
      wssend({ cmd: 'addEntityByClick', data: { pos: { x: tileCoordinate.x, y: tileCoordinate.y }, dir: Settings.buildDir, type: Settings.pointer?.stack?.INV.packs[0]?.id } })
    } else {
      wssend({ cmd: 'addItem', data: { pos: tileCoordinate, dir: Settings.buildDir, inv: { item: Settings.pointer.item } } })
    }
    window.isDragStarted = false
  }

  onMouseDown (e, hit) {
    if (hit) return
    const worldCordinate = game.screenToWorld(getEventLocation(e))
    const tileCoordinate = this.worldToTile(worldCordinate)
    const inv = this.getInvP(tileCoordinate)

    if (e.buttons === 1) {
      if (window.invMenu.vis) {
        window.invMenu.vis = false
        window.craftMenu.vis = false
        Settings.pointer.item = undefined
      }
      window.dragStart = worldCordinate
      const res = game.res.getResource(tileCoordinate)
      const d = dist(game.allInvs[game.playerID].pos, worldCordinate)

      if (Settings.pointer?.stack?.INV?.packs.length) {
        if (inv == null || inv?.type === classDB.Empty.id) {
          this.setOnMap(tileCoordinate)
        }
      } else {
        window.isDragStarted = true
        window.isBuilding = false
        if ((res?.id || inv?.id) && d < 5 * Settings.tileSize) window.player.startMining(tileCoordinate, game.allInvs[game.playerID])
      }

    } else if (e.buttons === 2) {
      const inv = this.getInvP(tileCoordinate)
      if (inv?.type !== classDB.Empty.id) {
        this.removeEntity(tileCoordinate)
      }
    }
  }

  removeEntity (tileCoordinate) {
    const inv = this.getInvP(tileCoordinate)
    if (inv) {
      game.allInvs[game.playerID].addItem({ id: inv.type, n: 1 })
      game.allInvs[inv.id] = undefined

      for (let ix = 0; ix < this.map.length; ix++) {
        for (let iy = 0; iy < this.map[ix].length; iy++) {
          if (this.getInv(ix, iy) === inv) this.setInv(ix, iy, undefined)
        }
      }
      // Update Neighbours
      for (const nbV of Settings.nbVec) {
        const nb = this.getInv(tileCoordinate.x + nbV.x, tileCoordinate.y + nbV.y)
        if (nb?.updateNB) nb.updateNB()
      }
    }
  }

  onMouseMove (e, hit) {
    if (hit) return
    this.extendMouseData(e)
    window.curTilePos = { x: e.gridX, y: e.gridY }
    window.curResPos.x = e.gridX - window.player.tilePos.x
    window.curResPos.y = e.gridY - window.player.tilePos.y

    console.log(game.entityLayer.getInvP(window.curTilePos))

    if (window.isBuilding) {
      this.setOnMap(window.curTilePos)
    }
  }

  onMouseUp (e, hit) {
    window.player.stopMining(game.allInvs[game.playerID])
    if (hit) return

    const worldPos = game.screenToWorld({ x: e.offsetX, y: e.offsetY })
    const tilePos = this.worldToTile(worldPos)
    const inv = this.getInvP(tilePos)

    if (hit === false) {
      if (e.which === 1) {
        window.selEntity = null
        // SHOW ENTITY
        if (Settings.pointer?.stack.INV.packs[0]?.id == null && inv) {
          const invID = this.getInvP(tilePos).id
          window.selEntity = game.allInvs[invID]
          game.updateSelectItemMenu(window.selEntity)
          game.updateEntityMenu(window.selEntity, true)

          if (inv) {
            window.entityMenu.vis = window.invMenu.vis = true; window.craftMenu.vis = false
          } else {
            window.entityMenu.vis = window.invMenu.vis = false; window.craftMenu.vis = true
          }
        }

        if (inv == null) {
          window.entityMenu.vis = false
          window.selectItemMenu.vis = false
        }

        window.isDragging = false
        window.dragStart = undefined
        window.isBuilding = false
      }
    }
  }

  getInv (x, y, create = false) {
    if (x < 0) return
    if (y < 0) return
    if (x >= this.map.length) return
    if (y >= this.map[0].length) return
  
    let tile = this.map[x][y]
    if ((tile == null || game.allInvs[tile] == null) && create) this.addEntity({pos: {x: x, y : y}, type: Empty.id})
    return game.allInvs[tile]
  }

  setInv (x, y, invID) {
    game.entityLayer.map[x][y] = invID
  }

  getInvP (p, create = false) {
    return this.getInv(p.x, p.y, create)
  }

  addEntityFromCursor (newEntity, updateDir) {
    if (!newEntity) return
    let inv = game.entityLayer.getInv(newEntity.pos.x, newEntity.pos.y)
    let pack = Settings.pointer?.stack?.INV.packs[0];

    if ((inv == null || inv?.type === classDB.Empty.id) && pack?.n > 0) {
       if (this.addEntity(newEntity)) {
          pack.n--
          if (Settings.pointer?.stack?.INV.packs[0].n === 0) {
            delete Settings.pointer?.stack?.INV.packs.splice(0, 1);
            window.isBuilding = false
          }
      }
    }  
    if (inv) return inv.id
  }

  addEntity (newEntity) {
    if (!newEntity) return
    let inv = game.entityLayer.getInv(newEntity.pos.x, newEntity.pos.y)
    let newInv;
    if (inv == null || inv?.type === classDB.Empty.id) {
        const invID = Inventory.createInv(newEntity)
        if (invID != null) {
          newInv = game.allInvs[invID]
          if (inv?.type === classDB.Empty.id) {
            newInv.addStack("INV", inv.stack);
            game.allInvs[inv.id] = null;
          }
          newInv.id = invID
          newInv.pos = { x: newEntity.pos.x, y: newEntity.pos.y }
          newInv.dir = newEntity.dir
          newInv.type = newEntity.type
          game.entityLayer.map[newEntity.pos.x][newEntity.pos.y] = newInv.id
          if (newInv?.updateNB) newInv.updateNB()
          if (typeof window !== 'undefined') game.updateInventoryMenu(window.player)
        }
        // Update Neighbours
        for (const nbV of Settings.nbVec) {
          const nb = game.entityLayer.getInv(newEntity.pos.x + nbV.x, newEntity.pos.y + nbV.y)
          if (nb?.updateNB) nb.updateNB()
        }
    }  
    if (newInv) return newInv.id
  }

  render (view) {
    const ctx = view.ctx
    const minTile = this.screenToTile({ x: 0, y: 0 })
    const maxTile = this.screenToTile({ x: ctx.canvas.width, y: ctx.canvas.height })

    // Mark all entities as "still not drawn"
    game.allInvs.forEach(e => { if (e) e.drawn = 0 })
    const beltsToDraw = [] // list of belts to draw the items in second stage of drawing
    const entsToDraw = [] // all other items

    game.allInvs.forEach(ent => {
      if (ent?.pos == null) return
      if (ent?.name == "Player" || ent.constructor.name == "Inventory") return
      let name = ent.constructor.name;
      let ax = ent.pos.x
      let ay = ent.pos.y
      const invID = this.getInvP(ent.pos)
      // ENTITY GROUNDS
      ctx.save()
      ctx.translate(ax * Settings.tileSize, ay * Settings.tileSize)

      if (classDBi[ent?.type]?.img && ent.drawn === 0) {
        const type = classDBi[ent.type]
        if (type && type.size) {
          ctx.translate(type.size[0] / 2 * Settings.tileSize, type.size[1] / 2 * Settings.tileSize)
          if (window.classDB[name].rotatable !== false) ctx.rotate(ent.dir * Math.PI / 2)
          ctx.translate(-type.size[0] / 2 * Settings.tileSize, -type.size[1] / 2 * Settings.tileSize)
        }

        //ctx.font = '10px Arial'
        //ctx.fillStyle = 'green'
        //ctx.fillText(ent.id, 0, 0)
        
        if (ent?.draw) ent.draw(ctx)
        else ctx.drawImage(classDBi[ent.type].img, 0, 0)
        ent.drawn = 1 // static objects are drawn now

        if (ent.isBelt) {
          ent.searching = false // no circular dependency for belts
          beltsToDraw.push(ent)
        } else entsToDraw.push(ent)
      }



      ctx.restore()
    })
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
          const nbEntity = game.allInvs[nbTile]
          if (nbEntity?.isBelt && // is it a belt?
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
    game.allInvs.forEach(ent => {
      if (ent == null) return
      if (ent.pos == null) return
      if (ent.constructor.name == "Inventory") return
      if (ent.constructor.name == "Player") return

      if (ent?.drawn < 2 && !ent.isBelt && ent?.drawItems) {
        ctx.save()
        ctx.translate(ent.pos.x * Settings.tileSize, ent.pos.y * Settings.tileSize)
        const type = classDBi[ent.type]
        if (type?.size) {
          ctx.translate(type.size[0] / 2 * Settings.tileSize, type.size[1] / 2 * Settings.tileSize)
          if (classDBi[ent.type].rotatable !== false) ctx.rotate(ent.dir * Math.PI / 2)
          ctx.translate(-type.size[0] / 2 * Settings.tileSize, -type.size[1] / 2 * Settings.tileSize)
        }
        ent.drawItems(ctx)
        ent.drawn = 2
        ctx.restore()
      }
    })
    // PLAYERS
    ctx.save()
    window.player.draw(ctx)
    ctx.restore()

    this.drawEntityCandidate(ctx)
  }

  drawEntityCandidate (ctx) {
    if (window.curResPos == null) return
    const invStack = Settings.pointer?.stack?.INV
    if (invStack == null) return
    const packs = Array.isArray(invStack) ? invStack : invStack.packs
    if (!Array.isArray(packs) || packs.length === 0) return
    const firstPack = packs[0]
    if (!firstPack || firstPack.id == null) return
    // ENTITY CANDIDATE

    const item = classDBi[firstPack.id]
    if (item == null) return
    let size = item.size
    if (size == null) size = [1, 1]

    Settings.drawResPos = NC.Vec2.add(window.player.tilePos, window.curResPos)
    ctx.save()

    ctx.translate(Settings.drawResPos.x * Settings.tileSize, Settings.drawResPos.y * Settings.tileSize)

    ctx.translate(size[0] / 2 * Settings.tileSize, size[1] / 2 * Settings.tileSize)
    if (item.type === 'entity' && item.rotatable !== false) ctx.rotate(Settings.buildDir * Math.PI / 2)
    ctx.translate(-size[0] / 2 * Settings.tileSize, -size[1] / 2 * Settings.tileSize)

    if (item.draw) item.draw(ctx, Settings.pointer.item)
    else if (item.drawItems) item.drawItems(ctx, Settings.pointer.item)
    else if (item.prototype.draw) item.prototype.draw(ctx, Settings.pointer.item)
    else if (item.prototype.drawItems) item.prototype.drawItems(ctx, Settings.pointer.item)
    else ctx.drawImage(item.img, 0, 0)

    if (firstPack.n != null) {
      ctx.font = (Settings.buttonSize.y / 2) + 'px Arial'
      ctx.fillStyle = 'white'
      ctx.fillText(firstPack.n, 0, 0 + Settings.buttonSize.x)
    }
    ctx.restore()
  }
}
