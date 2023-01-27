import { Settings } from '../common.js'
import { Dialog } from '../dialogs/dialog.js'
import { Button } from '../dialogs/button.js'
import { invfuncs } from '../core/inventory.js'

import * as NC from 'nodicanvas'

class DialogLayer extends NC.NodiGrid {
  constructor (layerName, canvas) {
    super(layerName)

    window.invMenu = new Dialog()
    window.craftMenu = new Dialog()
    window.entityMenu = new Dialog()
    window.receiptMenu = new Dialog()
    window.selectItemMenu = new Dialog()

    this.createInvMenu()
  }

  onMouseDown (e, hit) {
    if (hit) return
    let overlayClicked = false
    window.selectItemMenu.items.forEach(b => { if (b.collision(e, b)) { overlayClicked = true } })
    window.invMenu.items.forEach(b => { if (b.collision(e, b)) { overlayClicked = true } })
    window.craftMenu.items.forEach(b => { if (b.collision(e, b)) { overlayClicked = true } })
    window.entityMenu.items.forEach(b => { if (b.collision(e, b)) { overlayClicked = true } })
    return overlayClicked
  }

  onMouseMove (e, hit) {
    if (hit) return
    let isOverlay = false
    window.invMenu.items.forEach(b => { b.hover = b.collision(e); if (b.hover) { isOverlay = true } })
    window.craftMenu.items.forEach(b => { b.hover = b.collision(e); if (b.hover) { isOverlay = true } })
    window.entityMenu.items.forEach(b => { b.hover = b.collision(e); if (b.hover) { isOverlay = true } })
    if (Settings.pointer) Settings.pointer.overlay = isOverlay

    window.receiptMenu.rect.x = e.x + 16
    window.receiptMenu.rect.y = e.y

    window.mousePos = e
    window.curResPos = { x: e.gridX, y: e.gridY }
  }

  onMouseUp (e, hit) {
    if (hit) return
    let overlayClicked = false
    window.selectItemMenu.items.forEach(b => { if (b.collision(e) && b.onClick) { b.onClick(e.which, b); overlayClicked = true } })
    window.invMenu.items.forEach(b => { if (b.collision(e) && b.onClick) { b.onClick(e.which, b); overlayClicked = true } })
    window.craftMenu.items.forEach(b => { if (b.collision(e) && b.onClick) { b.onClick(e.which, b); overlayClicked = true } })
    window.entityMenu.items.forEach(b => { if (b.collision(e) && b.onClick) { b.onClick(e.which, b); overlayClicked = true } })
    return overlayClicked
  }

  render (view) {
    window.receiptMenu.item = undefined

    const ctx = view.ctx
    ctx.resetTransform()
    ctx.lineWidth = 1
    // CONTENT MENU
    if (window.curResPos?.x && window.curResPos?.y && Settings.game.map) {
      ctx.save()
      const inv = invfuncs.getInv(window.curResPos.x, window.curResPos.y)
      const res = Settings.game.map[window.curResPos.x][window.curResPos.y][Settings.layers.res]

      if (Settings.DEV) {
        // console.log(JSON.stringify(game.map[curResPos.x][curResPos.y]), inv);
        ctx.font = '24px Arial'
        ctx.fillStyle = 'white'

        if (res !== undefined) ctx.fillText(JSON.stringify(res, null, 1), window.mousePos.x, window.mousePos.y + 24)
        if (inv !== undefined) {
          ctx.fillText(inv.id + ': ' + window.curResPos.x + ', ' + window.curResPos.y, window.mousePos.x, window.mousePos.y)
          ctx.fillText(JSON.stringify(inv.stack, null, 1), window.mousePos.x, window.mousePos.y + 48)
          ctx.fillText(JSON.stringify(inv.nbInputs, null, 1), window.mousePos.x, window.mousePos.y + 72)
          ctx.fillText(JSON.stringify(inv.nbOutputs, null, 1), window.mousePos.x, window.mousePos.y + 96)
          ctx.fillText(JSON.stringify(inv.dir, null, 1), window.mousePos.x, window.mousePos.y + 120)
        }
        ctx.stroke()
      }

      if (res?.id) {
        ctx.beginPath()
        ctx.fillStyle = 'rgba(150, 150, 190, 0.75)'
        const menuPos = { x: window.canvas.width - 200, y: window.canvas.height / 2 - 50 }
        ctx.translate(menuPos.x, menuPos.y)
        ctx.fillRect(0, 0, 200, 100)
        ctx.font = '24px Arial'
        ctx.fillStyle = 'black'
        ctx.fillText(Settings.resName[res.id].name + ' ' + res.n, 0, 30)
      }
      ctx.restore()
    }

    this.drawSelectItemMenu(ctx)

    // INVENTORY MENU
    if (window.invMenu.vis) {
      window.invMenu.items.forEach(b => b.draw(ctx))
      window.craftMenu.items.forEach(b => b.draw(ctx))
      window.entityMenu.items.forEach(b => b.draw(ctx))
      window.selectItemMenu.items.forEach(b => b.draw(ctx))
    }

    this.drawReceiptMenu(ctx)

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
  }

  createInvMenu () {
    // INV MENU
    if (window.invMenu) {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const newButton = new Button(j * (Settings.buttonSize), i * (Settings.buttonSize), undefined, window.invMenu)
          window.invMenu.items.push(newButton)
        }
      }
    }
    // this.resize()
  }

  drawReceiptMenu (context) {
    // RECEIPT MENU
    if (window.receiptMenu.item) {
      context.beginPath()
      context.fillStyle = 'rgba(150, 150, 0, 0.95)'
      context.fillRect(window.receiptMenu.rect.x, window.receiptMenu.rect.y, window.receiptMenu.rect.w, window.receiptMenu.rect.h)
      context.font = '24px Arial'
      context.fillStyle = 'black'
      let title = Settings.resName[window.receiptMenu.item.id].name
      if (Settings.resName[window.receiptMenu.item.id].lock) title += ' (developing...)'
      context.fillText(title, window.receiptMenu.rect.x + 6, window.receiptMenu.rect.y + 24)
      let dy = 0
      if (Settings.resName[window.receiptMenu.item.id].cost) {
        for (const costItem of Settings.resName[window.receiptMenu.item.id].cost) {
          context.fillRect(window.receiptMenu.rect.x + 6, window.receiptMenu.rect.y + 64 + dy, 32, 32)
          context.drawImage(Settings.resName[costItem.id].img, window.receiptMenu.rect.x + 6, window.receiptMenu.rect.y + 64 + dy, 32, 32)
          let missingItems = ''
          if (window.receiptMenu.item.n === 0) {
            const existing = invfuncs.getNumberOfItems(Settings.allInvs[Settings.playerID], costItem.id)
            if (existing < costItem.n) {
              missingItems = existing + ' / '
              context.fillStyle = 'red'
            } else context.fillStyle = 'black'
          } else context.fillStyle = 'black'
          context.fillText(missingItems + costItem.n + 'x ' + Settings.resName[costItem.id].name, window.receiptMenu.rect.x + 46, window.receiptMenu.rect.y + 84 + dy)
          dy += 64
          window.receiptMenu.rect.h = dy + 100
        }
      }
    }
  }

  drawSelectItemMenu (context) {
    // CRAFTING/ENTITY/SELECT ITEM MENU
    if (window.selectItemMenu.vis) { // SELECT ITEM MENU
      context.beginPath()
      context.fillStyle = 'rgba(150, 150, 150, 0.95)'
      context.fillRect(window.selectItemMenu.rect.x, window.selectItemMenu.rect.y, window.selectItemMenu.rect.w, window.selectItemMenu.rect.h)
      window.selectItemMenu.items.forEach(b => b.draw(context))
    } else if (window.entityMenu.vis) {
      let dy = 96
      context.beginPath()
      context.fillStyle = 'rgba(150, 150, 150, 0.95)'
      context.fillRect(window.entityMenu.rect.x, window.entityMenu.rect.y, window.entityMenu.rect.w, window.entityMenu.rect.h)
      context.font = '24px Arial'
      context.fillStyle = 'black'
      let resText = ''
      if (Settings.selEntity.id && Settings.allInvs[Settings.selEntity.id]?.type) resText = Settings.resName[Settings.allInvs[Settings.selEntity.id].type]?.name
      context.fillText(resText, window.entityMenu.rect.x + 16, window.entityMenu.rect.y + 32)
      const selInv = Settings.allInvs[Settings.selEntity.id]
      if (selInv) {
        if (selInv.prod) {
          window.entityMenu.buttons.PROD[0].item = { id: selInv.prod }
          context.font = '24px Arial'
          context.fillStyle = 'black'
          context.fillText('PROD', window.entityMenu.rect.x + 16, window.entityMenu.rect.y + dy)
          window.entityMenu.buttons.PROD[0].draw(context)
          dy += Settings.buttonSize
        }

        for (const f in selInv.stack) {
          context.font = '24px Arial'
          context.fillStyle = 'black'
          context.fillText(JSON.stringify(f).replaceAll('"', ''), window.entityMenu.rect.x + 16, window.entityMenu.rect.y + dy)
          if (window.entityMenu.buttons[f]) {
            window.entityMenu.buttons[f].forEach(b => { b.draw(context) })
          }
          dy += Settings.buttonSize
        }
        window.entityMenu.rect.h = dy + 16
      }
    } else if (window.craftMenu.vis) {
      window.craftMenu.items.forEach(b => b.draw(context))
    }
  }
}

export { DialogLayer }
