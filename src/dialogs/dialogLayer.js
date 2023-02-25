import { Settings } from '../common.js'
import { Dialog } from '../dialogs/dialog.js'
import { Button } from '../dialogs/button.js'
import { Inventory } from '../core/inventory.js'

import * as NC from 'nodicanvas'

export class DialogLayer extends NC.NodiGrid {
  constructor (layerName, canvas, tileSize) {
    super(layerName, canvas, tileSize)

    window.invMenu = new Dialog()
    window.craftMenu = new Dialog()
    window.entityMenu = new Dialog()
    window.receiptMenu = new Dialog()
    window.selectItemMenu = new Dialog()
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
    this.extendMouseData(e)
    let isOverlay = false
    window.invMenu.items.forEach(b => { b.hover = b.collision(e); if (b.hover) { isOverlay = true } })
    window.craftMenu.items.forEach(b => { b.hover = b.collision(e); if (b.hover) { isOverlay = true } })
    window.entityMenu.items.forEach(b => { b.hover = b.collision(e); if (b.hover) { isOverlay = true } })
    if (Settings.pointer) Settings.pointer.overlay = isOverlay

    window.receiptMenu.rect.x = e.x + 16
    window.receiptMenu.rect.y = e.y

    window.mousePos = e
    Settings.dialogResPos = { x: e.gridX, y: e.gridY }
    return Settings.pointer?.overlay
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
    if (Settings.dialogResPos?.x && Settings.dialogResPos?.y) {
      ctx.save()
      const inv = game.entityLayer.getInv(Settings.dialogResPos.x, Settings.dialogResPos.y)
      const res = game.res.getResource(Settings.dialogResPos)

      if (window.DEV) {
        // console.log(JSON.stringify(game.map[curResPos.x][curResPos.y]), inv);
        ctx.font = (Settings.buttonSize.y / 2) + 'px Arial'
        ctx.fillStyle = 'white'

        if (res !== undefined) ctx.fillText(JSON.stringify(res, null, 1), window.mousePos.x, window.mousePos.y + 24)
        if (inv !== undefined) {
          ctx.fillText(inv.id + ': ' + Settings.dialogResPos.x + ', ' + Settings.dialogResPos.y, window.mousePos.x, window.mousePos.y)
          ctx.fillText(JSON.stringify(inv.stack, null, 1), window.mousePos.x, window.mousePos.y + 48)
          ctx.fillText(JSON.stringify(inv.nbInputs, null, 1), window.mousePos.x, window.mousePos.y + 72)
          ctx.fillText(JSON.stringify(inv.nbOutputs, null, 1), window.mousePos.x, window.mousePos.y + 96)
          ctx.fillText(JSON.stringify(inv.dir, null, 1), window.mousePos.x, window.mousePos.y + 120)
        }
        ctx.stroke()
      }
      // Resource content menu
      if (res?.id) {
        ctx.beginPath()
        ctx.fillStyle = 'rgba(150, 150, 190, 0.75)'
        const menuPos = { x: view.canvas.width - Settings.buttonSize.x * 2, y: view.canvas.height / 2 - 2 * Settings.buttonSize.y }
        ctx.translate(menuPos.x, menuPos.y)
        ctx.fillRect(0, 0, Settings.buttonSize.x * 2, Settings.buttonSize.x)
        ctx.font = (Settings.buttonSize.y / 2) + 'px Arial'
        ctx.fillStyle = 'black'
        ctx.fillText(classDBi[res.id].name, 0, Settings.buttonSize.y / 2)
        ctx.fillText(res.n, 0, Settings.buttonSize.y)
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
    if (Settings.pointer?.stack?.INV?.length && Settings.pointer.overlay) {
      const item = classDBi[Settings.pointer.stack.INV[0].id]
      if (item) {
        ctx.save()
        ctx.translate(window.mousePos.x, window.mousePos.y)
        if (item.type === 'entity' && item.rotatable !== false) ctx.rotate(Settings.buildDir * Math.PI / 2)
        ctx.translate(-Settings.tileSize / 2, -Settings.tileSize / 2)
        if (item?.draw) item.draw(ctx, Settings.pointer.item)
        else {
          ctx.drawImage(item.img, 0, 0)
          if (Settings.pointer.stack.INV[0].n != null) {
            ctx.font = (Settings.buttonSize.y / 2) + 'px Arial'
            ctx.fillStyle = 'white'
            ctx.fillText(Settings.pointer.stack.INV[0].n, 0, 0 + Settings.buttonSize.x)
          }
        }
        ctx.restore()
      }
    }
  }

  createInvMenu (invID) {
    // INV MENU
    if (window.invMenu) {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const newButton = new Button(j * Settings.buttonSize.x, i * Settings.buttonSize.y, undefined, window.invMenu, invID)
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
      context.font = (Settings.buttonSize.y / 2) + 'px Arial'
      context.fillStyle = 'black'
      let title = classDBi[window.receiptMenu.item.id].name
      if (classDBi[window.receiptMenu.item.id].lock) title += ' (developing...)'
      context.fillText(title, window.receiptMenu.rect.x + 6, window.receiptMenu.rect.y + Settings.buttonSize.y / 2)
      let dy = 0
      if (classDBi[window.receiptMenu.item.id].cost) {
        for (const costItem of classDBi[window.receiptMenu.item.id].cost) {
          context.fillRect(window.receiptMenu.rect.x + 6, window.receiptMenu.rect.y + Settings.buttonSize.y + dy, 32, 32)
          context.drawImage(classDBi[costItem.id].img, window.receiptMenu.rect.x + 6, window.receiptMenu.rect.y + Settings.buttonSize.y + dy, 32, 32)
          let missingItems = ''
          if (window.receiptMenu.item.n === 0) {
            const existing = Inventory.getNumberOfItems(game.allInvs[game.playerID], costItem.id)
            if (existing < costItem.n) {
              missingItems = existing + ' / '
              context.fillStyle = 'red'
            } else context.fillStyle = 'black'
          } else context.fillStyle = 'black'
          context.fillText(missingItems + costItem.n + 'x ' + classDBi[costItem.id].name, window.receiptMenu.rect.x + 46, window.receiptMenu.rect.y + Settings.buttonSize.y * 1.2 + dy)
          dy += Settings.buttonSize.y
          window.receiptMenu.rect.h = dy + 100
        }
      }
    }
  }

  drawSelectItemMenu (context) {
    // CRAFTING
    if (window.selectItemMenu.vis) { // SELECT ITEM MENU
      context.beginPath()
      context.fillStyle = 'rgba(150, 150, 150, 0.95)'
      context.fillRect(window.selectItemMenu.rect.x, window.selectItemMenu.rect.y, window.selectItemMenu.rect.w, window.selectItemMenu.rect.h)
      window.selectItemMenu.items.forEach(b => b.draw(context))

      // DRAW ENTITY MENU
    } else if (window.entityMenu.vis) {
      let dy = Settings.buttonSize.y * 1.5
      context.beginPath()
      context.fillStyle = 'rgba(150, 150, 150, 0.95)'
      context.fillRect(window.entityMenu.rect.x, window.entityMenu.rect.y, window.entityMenu.rect.w, window.entityMenu.rect.h)
      context.font = (Settings.buttonSize.y / 2) + 'px Arial'
      context.fillStyle = 'black'
      let resText = ''
      if (window.selEntity.id && game.allInvs[window.selEntity.id]?.type) resText = classDBi[game.allInvs[window.selEntity.id].type]?.name
      context.fillText(resText, window.entityMenu.rect.x + Settings.buttonSize.x / 4, window.entityMenu.rect.y + Settings.buttonSize.x / 2)
      const selInv = game.allInvs[window.selEntity.id]
      if (selInv) {
        if (selInv.selectedItem) {
          window.entityMenu.buttons.PROD[0].item = { id: selInv.selectedItem }
          context.font = (Settings.buttonSize.y / 2) + 'px Arial'
          context.fillStyle = 'black'
          context.fillText('PROD', window.entityMenu.rect.x + Settings.buttonSize.x / 4, window.entityMenu.rect.y + dy)
          window.entityMenu.buttons.PROD[0].draw(context)
          dy += Settings.buttonSize.y
        }

        for (const f in selInv.stack) {
          context.font = (Settings.buttonSize.y / 2) + 'px Arial'
          context.fillStyle = 'black'
          context.fillText(JSON.stringify(f).replaceAll('"', ''), window.entityMenu.rect.x + 16, window.entityMenu.rect.y + dy)
          if (window.entityMenu.buttons[f]) {
            window.entityMenu.buttons[f].forEach(b => { b.draw(context) })
          }
          dy += Settings.buttonSize.y
        }
        window.entityMenu.rect.h = dy + Settings.buttonSize.y / 2
      }
    } else if (window.craftMenu.vis) {
      window.craftMenu.items.forEach(b => b.draw(context))
    }
  }
}
