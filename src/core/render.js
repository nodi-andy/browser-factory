const times = []
let fps

function render () {
  const ctx = window.context
  if (ctx == undefined) return;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.resetTransform()
  ctx.scale(window.view.camera.zoom, window.view.camera.zoom)
  ctx.translate(window.view.camera.x, window.view.camera.y) // console.log(camera);
  // DRAW TERRAIN
  ctx.drawImage(canvas.offScreenCanvas, 0, 0)

  if (!c.game.map) return

  // Mark all entities as "still not drawn"
  c.allInvs.forEach(e => { if (e) e.drawn = 0 })
  const beltsToDraw = [] // list of belts to draw the items in second stage of drawing
  const entsToDraw = [] // all other items
  // scan all tiles in view
  const minTile = window.view.screenToTile({ x: 0, y: 0 })
  const maxTile = window.view.screenToTile({ x: ctx.canvas.width, y: ctx.canvas.height })
  for (let ay = minTile.y - 3; ay < Math.min(maxTile.y + 5, gridSize.y); ay++) {
    for (let ax = minTile.x - 3; ax < Math.min(maxTile.x + 2, gridSize.x); ax++) {
      if (ax < 0 || ay < 0) continue
      // GET TILE
      const tile = c.game.map[ax][ay]

      const invID = tile[layers.inv]
      let ent
      if (invID != undefined) {
        ent = c.allInvs[invID]
      }

      // DRAW RESOURCES
      type = tile[layers.res].id
      const n = tile[layers.res].n

      if (type && resName[type].img && n) {
        ctx.drawImage(resName[type].img, Math.min(Math.floor(n / 100), 6) * 64, 2, 60, 60, ax * tileSize, ay * tileSize, 64, 64)
      }

      // ENTITY GROUNDS
      ctx.save()
      ctx.translate(ax * tileSize, ay * tileSize)

      if (resName[ent?.type]?.img && ent.drawn == 0) {
        const type = resName[ent.type]
        if (type && type.size) {
          context.translate(type.size[0] / 2 * tileSize, type.size[1] / 2 * tileSize)
          if (resName[ent.type].rotatable != false) context.rotate(ent.dir * Math.PI / 2)
          context.translate(-type.size[0] / 2 * tileSize, -type.size[1] / 2 * tileSize)
        }

        if (ent?.draw) ent.draw(context)
        else context.drawImage(resName[ent.type].img, 0, 0)
        ent.drawn = 1 // static objects are drawn now

        if (ent.type == c.resDB.belt1.id) {
          ent.searching = false // no circular dependency for belts
          beltsToDraw.push(ent)
        } else entsToDraw.push(ent)
      }

      // ITEMS ON GROUND
      if (invID != undefined && c.allInvs[invID]?.type == 'empty') {
        const packs = c.allInvs[invID].stack.INV
        if (packs) {
          context.scale(0.5, 0.5)

          for (let iitem = 0; iitem < packs.length; iitem++) {
            const item = packs[iitem]
            if (item.id != undefined) {
              context.drawImage(resName[item.id].img, 0, 0)
              if (iitem != 1) {
                context.translate(1.0 * tileSize, 0.0 * tileSize)
              } else {
                context.translate(-1.0 * tileSize, 1 * tileSize)
              }
            }
          }
          context.scale(2, 2)
        }
      }

      context.restore()
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

        const nbPos = c.dirToVec[belt.dir]
        const nbTile = c.game.map[x + nbPos.x][y + nbPos.y]
        const nbEntity = c.allInvs[nbTile[c.layers.inv]]
        if (nbEntity?.type == c.resDB.belt1.id && // is it a belt?
                    nbEntity.drawn == 1 && // already processed?
                    (nbEntity.searching == false || nbEntity.searching == undefined) && // circular network?
                    Math.abs(belt.dir - nbEntity.dir) != 2) // not heading to current belt
        {
          belt.searching = true
          belt = nbEntity
        } else break
      }

      belt.drawItems(ctx)
    }
  }

  // ITEMS
  for (let ay = minTile.y - 3; ay < Math.min(maxTile.y + 5, gridSize.y); ay++) {
    for (let ax = minTile.x - 3; ax < Math.min(maxTile.x + 2, gridSize.x); ax++) {
      if (ax < 0 || ay < 0) continue
      const entID = c.game.map[ax][ay][layers.inv]
      let ent
      if (entID) ent = c.allInvs[entID]
      if (ent && ent.drawn < 2 && ent.type != c.resDB.belt1.id) {
        context.save()
        context.translate(ax * tileSize, ay * tileSize)
        const type = resName[ent.type]
        if (type && type.size) {
          context.translate(type.size[0] / 2 * tileSize, type.size[1] / 2 * tileSize)
          if (resName[ent.type].rotatable != false) context.rotate(ent.dir * Math.PI / 2)
          context.translate(-type.size[0] / 2 * tileSize, -type.size[1] / 2 * tileSize)
        }
        if (ent?.drawItems) ent.drawItems(context)
        ent.drawn = 2
        context.restore()
      }

      // PLAYERS
      const entity = c.player
      if (entity.tilePos && ax - 2 == entity.tilePos.x && ay == entity.tilePos.y) {
        c.player.draw(context, entity)
      }
    }
  }

  // ENTITY CANDIDATE
  if (c.pointer?.item && c.pointer.overlay == false) {
    const item = resName[c.pointer.item.id]
    if (item) {
      let size = item.size
      if (size == undefined) size = [1, 1]
      context.save()

      context.translate(curResPos.x * tileSize, curResPos.y * tileSize)

      context.translate(size[0] / 2 * tileSize, size[1] / 2 * tileSize)
      if (item.type == 'entity' && item.rotatable != false) context.rotate(buildDir * Math.PI / 2)
      context.translate(-size[0] / 2 * tileSize, -size[1] / 2 * tileSize)

      if (item.mach?.prototype?.draw) item.mach.prototype.draw(context, c.pointer.item)
      else if (item.mach?.prototype?.drawItems) item.mach.prototype.drawItems(context, c.pointer.item)
      else context.drawImage(item.img, 0, 0)

      context.restore()
    }
  }

  // OVERLAY
  context.resetTransform()
  receiptMenu.item = undefined

  // INVENTORY MENU
  if (invMenu.vis) {
    invMenu.items.forEach(b => b.draw(context))
  }

  // CRAFTING/ENTITY/SELECT ITEM MENU
  drawSelectItemMenu(context)

  // RECEIPT MENU
  drawReceiptMenu(context)

  // CONTENT MENU
  drawContentMenu(context)

  // POINTER ITEM
  if (c.pointer?.item && c.pointer.overlay) {
    const item = c.pointer.item?.id
    if (item) {
      context.save()
      context.translate(mousePos.x, mousePos.y)
      if (item.type == 'entity' && item.rotatable != false) context.rotate(buildDir * Math.PI / 2)
      context.translate(-tileSize / 2, -tileSize / 2)
      if (resName[item]?.mach?.draw) resName[item].mach.draw(context, c.pointer.item)
      else {
        context.drawImage(resName[item].img, 0, 0)
        if (c.pointer.item.n != undefined) {
          ctx.font = '24px Arial'
          ctx.fillStyle = 'white'
          ctx.fillText(c.pointer.item.n, 0, 0 + buttonSize)
        }
      }
      context.restore()
    }
  }

  // FPS
  const now = performance.now()
  while (times.length > 0 && times[0] <= now - 1000) {
    times.shift()
  }
  times.push(now)
  fps = times.length
  context.fillStyle = 'black'
  context.font = '48px Arial'
  context.fillText('FPS: ' + fps, 0, 48)

  requestAnimationFrame(render)
}

function imgLoaded (imgElement) {
  return imgElement.complete && imgElement.naturalHeight !== 0
}

function updateOffscreenMap () {
  if (c.game.map == undefined) return
  canvas.offScreenCanvas.width = gridSize.x * tileSize
  canvas.offScreenCanvas.height = gridSize.y * tileSize
  const offScreencontext = canvas.offScreenCanvas.getContext('2d')
  let hadError = false

  for (let ax = 0; ax < gridSize.x; ax++) {
    for (let ay = 0; ay < gridSize.y; ay++) {
      const tile = c.game.map[ax][ay]

      // MAP
      const type = tile[layers.terrain][0]
      const variant = tile[layers.terrain][1]
      if (resName[type]?.img?.complete) {
        offScreencontext.drawImage(resName[type].img, variant * 64, 0, tileSize, tileSize, ax * tileSize, ay * tileSize, tileSize, tileSize)
      } else {
        if (hadError == false) {
          hadError = true
          setTimeout(updateOffscreenMap, 1000)
        }
      }
    }
  }
}
