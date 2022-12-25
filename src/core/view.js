import { Settings, worldToTile } from '../common.js'
import { Button } from './button.js'
import { Dialog } from './dialog.js'
import { Inventory, invfuncs } from './inventory.js'

class ViewModule {
  constructor (windowElement) {
    this.win = windowElement
    this.win.addEventListener('resize', () => {
      this.resize()
    })

    this.size = { x: window.canvas.width, y: window.canvas.height }
    this.scrollFactor = 0.0005
    this.zoomLimit = { min: 0.5, max: 2 }

    window.invMenu = new Dialog()
    window.craftMenu = new Dialog()
    window.entityMenu = new Dialog()
    window.receiptMenu = new Dialog()
    window.selectItemMenu = new Dialog()

    this.createInvMenu()
  }

  resize () {
    window.canvas.width = window.innerWidth
    window.canvas.height = window.innerHeight
    if (window.invMenu) {
      window.invMenu.rect.x = window.canvas.width / 2 - Settings.buttonSize * 8
      window.invMenu.rect.y = window.canvas.height / 2 - Settings.buttonSize * 4
    }

    if (window.craftMenu && window.selectItemMenu) {
      window.craftMenu.rect.x = window.canvas.width / 2 + Settings.buttonSize / 2
      window.craftMenu.rect.y = window.canvas.height / 2 - Settings.buttonSize * 4
      window.craftMenu.rect.w = 8 * Settings.buttonSize
      window.craftMenu.rect.h = 8 * Settings.buttonSize

      window.entityMenu.rect.x = window.craftMenu.rect.x
      window.entityMenu.rect.y = window.craftMenu.rect.y
      window.entityMenu.rect.w = window.craftMenu.rect.w
      window.entityMenu.rect.h = window.craftMenu.rect.h

      window.receiptMenu.rect.w = window.craftMenu.rect.w / 2
      window.receiptMenu.rect.h = window.craftMenu.rect.h

      window.selectItemMenu.rect.x = window.craftMenu.rect.x
      window.selectItemMenu.rect.y = window.craftMenu.rect.y
      window.selectItemMenu.rect.w = window.craftMenu.rect.w
      window.selectItemMenu.rect.h = window.craftMenu.rect.h
    }
  }

  screenToWorld (p) {
    return { x: p.x / this.camera.zoom - this.camera.x, y: p.y / this.camera.zoom - this.camera.y }
  }

  screenToTile (p) {
    return worldToTile(this.screenToWorld(p))
  }

  onZoom (zoomFactor) {
    if (!window.isDragging) {
      const zoomAmount = (1 - zoomFactor)
      const newZoom = this.camera.zoom * zoomAmount
      // console.log(newZoom)
      /* if (DEV) {
                this.camera.zoom = Math.max( this.camera.zoom, Math.max(canvas.width / (gridSize.x * Settings.tileSize), canvas.height / (gridSize.y * Settings.tileSize)))
                this.camera.x += (mousePos.x / this.camera.zoom) - (mousePos.x / (this.camera.zoom / zoomAmount));
                this.camera.y += (mousePos.y / this.camera.zoom) - (mousePos.y / (this.camera.zoom / zoomAmount));
                this.secureBoundaries();
            } else */
      {
        this.camera.zoom = Math.min(this.zoomLimit.max, Math.max(newZoom, this.zoomLimit.min))
        const myMid = {}
        myMid.x = Settings.allInvs[Settings.playerID].pos.x
        myMid.y = Settings.allInvs[Settings.playerID].pos.y - 66
        this.setCamOn(myMid)
      }

      // ws.send(JSON.stringify({cmd: "camera", data: camera}));
    }
  }

  // CRAFT MENU
  updateCraftingMenu () {
    const items = Settings.resDB.player.output
    let pos = 0
    window.craftMenu.items = []
    items.forEach(i => {
      const newButton = new Button((pos % 8) * (Settings.buttonSize), Math.floor(pos / 8) * (Settings.buttonSize), { id: i.id, n: 0 }, window.craftMenu)
      newButton.onClick = () => {
        if (Settings.resName[i.id].lock === undefined) invfuncs.craftToInv(Settings.player, [i])
      }
      newButton.type = 'craft'
      window.craftMenu.items.push(newButton)
      pos++
      if (newButton.x + newButton.w > window.craftMenu.rect.w) window.craftMenu.rect.w = newButton.x + newButton.w
      if (newButton.y + newButton.h > window.craftMenu.rect.h) window.craftMenu.rect.h = newButton.y + newButton.h
    })
  }

  // SELECT ITEM MENU
  updateSelectItemMenu (ent) {
    const items = Settings.resName[ent.type].output
    window.selectItemMenu.items = []
    let pos = 0
    items.forEach(i => {
      const newButton = new Button((pos % 8) * (Settings.buttonSize), Math.floor(pos / 8) * (Settings.buttonSize), { id: i }, window.selectItemMenu)
      newButton.ent = ent
      newButton.onClick = (which, button) => {
        button.ent.setOutput(button.item.id)
        Settings.selEntity.vis = true
        window.selectItemMenu.vis = false
      }
      window.selectItemMenu.items.push(newButton)
      pos++
      if (newButton.x + newButton.w > window.selectItemMenu.rect.w) window.selectItemMenu.rect.w = newButton.x + newButton.w
      if (newButton.y + newButton.h > window.selectItemMenu.rect.h) window.selectItemMenu.rect.h = newButton.y + newButton.h
    })
  }

  updateInventoryMenu (inv) {
    const pack = inv.stack.INV

    if (pack === undefined) return

    for (let i = 0; i < pack.length; i++) {
      const item = pack[i]
      window.invMenu.items[i].item = item
      window.invMenu.items[i].inv = Settings.player
      window.invMenu.items[i].invKey = 'INV'
      window.invMenu.items[i].stackPos = i
    }

    for (let i = pack.length; i < window.invMenu.items.length; i++) {
      window.invMenu.items[i].item = undefined
      window.invMenu.items[i].inv = Settings.player
      window.invMenu.items[i].invKey = 'INV'
      window.invMenu.items[i].stackPos = i
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

  updateEntityMenu (inv, forceUpdate = false) {
    if (inv === undefined) return
    const showStack = inv.stack

    window.entityMenu.vis = true
    const init = window.entityMenu.invID !== inv.id
    const refresh = init || forceUpdate
    window.entityMenu.invID = inv.id
    if (refresh) {
      window.entityMenu.buttons = {}
      window.entityMenu.items = []
    }

    let dx = 128
    let dy = 64
    if (inv.prod) {
      let button
      if (refresh) {
        window.entityMenu.buttons.PROD = []
        button = new Button(dx, dy, undefined, window.entityMenu, Settings.selEntity)
        button.onClick = () => {
          window.view.updateSelectItemMenu(Settings.selEntity)
          window.selectItemMenu.vis = true
        }
        dy += Settings.buttonSize
      } else button = window.entityMenu.buttons.PROD
      button.invKey = 'PROD'
      button.stackPos = 0
      // button.item = item

      if (refresh) window.entityMenu.items.push(button)
      if (refresh) window.entityMenu.buttons.PROD.push(button)
    }

    for (const s of Object.keys(showStack)) {
      dx = 128
      if (refresh) window.entityMenu.buttons[s] = []
      for (let stackPos = 0; stackPos < inv.packsize[s]; stackPos++) {
        const item = showStack[s][stackPos]
        let button
        if (refresh) button = new Button(dx, dy, item, window.entityMenu, Settings.selEntity)
        else button = window.entityMenu.buttons[s][stackPos]
        dx += Settings.buttonSize
        button.invKey = s
        button.stackPos = stackPos
        button.item = item

        if (refresh) window.entityMenu.items.push(button)
        if (refresh) window.entityMenu.buttons[s].push(button)
      }
      dy += Settings.buttonSize
    }
  }
}

export { ViewModule }
