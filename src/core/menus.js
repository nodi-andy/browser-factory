
function drawSelectItemMenu (context) {
  // CRAFTING/ENTITY/SELECT ITEM MENU
  if (selectItemMenu.vis) { // SELECT ITEM MENU
    const dy = 96
    context.beginPath()
    context.fillStyle = 'rgba(150, 150, 150, 0.95)'
    context.fillRect(selectItemMenu.rect.x, selectItemMenu.rect.y, selectItemMenu.rect.w, selectItemMenu.rect.h)
    selectItemMenu.items.forEach(b => b.draw(context))
  } else if (entityMenu.vis) {
    let dy = 96
    context.beginPath()
    context.fillStyle = 'rgba(150, 150, 150, 0.95)'
    context.fillRect(entityMenu.rect.x, entityMenu.rect.y, entityMenu.rect.w, entityMenu.rect.h)
    context.font = '24px Arial'
    context.fillStyle = 'black'
    let resText = "";
    if (c.selEntity.id && c.allInvs[c.selEntity.id]?.type) resText = resName[c.allInvs[c.selEntity.id].type]?.name;
    context.fillText(resText, entityMenu.rect.x + 16, entityMenu.rect.y + 32)
    const selInv = c.allInvs[c.selEntity.id]
    if (selInv) {
      if (selInv.prod) {
        entityMenu.buttons.PROD[0].item = { id: selInv.prod }
        context.font = '24px Arial'
        context.fillStyle = 'black'
        context.fillText('PROD', entityMenu.rect.x + 16, entityMenu.rect.y + dy)
        entityMenu.buttons.PROD[0].draw(context)
        dy += buttonSize
      }

      for (f in selInv.stack) {
        context.font = '24px Arial'
        context.fillStyle = 'black'
        context.fillText(JSON.stringify(f).replaceAll('"', ''), entityMenu.rect.x + 16, entityMenu.rect.y + dy)
        if (entityMenu.buttons[f]) {
          entityMenu.buttons[f].forEach(b => { b.draw(context) })
        }
        dy += buttonSize
      }
      entityMenu.rect.h = dy + 16
    }
  } else if (craftMenu.vis) {
    craftMenu.items.forEach(b => b.draw(context))
  }
}
function drawReceiptMenu (context) {
  // RECEIPT MENU
  if (receiptMenu.item) {
    context.beginPath()
    context.fillStyle = 'rgba(150, 150, 0, 0.95)'
    context.fillRect(receiptMenu.rect.x, receiptMenu.rect.y, receiptMenu.rect.w, receiptMenu.rect.h)
    context.font = '24px Arial'
    context.fillStyle = 'black'
    let title = resName[receiptMenu.item.id].name
    if (resName[receiptMenu.item.id].lock) title += ' (developing...)'
    context.fillText(title, receiptMenu.rect.x + 6, receiptMenu.rect.y + 24)
    let dy = 0
    if (resName[receiptMenu.item.id].cost) {
      for (const costItem of resName[receiptMenu.item.id].cost) {
        context.fillRect(receiptMenu.rect.x + 6, receiptMenu.rect.y + 64 + dy, 32, 32)
        context.drawImage(resName[costItem.id].img, receiptMenu.rect.x + 6, receiptMenu.rect.y + 64 + dy, 32, 32)
        let missingItems = ''
        if (receiptMenu.item.n == 0) {
          const existing = getNumberOfItems(c.allInvs[c.playerID], costItem.id)
          if (existing < costItem.n) {
            missingItems = existing + ' / '
            context.fillStyle = 'red'
          } else context.fillStyle = 'black'
        } else context.fillStyle = 'black'
        context.fillText(missingItems + costItem.n + 'x ' + resName[costItem.id].name, receiptMenu.rect.x + 46, receiptMenu.rect.y + 84 + dy)
        dy += 64
        receiptMenu.rect.h = dy + 100
      }
    }
  }
}

function drawContentMenu (context) {
  // CONTENT MENU
  if (curResPos && c.game.map) {
    const inv = inventory.getInv(curResPos.x, curResPos.y)
    const res = c.game.map[curResPos.x][curResPos.y][layers.res]

    if (DEV) {
      // console.log(JSON.stringify(game.map[curResPos.x][curResPos.y]), inv);
      context.font = '24px Arial'
      context.fillStyle = 'white'

      if (res != undefined) context.fillText(JSON.stringify(res, null, 1), mousePos.x, mousePos.y + 24)
      if (inv != undefined) {
        context.fillText(inv.id + ': ' + curResPos.x + ', ' + curResPos.y, mousePos.x, mousePos.y)
        context.fillText(JSON.stringify(inv.stack, null, 1), mousePos.x, mousePos.y + 48)
        context.fillText(JSON.stringify(inv.nbInputs, null, 1), mousePos.x, mousePos.y + 72)
        context.fillText(JSON.stringify(inv.nbOutputs, null, 1), mousePos.x, mousePos.y + 96)
        context.fillText(JSON.stringify(inv.dir, null, 1), mousePos.x, mousePos.y + 120)
      }
      context.stroke()
    }

    context.save()
    context.beginPath()
    context.fillStyle = 'rgba(150, 150, 190, 0.75)'
    const menuPos = { x: canvas.width - 200, y: canvas.height / 2 - 50 }
    context.translate(menuPos.x, menuPos.y)
    context.fillRect(0, 0, 200, 100)
    context.font = '24px Arial'
    context.fillStyle = 'black'
    if (res?.id) {
      context.fillText(resName[res.id].name + ' ' + res.n, 0, 30)
    }
    context.restore()
  }
}
