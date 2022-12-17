
import { Settings } from '../common.js'
import { invfuncs } from './inventory.js'

function drawSelectItemMenu (context) {
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
        context.fillText('PROD', Settings.entityMenu.rect.x + 16, Settings.entityMenu.rect.y + dy)
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
function drawReceiptMenu (context) {
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

function drawContentMenu (context) {
  // CONTENT MENU
  if (window.curResPos && Settings.game.map) {
    const inv = invfuncs.getInv(window.curResPos.x, window.curResPos.y)
    const res = Settings.game.map[window.curResPos.x][window.curResPos.y][Settings.layers.res]

    if (Settings.DEV) {
      // console.log(JSON.stringify(game.map[curResPos.x][curResPos.y]), inv);
      context.font = '24px Arial'
      context.fillStyle = 'white'

      if (res !== undefined) context.fillText(JSON.stringify(res, null, 1), window.mousePos.x, window.mousePos.y + 24)
      if (inv !== undefined) {
        context.fillText(inv.id + ': ' + window.curResPos.x + ', ' + window.curResPos.y, window.mousePos.x, window.mousePos.y)
        context.fillText(JSON.stringify(inv.stack, null, 1), window.mousePos.x, window.mousePos.y + 48)
        context.fillText(JSON.stringify(inv.nbInputs, null, 1), window.mousePos.x, window.mousePos.y + 72)
        context.fillText(JSON.stringify(inv.nbOutputs, null, 1), window.mousePos.x, window.mousePos.y + 96)
        context.fillText(JSON.stringify(inv.dir, null, 1), window.mousePos.x, window.mousePos.y + 120)
      }
      context.stroke()
    }

    context.save()
    context.beginPath()
    context.fillStyle = 'rgba(150, 150, 190, 0.75)'
    const menuPos = { x: window.canvas.width - 200, y: window.canvas.height / 2 - 50 }
    context.translate(menuPos.x, menuPos.y)
    context.fillRect(0, 0, 200, 100)
    context.font = '24px Arial'
    context.fillStyle = 'black'
    if (res?.id) {
      context.fillText(Settings.resName[res.id].name + ' ' + res.n, 0, 30)
    }
    context.restore()
  }
}

export { drawContentMenu, drawReceiptMenu, drawSelectItemMenu }
