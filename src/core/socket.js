import { Settings } from '../common.js'
import { Inventory } from './inventory.js'

// const ws        = new WebSocket('wss:/www.mynodi.com:4000');
// const ws = new WebSocket('ws://localhost:4000')

function wssend (msg) {
    let updateInv = false
    if (msg.cmd === 'addEntityByClick') {
      game.entityLayer.addEntityFromCursor(msg.data, false)
      updateInv = true
    }
    if (msg.cmd === 'addItem') {
      Inventory.addItem(msg.data, false)
      updateInv = true
    } else if (msg.cmd === 'moveStack') {
      Inventory.moveStack(msg.data)
      updateInv = true
    } else {
      /* if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msg))
      } */
    }
    if (msg.cmd === 'godmode') {
      window.isGodMode = true
      const playerInv = window.player || game?.allInvs?.[game?.playerID]
      if (!playerInv) return
      Inventory.ensureStack(playerInv.stack, 'INV', { maxlen: 200, packsize: 9999 })
      playerInv.stack.INV.maxlen = 200
      playerInv.stack.INV.packsize = 9999
      playerInv.stack.INV.full = false
      delete playerInv.stack.INV.allow
      const failures = []
      let added = 0
      const addGodItem = (item) => {
        if (!item || item.id == null) {
          failures.push({ item, reason: 'missing-id' })
          return false
        }
        const ok = playerInv.addItem(item)
        if (!ok) failures.push({ item, reason: 'add-failed' })
        else added += 1
        return ok
      }
      addGodItem({ id: classDB.Chest.id, n: 100 })
      addGodItem({ id: classDB.Coal.id, n: 100 })
      addGodItem({ id: classDB.Copper.id, n: 100 })
      addGodItem({ id: classDB.Iron.id, n: 100 })
      addGodItem({ id: classDB.IronPlate.id, n: 500 })
      addGodItem({ id: classDB.Stone.id, n: 50 })
      addGodItem({ id: classDB.Gear.id, n: 50 })
      addGodItem({ id: classDB.IronStick.id, n: 50 })
      addGodItem({ id: classDB.HydraulicPiston.id, n: 50 })
      addGodItem({ id: classDB.Belt1.id, n: 100 })
      addGodItem({ id: classDB.Belt2.id, n: 100 })
      addGodItem({ id: classDB.Belt3.id, n: 100 })
      addGodItem({ id: classDB.BurnerMiner.id, n: 100 })
      addGodItem({ id: classDB.StoneFurnace.id, n: 100 })
      addGodItem({ id: classDB.Inserter.id, n: 100 })
      addGodItem({ id: classDB.InserterLong.id, n: 100 })
      addGodItem({ id: classDB.InserterSmart.id, n: 100 })
      addGodItem({ id: classDB.Circuit.id, n: 100 })
      addGodItem({ id: classDB.CopperCable.id, n: 100 })
      addGodItem({ id: classDB.AssemblingMachine1.id, n: 100 })
      addGodItem({ id: classDB.AssemblingMachine2.id, n: 100 })
      addGodItem({ id: classDB.AssemblingMachine3.id, n: 100 })
      addGodItem({ id: classDB.Car.id, n: 100 })
      const ids = new Set()
      Object.values(classDBi).forEach(entry => {
        if (!entry) return
        if (entry.type !== 'item' && entry.type !== 'entity') return
        if (entry.name === 'Player' || entry.name === 'Empty' || entry.name === 'Tower') return
        if (entry.id == null) return
        ids.add(entry.id)
      })
      ids.forEach(id => {
        addGodItem({ id, n: 200 })
      })
      window.lastGodmodeReport = { added, failed: failures }
      if (failures.length) {
        console.warn('[godmode] failed to add items', failures)
      }
      window.godModePopulated = true
      game.updateInventoryMenu(playerInv)
    }
    if (msg.cmd === 'cleanstorage') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear()
      }
      if (typeof window !== 'undefined' && window.location) {
        window.location.reload()
      }
    }

    if (updateInv) {
      /* if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ cmd: 'updateInventories', data: game.allInvs }))
      } */
    }
    // ws.send(JSON.stringify(msg));
}

window.ws = wssend

/*
ws.onerror = function (e) {
  /* var localServer = new Worker('../server/localserver.js');
    localServer.postMessage("start");
    webworker.onmessage = function(n) {
        alert("Ergebnis: " + n.data);
    }; *
  console.log('WebSocket error: ', e)
}

ws.onmessage = function (e) {
  const socketMsg = JSON.parse(e.data)

  if (socketMsg.msg === 'updateInventories') {
    const rawInvs = JSON.parse(JSON.stringify(socketMsg.data))
    game.allInvs = []
    for (const inv of rawInvs) {
      game.allInvs.push(Object.assign(new Inventory(), inv))
    }
    Settings.player.setInventoryID(0)
    if (window.selEntity) {
      const inv = socketMsg.data[window.selEntity.id]
      game.updateInventoryMenu(inv)
    }
  }

  if (socketMsg.msg === 'serverTick') {
    // game.tick = socketMsg.data;
    // console.log("server tick:", Settings.serverTick);
  }

  if (socketMsg.msg === 'updateEntities') {
    game.allInvs = JSON.parse(JSON.stringify(socketMsg.data))
  }

  if (socketMsg.msg === 'updateEntity') {
    game.allInvs[socketMsg.data.id] = socketMsg.data.ent
    // Settings.player.setInventory(socketMsg.data.inv, socketMsg.data.invID);
  }
  if (socketMsg.msg === 'remEntity') {
    delete game.allInvs[socketMsg.data]
    // Settings.player.setInventory(socketMsg.data.inv, socketMsg.data.invID);
  }
  if (socketMsg.msg === 'updateMapData') updateMapData(socketMsg.data)
  if (socketMsg.msg === 'startGame') Time.gameLoop()
  if (socketMsg.msg === 'setPlayerID') game.playerID = socketMsg.data
  if (socketMsg.msg === 'id') console.log("Received: '" + socketMsg.data + "'")
} */

export { wssend }
