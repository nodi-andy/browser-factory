import { Settings } from '../common.js'
import { Button } from '../dialogs/button.js'
import { Inventory, invfuncs } from './inventory.js'
import * as NC from 'nodicanvas'

export class ViewModule extends NC.NodiView {
  constructor (canvas) {
    super(canvas)
    this.size = { x: window.canvas.width, y: window.canvas.height }
    this.scrollFactor = 0.0005
    this.zoomLimit = { min: 0.5, max: 2 }
  }

  resize () {
    window.canvas.width = window.innerWidth
    window.canvas.height = window.innerHeight
    if (window.canvas.width / 2 < window.canvas.height) {
      Settings.buttonSize.x = window.canvas.width / 20
      Settings.buttonSize.y = window.canvas.width / 20
    } else {
      Settings.buttonSize.x = window.canvas.height / 10
      Settings.buttonSize.y = window.canvas.height / 10
    }
    if (window.invMenu) {
      window.invMenu.rect.x = window.canvas.width / 2 - Settings.buttonSize.x * 8.5
      window.invMenu.rect.y = window.canvas.height / 2 - Settings.buttonSize.y * 4
    }

    if (window.craftMenu && window.selectItemMenu) {
      window.craftMenu.rect.x = window.canvas.width / 2 + Settings.buttonSize.x * 0.5
      window.craftMenu.rect.y = window.canvas.height / 2 - Settings.buttonSize.y * 4
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
    this.updateCraftingMenu()
    this.updateInventoryMenu(Settings.player)
    this.redrawEntityMenu()
    this.size = { x: window.canvas.width, y: window.canvas.height }
    super.resize(window.canvas.width, window.canvas.height)
  }

  setCamOn (pos) {
    this.setCamPos(
      {
        x: ((this.size.x / 2) /* / this.sx */) - pos.x,
        y: ((this.size.y / 2) /* / this.sy */) - pos.y
      }
    )
    console.log(pos)
  }

  secureBoundaries () {
    /* if (this.tx > 0) this.tx = 0
    if (this.ty > 0) this.ty = 0
    const boundary = window.view.screenToWorld({ x: this.size.x, y: this.size.y })
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
    const items = Settings.resDB.player.output
    let pos = 0
    window.craftMenu.items = []
    items.forEach(i => {
      const newButton = new Button((pos % 8) * (Settings.buttonSize.x), Math.floor(pos / 8) * (Settings.buttonSize.y), { id: i.id, n: 0 }, window.craftMenu)
      newButton.onClick = () => {
        if (Settings.resName[i.id].lock === undefined) invfuncs.craftToInv(Settings.player, [i])
      }
      newButton.type = 'craft'
      window.craftMenu.items.push(newButton)
      pos++
      if (newButton.x + newButton.size.x > window.craftMenu.rect.w) window.craftMenu.rect.w = newButton.x + newButton.size.x
      if (newButton.y + newButton.size.y > window.craftMenu.rect.h) window.craftMenu.rect.h = newButton.y + newButton.size.y
    })
  }

  // SELECT ITEM MENU
  updateSelectItemMenu (ent) {
    const items = Settings.resName[ent.type].output
    window.selectItemMenu.items = []
    let pos = 0
    items.forEach(i => {
      const newButton = new Button((pos % 8) * (Settings.buttonSize.x), Math.floor(pos / 8) * (Settings.buttonSize.y), { id: i }, window.selectItemMenu)
      newButton.ent = ent
      newButton.onClick = (which, button) => {
        button.ent.setOutput(button.item.id)
        Settings.selEntity.vis = true
        window.selectItemMenu.vis = false
        this.updateEntityMenu(Settings.selEntity, true)
      }
      window.selectItemMenu.items.push(newButton)
      pos++
      if (newButton.x + newButton.w > window.selectItemMenu.rect.w) window.selectItemMenu.rect.w = newButton.x + newButton.w
      if (newButton.y + newButton.h > window.selectItemMenu.rect.h) window.selectItemMenu.rect.h = newButton.y + newButton.h
    })
  }

  updateInventoryMenu (inv) {
    const pack = inv?.stack?.INV

    if (pack === undefined) return

    for (let i = 0; i < pack.length; i++) {
      const item = pack[i]
      window.invMenu.items[i].item = item
      window.invMenu.items[i].inv = Settings.player
      window.invMenu.items[i].invKey = 'INV'
      window.invMenu.items[i].stackPos = i
      window.invMenu.items[i].x = (i % 8) * (Settings.buttonSize.x)
      window.invMenu.items[i].y = Math.floor(i / 8) * (Settings.buttonSize.y)
    }

    for (let i = pack.length; i < window.invMenu.items.length; i++) {
      window.invMenu.items[i].item = undefined
      window.invMenu.items[i].inv = Settings.player
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
      const cost = Settings.resName[craftItem.item.id].cost
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
      button.x = dx
      button.y = dy + Settings.buttonSize.y * i
    }
  }

  updateEntityMenu (inv, forceUpdate = false) {
    const showStack = inv.stack
    if (showStack == null) return

    window.entityMenu.vis = true
    const init = window.entityMenu.invID !== inv.id
    const refresh = init || forceUpdate
    window.entityMenu.invID = inv.id
    if (refresh) {
      window.entityMenu.buttons = {}
      window.entityMenu.items = []
    }

    let dx = Settings.buttonSize.x * 2
    let dy = Settings.buttonSize.y
    if (inv.prod) {
      let button
      if (refresh) {
        window.entityMenu.buttons.PROD = []
        button = new Button(dx, dy, undefined, window.entityMenu, Settings.selEntity)
        button.onClick = () => {
          window.view.updateSelectItemMenu(Settings.selEntity)
          window.selectItemMenu.vis = true
        }
        dy += Settings.buttonSize.y
      } else button = window.entityMenu.buttons.PROD
      button.invKey = 'PROD'
      button.stackPos = 0
      // button.item = item

      if (refresh) window.entityMenu.items.push(button)
      if (refresh) window.entityMenu.buttons.PROD.push(button)
    }

    for (const s of Object.keys(showStack)) {
      dx = Settings.buttonSize.x * 3
      if (refresh) window.entityMenu.buttons[s] = []
      for (let stackPos = 0; stackPos < inv.packsize[s]; stackPos++) {
        const item = showStack[s][stackPos]
        let button
        if (refresh) button = new Button(dx, dy, item, window.entityMenu, Settings.selEntity)
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
