import { Settings, worldToTile, dist } from '../common.js'
import { invfuncs } from './inventory.js'

window.mousePos = { x: 0, y: 0 }
window.isDragging = false
window.dragStart = { x: 0, y: 0 }
window.isDragStarted = false
window.isBuilding = false

// Gets the relevant location from a mouse or single touch event
function getEventLocation (e) {
  if (e.touches && e.touches.length === 1) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY }
  } else if (e.clientX && e.clientY) {
    return { x: e.clientX, y: e.clientY }
  }
}

class InputModule {
  constructor (canvas) {
    this.canvas = canvas
    canvas.addEventListener('pointerdown', this.onPointerDown)
    canvas.addEventListener('pointermove', this.onPointerMove)
    canvas.addEventListener('pointerup', this.onPointerUp)
    canvas.addEventListener('wheel', (e) => window.view.onZoom(e.deltaY * window.view.scrollFactor))
    document.addEventListener('keydown', this.onKeyDown)
    document.addEventListener('keyup', this.onKeyUp)
  }

  onPointerDown (e) {
    let overlayClicked = false
    window.selectItemMenu.items.forEach(b => { if (b.collision(e, b)) { overlayClicked = true } })
    window.invMenu.items.forEach(b => { if (b.collision(e, b)) { overlayClicked = true } })
    window.craftMenu.items.forEach(b => { if (b.collision(e, b)) { overlayClicked = true } })
    window.entityMenu.items.forEach(b => { if (b.collision(e, b)) { overlayClicked = true } })

    if (overlayClicked === false) {
      const worldCordinate = window.view.screenToWorld(getEventLocation(e))
      const tileCoordinate = worldToTile(worldCordinate)
      if (e.buttons === 1) {
        window.dragStart = worldCordinate
        const res = Settings.game.map[tileCoordinate.x][tileCoordinate.y][Settings.layers.res]
        const d = dist(Settings.allInvs[Settings.playerID].pos, worldCordinate)

        if (Settings.pointer?.item?.id) {
          Settings.pointer.type = Settings.resName[Settings.pointer.item.id].type
          if (Settings.pointer.type === 'entity') {
            // wssend({ cmd: 'addEntity', data: { pos: { x: tileCoordinate.x, y: tileCoordinate.y }, dir: Settings.buildDir, type: Settings.pointer.item.id } })
          } else {
            // wssend({ cmd: 'addItem', data: { pos: tileCoordinate, dir: Settings.buildDir, inv: { item: Settings.pointer.item } } })
          }
          window.isDragStarted = false
          window.isBuilding = true
        } else {
          window.isDragStarted = true
          window.isBuilding = false
          if (res?.id && d < 5 * Settings.tileSize) Settings.player.startMining(tileCoordinate, Settings.allInvs[Settings.playerID])
        }
      } else if (e.buttons === 2) {
        const inv = Settings.game.map[tileCoordinate.x][tileCoordinate.y][Settings.layers.inv]
        if (inv) {
          Settings.allInvs[Settings.playerID].addItem({ id: Settings.allInvs[inv].type, n: 1 })
          Settings.allInvs[inv] = undefined
          Settings.game.map[tileCoordinate.x][tileCoordinate.y][Settings.layers.inv] = null
          // Update Neighbours
          for (const nbV of Settings.nbVec) {
            const nb = invfuncs.getInv(tileCoordinate.x + nbV.x, tileCoordinate.y + nbV.y)
            if (nb?.updateNB) nb.updateNB()
          }
        }
      }
    }
  }

  onPointerUp (e) {
    if (Settings.player) Settings.player.stopMining(Settings.allInvs[Settings.playerID])

    let overlayClicked = false
    window.selectItemMenu.items.forEach(b => { if (b.collision(e) && b.onClick) { b.onClick(e.which, b); overlayClicked = true } })
    window.invMenu.items.forEach(b => { if (b.collision(e) && b.onClick) { b.onClick(e.which, b); overlayClicked = true } })
    window.craftMenu.items.forEach(b => { if (b.collision(e) && b.onClick) { b.onClick(e.which, b); overlayClicked = true } })
    window.entityMenu.items.forEach(b => { if (b.collision(e) && b.onClick) { b.onClick(e.which, b); overlayClicked = true } })

    const worldPos = window.view.screenToWorld({ x: e.offsetX, y: e.offsetY })
    const tilePos = worldToTile(worldPos)
    const inv = invfuncs.getInv(tilePos.x, tilePos.y)

    if (overlayClicked === false) {
      if (e.which === 1) {
        // SHOW ENTITY
        if (Settings.pointer?.item?.id === undefined && inv) {
          const invID = invfuncs.getInv(tilePos.x, tilePos.y).id
          Settings.selEntity = Settings.allInvs[invID]

          window.view.updateEntityMenu(Settings.selEntity, true)

          if (inv) { window.entityMenu.vis = window.invMenu.vis = true; window.craftMenu.vis = false } else { window.entityMenu.vis = window.invMenu.vis = false; window.craftMenu.vis = true }
        }

        if (inv === undefined) window.entityMenu.vis = false

        window.isDragging = false
        window.dragStart = undefined
        window.isBuilding = false
      }
    }
  }

  onPointerMove (e) {
    const pointer = getEventLocation(e)
    if (pointer === undefined) return
    window.mousePos.x = pointer.x
    window.mousePos.y = pointer.y

    let isOverlay = false
    window.invMenu.items.forEach(b => { b.hover = b.collision(e); if (b.hover) { isOverlay = true } })
    window.craftMenu.items.forEach(b => { b.hover = b.collision(e); if (b.hover) { isOverlay = true } })
    window.entityMenu.items.forEach(b => { b.hover = b.collision(e); if (b.hover) { isOverlay = true } })
    if (Settings.pointer) Settings.pointer.overlay = isOverlay
    window.receiptMenu.rect.x = window.mousePos.x + 16
    window.receiptMenu.rect.y = window.mousePos.y

    if (isOverlay === false) {
      const tileCoordinate = window.view.screenToTile(window.mousePos)
      window.curResPos = { x: tileCoordinate.x, y: tileCoordinate.y }

      if (e.which === 1) {
        if (window.isBuilding) {
          if ((window.lastResPos.x !== window.curResPos.x || window.lastResPos.y !== window.curResPos.y) && Settings.pointer?.item?.id) {
            if (Settings.pointer.type === 'entity') {
              // wssend({ cmd: 'addEntity', data: { pos: { x: tileCoordinate.x, y: tileCoordinate.y }, dir: Settings.buildDir, type: Settings.pointer.item.id } })
            } else {
              // wssend({ cmd: 'addItem', data: { pos: tileCoordinate, dir: Settings.buildDir, inv: { item: Settings.pointer.item } } })
            }
          }
        } else {
          window.isDragging = true
        }
      }
      window.lastResPos = { x: window.curResPos.x, y: window.curResPos.y }
    }
  }

  onKeyDown (e) {
    if (e.code === 'KeyW') Settings.player.dir.y = -1
    if (e.code === 'KeyS') Settings.player.dir.y = 1
    if (e.code === 'KeyD') Settings.player.dir.x = 1
    if (e.code === 'KeyA') Settings.player.dir.x = -1
    if (e.code === 'KeyF') Settings.player.fetch()
    if (e.code === 'Escape') {
      if (Settings.pointer.item) {
        Settings.player.addItem(Settings.pointer.item)
      }
      Settings.pointer.item = undefined
      window.invMenu.vis = false
      window.entityMenu.vis = false
      window.craftMenu.vis = false
    }
    Settings.player.stopMining(Settings.allInvs[Settings.playerID])
  }

  onKeyUp (e) {
    if (e.code === 'KeyW') Settings.player.dir.y = 0
    if (e.code === 'KeyS') Settings.player.dir.y = 0
    if (e.code === 'KeyD') Settings.player.dir.x = 0
    if (e.code === 'KeyA') Settings.player.dir.x = 0
    if (e.code === 'KeyR') Settings.buildDir = (Settings.buildDir + 1) % 4
    if (e.code === 'KeyE') {
      window.invMenu.vis = !window.invMenu.vis
      window.craftMenu.vis = window.invMenu.vis
      if (window.invMenu.vis === false) window.entityMenu.vis = false
    }
    Settings.player.stopMining(Settings.allInvs[Settings.playerID])
  }
}

export { InputModule }
