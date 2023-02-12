import { Settings } from '../common.js'
import { wssend } from '../core/socket.js'

window.mousePos = { x: 0, y: 0 }
window.isDragging = false
window.dragStart = { x: 0, y: 0 }
window.isDragStarted = false
window.isBuilding = false

class InputModule {
  constructor (canvas) {
    this.canvas = canvas
  }

  onPointerMove (e) {
    const pointer = window.getEventLocation(e)
    if (pointer === undefined) return
    window.mousePos.x = pointer.x
    window.mousePos.y = pointer.y

    let isOverlay = false
    window.invMenu.items.forEach(b => { b.hover = b.collision(e); if (b.hover) { isOverlay = true } })

    window.entityMenu.items.forEach(b => { b.hover = b.collision(e); if (b.hover) { isOverlay = true } })
    if (Settings.pointer) Settings.pointer.overlay = isOverlay

    if (isOverlay === false) {
      const tileCoordinate = window.view.screenToTile(window.mousePos)
      Settings.curResPos.x = tileCoordinate.x
      Settings.curResPos.y = tileCoordinate.y

      if (e.which === 1) {
        if (window.isBuilding) {
          if ((window.lastResPos.x !== Settings.curResPos.x || window.lastResPos.y !== Settings.curResPos.y) && Settings.pointer?.item?.id) {
            if (Settings.pointer.type === 'entity') {
              wssend({ cmd: 'addEntity', data: { pos: { x: tileCoordinate.x, y: tileCoordinate.y }, dir: Settings.buildDir, type: Settings.pointer.item.id } })
            } else {
              wssend({ cmd: 'addItem', data: { pos: tileCoordinate, dir: Settings.buildDir, inv: Settings.pointer } })
            }
          }
        } else {
          window.isDragging = true
        }
      }
      window.lastResPos = { x: Settings.curResPos.x, y: Settings.curResPos.y }
    }
  }
}

export { InputModule }
