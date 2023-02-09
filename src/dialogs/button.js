import { Settings } from '../common.js'

export class Button {
  constructor (x, y, item, parent, inv) {
    this.x = x
    this.y = y
    this.size = Settings.buttonSize
    this.item = item
    this.inv = inv
    this.invKey = ''
    this.stackPos = 0
    this.parent = parent
    this.hover = false
    if (this.parent) this.screen = { x: this.parent.rect.x + this.x, y: this.parent.rect.y + this.y }
    else this.screen = { x: 0, y: 0 }
  }

  collision (p) {
    if (this.parent === undefined) return false
    if (this.parent.vis === false || this.screen.x < this.parent.rect.x || this.screen.x > (this.parent.rect.x + this.parent.w)) return false
    return this.parent.vis && (p.x >= this.screen.x && p.y >= this.screen.y && p.x <= this.screen.x + this.size.x && p.y <= this.screen.y + this.size.y)
  }

  draw (ctx) {
    if (this.parent.vis === false) return
    if (this.parent) this.screen = { x: this.parent.rect.x + this.x, y: this.parent.rect.y + this.y }
    else this.screen = { x: 0, y: 0 }
    ctx.beginPath()

    if (this.hover) {
      if (this.type === 'craft') window.receiptMenu.item = this.item
      else window.receiptMenu.item = undefined
    }

    if (this.hover) ctx.fillStyle = 'rgba(100, 100, 0, 1)'
    else ctx.fillStyle = 'rgba(60, 60, 60, 0.9)'
    ctx.rect(this.screen.x, this.screen.y, this.size.x, this.size.y)
    ctx.fill()
    ctx.stroke()
    if (this.item === null && this.inv?.stack && this.inv.stack[this.invKey] && this.inv.stack[this.invKey][this.stackPos]) {
      this.item = this.inv.stack[this.invKey][this.stackPos]
    }
    this.drawItem(ctx)
  }

  drawItem (ctx) {
    if (this.item !== undefined) {
      if (this.img) { // special image
        ctx.drawImage(this.img, this.screen.x, this.screen.y)
      } else if (this.item.id && Settings.resName[this.item.id].img) { // standard image
        ctx.drawImage(Settings.resName[this.item.id].img, this.screen.x + 2, this.screen.y + 2, Settings.buttonSize.x, Settings.buttonSize.y)
      }

      if (this.item?.id && Settings.resName[this.item.id].lock) {
        ctx.beginPath()
        ctx.fillStyle = 'rgb(200, 100, 100, 0.3)'
        ctx.rect(this.screen.x, this.screen.y, Settings.buttonSize.x, Settings.buttonSize.y)
        ctx.fill()
      }

      if (this.item.n !== undefined) {
        ctx.font = (Settings.buttonSize.y / 2) + 'px Arial'
        ctx.fillStyle = 'white'
        ctx.fillText(this.item.n, this.screen.x, this.screen.y + Settings.buttonSize.y)
      }
    }
  }

  onClick (button) {
    if (this.item?.id && Settings.resName[this.item?.id].lock === 1) return
    if (button === 1) {
      if (Settings.pointer?.item) {
        let tempItem
        if (this.item?.id === Settings.pointer.item?.id) {
          this.item.n += Settings.pointer.item.n
        } else {
          if (this.item?.id) {
            tempItem = this.item
            this.inv.remPack(this.invKey, this.stackPos)
          }
          if (Settings.pointer.item) {
            this.inv.addPack(this.invKey, this.stackPos, Settings.pointer.item)
          }
        }
        if (tempItem?.n) Settings.pointer.item = tempItem
        else Settings.pointer.item = undefined
      } else {
        if (this.item?.id && this.item?.n) {
          Settings.pointer.inv = this.inv
          Settings.pointer.invKey = this.invKey
          Settings.pointer.item = { id: this.item?.id, n: this.item?.n }
          if (this.inv) this.inv.remPack(this.invKey, this.stackPos)
        }
      }
    } else if (button === 3) {
      Settings.pointer.button = this
      if (Settings.pointer.item) {
        const transfer = Math.round(Settings.pointer.item.n / 2)
        Settings.pointer.item.n -= transfer
        if (Settings.pointer.button?.item?.n) {
          Settings.pointer.button.item.n += transfer
        } else {
          const item = { id: Settings.pointer.item.id, n: transfer }
          Settings.pointer.inv.addItem(item)
        }
      } else if (this.item) {
        Settings.pointer.item = { id: this.item.id, n: this.item.n }
        Settings.pointer.item.n = Math.round(Settings.pointer.item.n / 2)
        this.item.n = this.item.n - Settings.pointer.item.n
      }
    }
    window.view.updateInventoryMenu(Settings.player)
    if (Settings.selEntity) window.view.updateEntityMenu(Settings.selEntity, true)
  };
}
