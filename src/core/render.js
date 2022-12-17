import { Settings } from '../common.js'
import { drawContentMenu, drawSelectItemMenu, drawReceiptMenu } from './menus.js'

const times = []
let fps

function render () {
  const ctx = window.context
  if (ctx === undefined) return
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.resetTransform()
  ctx.scale(window.view.camera.zoom, window.view.camera.zoom)
  ctx.translate(window.view.camera.x, window.view.camera.y) // console.log(camera);
  // DRAW TERRAIN
  ctx.drawImage(window.canvas.offScreenCanvas, 0, 0)

  if (!Settings.game.map) return

  // Mark all entities as "still not drawn"
  Settings.allInvs.forEach(e => { if (e) e.drawn = 0 })
  const beltsToDraw = [] // list of belts to draw the items in second stage of drawing
  const entsToDraw = [] // all other items
  // scan all tiles in view
  const minTile = window.view.screenToTile({ x: 0, y: 0 })
  const maxTile = window.view.screenToTile({ x: ctx.canvas.width, y: ctx.canvas.height })
  for (let ay = minTile.y - 3; ay < Math.min(maxTile.y + 5, Settings.gridSize.y); ay++) {
    for (let ax = minTile.x - 3; ax < Math.min(maxTile.x + 2, Settings.gridSize.x); ax++) {
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
        ctx.drawImage(Settings.resName[type].img, Math.min(Math.floor(n / 100), 6) * 64, 2, 60, 60, ax * Settings.tileSize, ay * Settings.tileSize, 64, 64)
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

  // ITEMS
  for (let ay = minTile.y - 3; ay < Math.min(maxTile.y + 5, Settings.gridSize.y); ay++) {
    for (let ax = minTile.x - 3; ax < Math.min(maxTile.x + 2, Settings.gridSize.x); ax++) {
      if (ax < 0 || ay < 0) continue
      const entID = Settings.game.map[ax][ay][Settings.layers.inv]
      let ent
      if (entID) ent = Settings.allInvs[entID]
      if (ent && ent.drawn < 2 && ent.type !== Settings.resDB.belt1.id) {
        ctx.save()
        ctx.translate(ax * Settings.tileSize, ay * Settings.tileSize)
        const type = Settings.resName[ent.type]
        if (type && type.size) {
          ctx.translate(type.size[0] / 2 * Settings.tileSize, type.size[1] / 2 * Settings.tileSize)
          if (Settings.resName[ent.type].rotatable !== false) ctx.rotate(ent.dir * Math.PI / 2)
          ctx.translate(-type.size[0] / 2 * Settings.tileSize, -type.size[1] / 2 * Settings.tileSize)
        }
        if (ent?.drawItems) ent.drawItems(ctx)
        ent.drawn = 2
        ctx.restore()
      }

      // PLAYERS
      const entity = Settings.player
      if (entity.tilePos && ax - 2 === entity.tilePos.x && ay === entity.tilePos.y) {
        Settings.player.draw(ctx, entity)
      }
    }
  }

  // ENTITY CANDIDATE
  if (Settings.pointer?.item && Settings.pointer.overlay === false) {
    const item = Settings.resName[Settings.pointer.item.id]
    if (item) {
      let size = item.size
      if (size === undefined) size = [1, 1]
      ctx.save()

      ctx.translate(window.curResPos.x * Settings.tileSize, window.curResPos.y * Settings.tileSize)

      ctx.translate(size[0] / 2 * Settings.tileSize, size[1] / 2 * Settings.tileSize)
      if (item.type === 'entity' && item.rotatable !== false) ctx.rotate(Settings.buildDir * Math.PI / 2)
      ctx.translate(-size[0] / 2 * Settings.tileSize, -size[1] / 2 * Settings.tileSize)

      if (item.mach?.prototype?.draw) item.mach.prototype.draw(ctx, Settings.pointer.item)
      else if (item.mach?.prototype?.drawItems) item.mach.prototype.drawItems(ctx, Settings.pointer.item)
      else ctx.drawImage(item.img, 0, 0)

      ctx.restore()
    }
  }

  // OVERLAY
  ctx.resetTransform()
  window.receiptMenu.item = undefined

  // INVENTORY MENU
  if (window.invMenu.vis) {
    window.invMenu.items.forEach(b => b.draw(ctx))
  }

  // CRAFTING/ENTITY/SELECT ITEM MENU
  drawSelectItemMenu(ctx)

  // RECEIPT MENU
  drawReceiptMenu(ctx)

  // CONTENT MENU
  drawContentMenu(ctx)

  // POINTER ITEM
  if (Settings.pointer?.item && Settings.pointer.overlay) {
    const item = Settings.pointer.item?.id
    if (item) {
      ctx.save()
      ctx.translate(window.mousePos.x, window.mousePos.y)
      if (item.type === 'entity' && item.rotatable !== false) ctx.rotate(Settings.buildDir * Math.PI / 2)
      ctx.translate(-Settings.tileSize / 2, -Settings.tileSize / 2)
      if (Settings.resName[item]?.mach?.draw) Settings.resName[item].mach.draw(ctx, Settings.pointer.item)
      else {
        ctx.drawImage(Settings.resName[item].img, 0, 0)
        if (Settings.pointer.item.n !== undefined) {
          ctx.font = '24px Arial'
          ctx.fillStyle = 'white'
          ctx.fillText(Settings.pointer.item.n, 0, 0 + Settings.buttonSize)
        }
      }
      ctx.restore()
    }
  }

  // FPS
  const now = performance.now()
  while (times.length > 0 && times[0] <= now - 1000) {
    times.shift()
  }
  times.push(now)
  fps = times.length
  ctx.fillStyle = 'black'
  ctx.font = '48px Arial'
  ctx.fillText('FPS: ' + fps, 0, 48)

  requestAnimationFrame(render)
}

function imgLoaded (imgElement) {
  return imgElement.complete && imgElement.naturalHeight !== 0
}

function updateOffscreenMap () {
  if (Settings.game.map === undefined) return
  window.canvas.offScreenCanvas.width = Settings.gridSize.x * Settings.tileSize
  window.canvas.offScreenCanvas.height = Settings.gridSize.y * Settings.tileSize
  const offScreencontext = window.canvas.offScreenCanvas.getContext('2d')
  let hadError = false

  for (let ax = 0; ax < Settings.gridSize.x; ax++) {
    for (let ay = 0; ay < Settings.gridSize.y; ay++) {
      const tile = Settings.game.map[ax][ay]

      // MAP
      const type = tile[Settings.layers.terrain][0]
      const variant = tile[Settings.layers.terrain][1]
      if (Settings.resName[type]?.img?.complete) {
        offScreencontext.drawImage(Settings.resName[type].img, variant * 64, 0, Settings.tileSize, Settings.tileSize, ax * Settings.tileSize, ay * Settings.tileSize, Settings.tileSize, Settings.tileSize)
      } else {
        if (hadError === false) {
          hadError = true
          setTimeout(updateOffscreenMap, 1000)
        }
      }
    }
  }
}

export { render, updateOffscreenMap, imgLoaded }
