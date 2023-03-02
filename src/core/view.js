import { Settings } from '../common.js'
import { Button } from '../dialogs/button.js'
import { Inventory,  } from './inventory.js'
import * as NC from 'nodicanvas'

export class ViewModule extends NC.NodiView {
  constructor (canvas) {
    super(canvas)
    this.scrollFactor = 0.0005
    this.zoomLimit = { min: 0.5, max: 2 }
    this.tick = 0
    this.savedCanvas = this.canvas
  }

  stop() {
    document.body.removeChild(window.game.canvas)
    this.setCanvas(null)
    this.ctx = null
    window.game.state = window.gameState.stopped
    window.game.time.stop()
  }

  start() {
    this.setCanvas(this.savedCanvas)
    this.ctx = this.canvas.getContext('2d')
    window.game.state = window.gameState.running
    window.game.time.start()
  }

  resize () {
    if (this.canvas == null) return
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    if (this.canvas.width / 2 < this.canvas.height) {
      Settings.buttonSize.x = this.canvas.width / 20
      Settings.buttonSize.y = this.canvas.width / 20
    } else {
      Settings.buttonSize.x = this.canvas.height / 10
      Settings.buttonSize.y = this.canvas.height / 10
    }
    if (window.invMenu) {
      window.invMenu.rect.x = this.canvas.width / 2 - Settings.buttonSize.x * 8.5
      window.invMenu.rect.y = this.canvas.height / 2 - Settings.buttonSize.y * 4
    }

    if (window.craftMenu && window.selectItemMenu) {
      window.craftMenu.rect.x = this.canvas.width / 2 + Settings.buttonSize.x * 0.5
      window.craftMenu.rect.y = this.canvas.height / 2 - Settings.buttonSize.y * 4
      window.craftMenu.rect.w = 8 * Settings.buttonSize.x
      window.craftMenu.rect.h = 8 * Settings.buttonSize.y

      window.entityMenu.rect.x = window.craftMenu.rect.x
      window.entityMenu.rect.y = window.craftMenu.rect.y
      window.entityMenu.rect.w = window.craftMenu.rect.w
      // window.entityMenu.rect.h = window.craftMenu.rect.h

      window.receiptMenu.rect.w = window.craftMenu.rect.w / 2
      window.receiptMenu.rect.h = window.craftMenu.rect.h

      window.selectItemMenu.rect.x = window.craftMenu.rect.x
      window.selectItemMenu.rect.y = window.craftMenu.rect.y
      window.selectItemMenu.rect.w = window.craftMenu.rect.w
      window.selectItemMenu.rect.h = window.craftMenu.rect.h
    }
    if (window.player?.invID !== null) this.updateCraftingMenu()
    this.updateInventoryMenu(window.player)
    this.redrawEntityMenu()
    this.canvasSize = { x: this.canvas.width, y: this.canvas.height }

  }

  setCamOn (pos) {
    this.setCamPos(
      {
        x: ((this.canvasSize.x / 2) /* / this.sx */) - pos.x,
        y: ((this.canvasSize.y / 2) /* / this.sy */) - pos.y
      }
    )
    console.log(pos)
  }

  secureBoundaries () {
    /* if (this.tx > 0) this.tx = 0
    if (this.ty > 0) this.ty = 0
    const boundary = game.screenToWorld({ x: this.size.x, y: this.size.y })
    if (boundary.x > Settings.gridSize.x * Settings.tileSize) this.tx = this.width / this.sx - (Settings.gridSize.x * Settings.tileSize)
    if (boundary.y > Settings.gridSize.y * Settings.tileSize) this.ty = this.height / this.sy - (Settings.gridSize.y * Settings.tileSize) */
  }

  setCamPos (pos) {
    this.tx = pos.x
    this.ty = pos.y
    // console.log(this.camera);
    this.secureBoundaries()
  }

  onZoom (zoomFactor) {
    if (!window.isDragging) {
      const zoomAmount = (1 - zoomFactor)
      const newZoom = this.sx * zoomAmount
      // console.log(newZoom)*/
      /* if (DEV) {
                this.camera.zoom = Math.max( this.camera.zoom, Math.max(canvas.width / (gridSize.x * Settings.tileSize), canvas.height / (gridSize.y * Settings.tileSize)))
                this.camera.x += (mousePos.x / this.camera.zoom) - (mousePos.x / (this.camera.zoom / zoomAmount));
                this.camera.y += (mousePos.y / this.camera.zoom) - (mousePos.y / (this.camera.zoom / zoomAmount));
                this.secureBoundaries();
            } else */
      this.setScale(Math.min(this.zoomLimit.max, Math.max(newZoom, this.zoomLimit.min)))
      // ws.send(JSON.stringify({cmd: "camera", data: camera}));
    }
  }

  // CRAFT MENU
  updateCraftingMenu () {
    if (!window.craftMenu) return
    if (!window.player) return

    const items = window.player.output
    let pos = 0
    window.craftMenu.items = []
    items.forEach(item => {
      let i = window.classDB[item]
      if (i == null) return
      const newButton = new Button((pos % 8) * (Settings.buttonSize.x), Math.floor(pos / 8) * (Settings.buttonSize.y), { id: i.id, n: 0 }, window.craftMenu, window.player.invID)
      newButton.onClick = () => {
        Inventory.craftToInv(window.player, [i])
      }
      window.craftMenu.items.push(newButton)
      pos++
      if (newButton.x + newButton.size.x > window.craftMenu.rect.w) window.craftMenu.rect.w = newButton.x + newButton.size.x
      if (newButton.y + newButton.size.y > window.craftMenu.rect.h) window.craftMenu.rect.h = newButton.y + newButton.size.y
    })
  }

  // SELECT ITEM MENU
  updateSelectItemMenu (ent) {
    if (ent.output == null) return
    const items = ent.output
    window.selectItemMenu.items = []
    let pos = 0
    items.forEach(item => {
      const newButton = new Button((pos % 8) * (Settings.buttonSize.x), Math.floor(pos / 8) * (Settings.buttonSize.y), { id: classDB[item].id }, window.selectItemMenu)
      newButton.ent = ent
      newButton.onClick = (which, button) => {
        button.ent.setOutput(button.item.id)
        window.selectItemMenu.vis = false
        window.entityMenu.vis = true
        this.updateEntityMenu(window.selEntity, true)
      }
      window.selectItemMenu.items.push(newButton)
      pos++
      if (newButton.x + newButton.w > window.selectItemMenu.rect.w) window.selectItemMenu.rect.w = newButton.x + newButton.w
      if (newButton.y + newButton.h > window.selectItemMenu.rect.h) window.selectItemMenu.rect.h = newButton.y + newButton.h
    })
  }

  updateInventoryMenu (inv) {
    if (inv == null || window.invMenu == null) return
    if(window.player == null) return

    const pack = inv?.stack?.INV

    if (pack == null) return

    for (let i = 0; i < pack.length; i++) {
      const item = pack[i]
      window.invMenu.items[i].item = item
      window.invMenu.items[i].invID = window.player.invID
      window.invMenu.items[i].invKey = 'INV'
      window.invMenu.items[i].stackPos = i
      window.invMenu.items[i].x = (i % 8) * (Settings.buttonSize.x)
      window.invMenu.items[i].y = Math.floor(i / 8) * (Settings.buttonSize.y)
    }

    for (let i = pack.length; i < window.invMenu.items.length; i++) {
      window.invMenu.items[i].item = undefined
      window.invMenu.items[i].invID = window.player.invID
      window.invMenu.items[i].invKey = 'INV'
      window.invMenu.items[i].stackPos = i
      window.invMenu.items[i].x = (i % 8) * (Settings.buttonSize.x)
      window.invMenu.items[i].y = Math.floor(i / 8) * (Settings.buttonSize.y)
    }

    for (const craftItem of window.craftMenu.items) {
      const tInv = new Inventory()
      tInv.stack = JSON.parse(JSON.stringify(inv.stack))
      tInv.stack.INV.size = 64
      tInv.packsize = inv.packsize
      tInv.itemsize = inv.itemsize
      const cost = classDBi[craftItem.item.id].cost
      craftItem.item.n = 0
      if (cost) {
        while (tInv.remItems(cost)) craftItem.item.n++ // how much can be build
      }
    }
  }

  redrawEntityMenu () {
    if (!window.entityMenu?.buttons) return
    const dx = Settings.buttonSize.x * 3
    const dy = Settings.buttonSize.y
    const v = Object.values(window.entityMenu.buttons)
    for (let i = 0; i < v.length; i++) {
      const button = v[i][0]
      if (button) {
        button.x = dx
        button.y = dy + Settings.buttonSize.y * i
      }
    }
  }

  updateEntityMenu (inv, forceUpdate = false) {
    if (inv == null) return
    const showStack = inv.stack
    if (showStack == null) return

    const init = window.entityMenu.invID !== inv.id
    const refresh = init || forceUpdate
    window.entityMenu.invID = inv.id
    if (refresh) {
      window.entityMenu.buttons = {}
      window.entityMenu.items = []
    }

    let dx = Settings.buttonSize.x * 2
    let dy = Settings.buttonSize.y
    if (inv.selectedItem) {
      let button = new Button(dx, dy, undefined, window.entityMenu, window.selEntity.id)
      if (refresh) {
        window.entityMenu.buttons.PROD = []
        button.onClick = () => {
          game.updateSelectItemMenu(window.selEntity)
          window.selectItemMenu.vis = true
          window.entityMenu.vis = false
        }
        dy += Settings.buttonSize.y
      } else button = window.entityMenu.buttons.PROD
      button.invKey = 'PROD'
      button.stackPos = 0

      if (refresh) window.entityMenu.items.push(button)
      if (refresh) window.entityMenu.buttons.PROD.push(button)
    }
    for (const s of Object.keys(showStack)) {
      dx = Settings.buttonSize.x * 3
      if (refresh) window.entityMenu.buttons[s] = []
      for (let stackPos = 0; stackPos < inv.packsize[s]; stackPos++) {
        const item = showStack[s][stackPos]
        let button
        if (refresh) button = new Button(dx, dy, item, window.entityMenu, window.selEntity.id)
        else button = window.entityMenu.buttons[s][stackPos]
        dx += Settings.buttonSize.x
        button.invKey = s
        button.stackPos = stackPos
        button.item = item

        if (refresh) window.entityMenu.items.push(button)
        if (refresh) window.entityMenu.buttons[s].push(button)
      }
      dy += Settings.buttonSize.y
    }
    this.redrawEntityMenu()
  }
}
