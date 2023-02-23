import { Settings } from '../common.js'
import { Inventory } from '../core/inventory.js'

export class Button {
  constructor (x, y, item, parent, invID) {
    this.x = x
    this.y = y
    this.size = Settings.buttonSize
    this.item = item
    this.invID = invID
    this.invKey = ''
    this.stackPos = 0
    this.parent = parent
    this.hover = false
    if (this.parent) this.screen = { x: this.parent.rect.x + this.x, y: this.parent.rect.y + this.y }
    else this.screen = { x: 0, y: 0 }
  }

  collision (p) {
    if (this.parent) {
      if (this.parent?.vis === false || this.screen.x < this.parent.rect.x || this.screen.x > (this.parent.rect.x + this.parent.w)) return false
    }
    if (p.x <= this.screen.x) return false
    if (p.y <= this.screen.y) return false
    if (p.x >= this.screen.x + this.size.x) return false
    if (p.y >= this.screen.y + this.size.y) return false
    return true
  }

  draw (ctx) {
    if (this.parent?.vis === false) return

    if (this.parent) this.screen = { x: this.parent.rect.x + this.x, y: this.parent.rect.y + this.y }
    else this.screen = { x: this.x, y: this.y }
    ctx.beginPath()

    if (this.hover) {
      if (this.parent == window.craftMenu) window.receiptMenu.item = this.item
      else window.receiptMenu.item = undefined
    }

    if (this.hover) ctx.fillStyle = 'rgba(100, 100, 0, 1)'
    else ctx.fillStyle = 'rgba(60, 60, 60, 0.9)'
    ctx.rect(this.screen.x, this.screen.y, this.size.x, this.size.y)
    ctx.fill()
    ctx.stroke()
    if (this.item == null && this.inv?.stack && this.inv.stack[this.invKey] && this.inv.stack[this.invKey][this.stackPos]) {
      this.item = this.inv.stack[this.invKey][this.stackPos]
    }
    this.drawItem(ctx)
  }

  drawItem (ctx) {
    if (this.img) { // special image
      ctx.drawImage(this.img, this.screen.x, this.screen.y, Settings.buttonSize.x, Settings.buttonSize.y)
    }

    if (this.item == null) return

    if (this.item?.id && Settings.resName[this.item.id].img) { // standard image
      try {
        ctx.drawImage(Settings.resName[this.item.id].img, this.screen.x + 2, this.screen.y + 2, Settings.buttonSize.x, Settings.buttonSize.y)
      } catch {
      }
    }

    if (this.item?.id && Settings.resName[this.item.id].lock) {
      ctx.beginPath()
      ctx.fillStyle = 'rgb(200, 100, 100, 0.3)'
      ctx.rect(this.screen.x, this.screen.y, Settings.buttonSize.x, Settings.buttonSize.y)
      ctx.fill()
    }

    if (this.item?.n !== undefined) {
      ctx.font = (Settings.buttonSize.y / 2) + 'px Arial'
      ctx.fillStyle = 'white'
      ctx.fillText(this.item.n, this.screen.x, this.screen.y + Settings.buttonSize.y)
    }
  }

  onClick (button) {
    if (this.item?.id && Settings.resName[this.item?.id].lock === 1) return
    if (button === 1) {
      if (Settings.pointer?.stack?.INV?.length) {
        if (Settings.pointer?.stack?.INV[0].id === window.game.allInvs[this.invID].stack[this.invKey][this.stackPos]?.id) {
          Inventory.moveStack({ fromInvID: Settings.pointer.id, fromInvKey: 'INV', fromStackPos: 0, toInvID: this.invID, toInvKey: this.invKey, toStackPos: this.stackPos })
        } else {
          Inventory.moveStack({ fromInvID: Settings.pointer.id, fromInvKey: 'INV', fromStackPos: 0, toInvID: this.invID, toInvKey: this.invKey })
        }
      } else {
        Inventory.moveStack({ fromInvID: this.invID, fromInvKey: this.invKey, fromStackPos: this.stackPos, toInvID: Settings.pointer.id, toInvKey: 'INV', toStackPos: 0 })
        Settings.curResPos.x = 0
        Settings.curResPos.y = -2
      }
    } else if (button === 3) {
      let buttonInv = window.game.allInvs[this.invID]
      let pack = buttonInv.stack[this.invKey][this.stackPos]
      if (Settings.pointer.stack.INV == undefined || Settings.pointer.stack.INV.length == 0) {
        let transfer = Math.round(pack.n / 2)
        buttonInv.remItem ({id: pack.id, n: transfer}, this.invKey, this.stackPos)
        Settings.pointer.addItem({id: pack.id, n: transfer}, 'INV', 0) 
      } else {
        let pointerPack = Settings.pointer.stack.INV[0]
        let transfer = Math.round(pointerPack.n / 2)
        Settings.pointer.remItem ({id: pointerPack.id, n: transfer}, 'INV', 0)
        if (buttonInv.stack[this.invKey][this.stackPos]) {
          buttonInv.addItem({id: pointerPack.id, n: transfer}, this.invKey, this.stackPos) 
        } else {
          buttonInv.addItem({id: pointerPack.id, n: transfer}, this.invKey, buttonInv.stack[this.invKey].length) 
        }
      }
    }
    window.game.updateInventoryMenu(window.player)
    if (Settings.selEntity) window.game.updateEntityMenu(Settings.selEntity, true)
  };
}
