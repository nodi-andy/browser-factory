import { Settings, dist, rememberBuildDir } from '../common.js'
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
    this.dragEntity = null
    this.rotateEntity = null
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
      const itemId = Settings.pointer?.stack?.INV?.packs[0]?.id
      if (itemId != null) rememberBuildDir(itemId, Settings.buildDir)
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
    if (Settings.pointer?.stack?.INV?.packs[0] == null) return
    const pointerId = Settings.pointer?.stack?.INV.packs[0]?.id
    const pointerItem = classDBi[pointerId]
    if (pointerItem?.type === 'entity') {
      const candidate = { pos: { x: tileCoordinate.x, y: tileCoordinate.y }, dir: Settings.buildDir, type: pointerId }
      if (!Inventory.checkFreeSpace(candidate)) return
      wssend({ cmd: 'addEntityByClick', data: candidate })
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
    const pointerInv = Settings.pointer?.stack?.INV
    const pointerPacks = Array.isArray(pointerInv) ? pointerInv : pointerInv?.packs
    const hasPointerItems = Array.isArray(pointerPacks) && pointerPacks.length > 0
    const isPrimary = e.buttons == null || e.buttons === 1

    const pointerItemId = pointerPacks?.[0]?.id

    if (isPrimary && hasPointerItems && inv && inv.type === pointerItemId && inv.type !== classDB.Empty.id) {
      if (Number.isFinite(inv.dir)) {
        Settings.buildDir = inv.dir
        rememberBuildDir(pointerItemId, inv.dir)
      }
      const pointer = getEventLocation(e)
      this.rotateEntity = {
        ent: inv,
        startPointer: pointer ? { x: pointer.x, y: pointer.y } : null,
        active: false
      }
      window.isBuilding = true
      return
    }

    if (isPrimary && hasPointerItems && (inv == null || inv?.type === classDB.Empty.id)) {
      window.isBuilding = true
      this.setOnMap(tileCoordinate)
      return
    }

    if (isPrimary && !hasPointerItems && inv && inv.type !== classDB.Empty.id) {
      const pointer = getEventLocation(e)
      this.dragEntity = {
        ent: inv,
        startTile: { x: tileCoordinate.x, y: tileCoordinate.y },
        startPointer: pointer ? { x: pointer.x, y: pointer.y } : null,
        active: false
      }
      return
    }

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
        // handled by buildPress for click/drag placement
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

    if (this.rotateEntity?.ent) {
      const pointer = getEventLocation(e)
      if (pointer) {
        const dx = pointer.x - (this.rotateEntity.startPointer?.x || pointer.x)
        const dy = pointer.y - (this.rotateEntity.startPointer?.y || pointer.y)
        if (Math.hypot(dx, dy) > 6) this.rotateEntity.active = true

        const worldPos = game.screenToWorld(pointer)
        const targetTile = this.worldToTile(worldPos)
        const ent = this.rotateEntity.ent
        if (ent && classDBi[ent.type]?.rotatable !== false) {
          const relX = targetTile.x - ent.pos.x
          const relY = targetTile.y - ent.pos.y
          if (Math.abs(relX) > Math.abs(relY)) ent.dir = relX >= 0 ? 0 : 2
          else ent.dir = relY >= 0 ? 1 : 3
          if (ent.updateNB) ent.updateNB()
          Settings.buildDir = ent.dir
          rememberBuildDir(ent.type, ent.dir)
        }
      }
    }

    if (this.dragEntity?.ent) {
      const pointer = getEventLocation(e)
      const canvas = this.view?.canvas || game.canvas
      const viewWidth = canvas?.width || window.innerWidth
      const viewHeight = canvas?.height || window.innerHeight
      const edge = Math.min(viewWidth, viewHeight) * 0.08

      if (pointer) {
        const dx = (pointer.x - (this.dragEntity.startPointer?.x || pointer.x))
        const dy = (pointer.y - (this.dragEntity.startPointer?.y || pointer.y))
        if (Math.hypot(dx, dy) > 8) this.dragEntity.active = true

        if (pointer.x < edge || pointer.x > viewWidth - edge ||
            pointer.y < edge || pointer.y > viewHeight - edge) {
          this.removeEntity(this.dragEntity.startTile)
          this.dragEntity = null
          return
        }

        const worldPos = game.screenToWorld(pointer)
        const targetTile = this.worldToTile(worldPos)
        const ent = this.dragEntity.ent
        if (ent && classDBi[ent.type]?.rotatable !== false) {
          const relX = targetTile.x - ent.pos.x
          const relY = targetTile.y - ent.pos.y
          if (Math.abs(relX) > Math.abs(relY)) ent.dir = relX >= 0 ? 0 : 2
          else ent.dir = relY >= 0 ? 1 : 3
          if (ent.updateNB) ent.updateNB()
          rememberBuildDir(ent.type, ent.dir)
        }
      }
    }

    if (window.isBuilding && (e.buttons == null || e.buttons === 1)) {
      this.setOnMap(window.curTilePos)
    }
  }

  onMouseUp (e, hit) {
    window.player.stopMining(game.allInvs[game.playerID])
    if (hit) return
    if (this.rotateEntity) {
      this.rotateEntity = null
      window.isBuilding = false
      return
    }
    if (this.dragEntity) {
      const wasActive = this.dragEntity.active
      this.dragEntity = null
      if (wasActive) return
    }
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
          const footprint = Inventory.getFootprint(newEntity)
          const emptyIds = []
          for (let i = 0; i < footprint.width; i++) {
            for (let j = 0; j < footprint.height; j++) {
              const x = newEntity.pos.x + i
              const y = newEntity.pos.y + j
              const existing = this.getInv(x, y)
              if (existing?.type === classDB.Empty.id && existing.id != null) {
                emptyIds.push(existing.id)
              }
            }
          }
          newInv.id = invID
          newInv.pos = { x: newEntity.pos.x, y: newEntity.pos.y }
          newInv.dir = newEntity.dir
          newInv.type = newEntity.type
          emptyIds.forEach(emptyId => {
            if (emptyId == null || emptyId === newInv.id) return
            if (game.allInvs[emptyId]?.type === classDB.Empty.id) game.allInvs[emptyId] = null
          })
          for (let i = 0; i < footprint.width; i++) {
            for (let j = 0; j < footprint.height; j++) {
              const x = newEntity.pos.x + i
              const y = newEntity.pos.y + j
              if (this.map?.[x]) this.map[x][y] = newInv.id
            }
          }
          if (newInv.type !== classDB.Empty.id && game?.res?.getResourceXY) {
            let clearedRes = false
            for (let i = 0; i < footprint.width; i++) {
              for (let j = 0; j < footprint.height; j++) {
                const x = newEntity.pos.x + i
                const y = newEntity.pos.y + j
                const resTile = game.res.getResourceXY(x, y)
                if (resTile?.id != null) {
                  resTile.id = undefined
                  resTile.n = 0
                  clearedRes = true
                }
              }
            }
            if (clearedRes) game.res.updateOffscreenMap()
          }
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
    if (view?.markRender) view.markRender()
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
    const canPlace = item.type !== 'entity'
      ? true
      : Inventory.checkFreeSpace({ pos: { x: Settings.drawResPos.x, y: Settings.drawResPos.y }, dir: Settings.buildDir, type: item.id })
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
    if (item.type === 'entity') {
      ctx.save()
      ctx.globalAlpha = 0.25
      ctx.fillStyle = canPlace ? '#00b36b' : '#d11f2a'
      ctx.fillRect(0, 0, size[0] * Settings.tileSize, size[1] * Settings.tileSize)
      ctx.globalAlpha = 0.75
      ctx.lineWidth = Math.max(2, Settings.tileSize * 0.05)
      ctx.strokeStyle = canPlace ? '#00ff99' : '#ff4d4f'
      ctx.strokeRect(0, 0, size[0] * Settings.tileSize, size[1] * Settings.tileSize)
      ctx.restore()
    }
    ctx.restore()
  }
}
