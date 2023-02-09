import { Settings } from '../common.js'
import { Inventory, invfuncs } from './inventory.js'
import { Time } from './loop.js'
import { updateOffscreenMap } from './render.js'

// const ws        = new WebSocket('wss:/www.mynodi.com:4000');
//const ws = new WebSocket('ws://localhost:4000')

function wssend (msg) {
  if (Settings.isBrowser) {
    let updateInv = false
    if (msg.cmd === 'addEntity') {
      invfuncs.addInventory(msg.data, false)
      updateInv = true
    }
    if (msg.cmd === 'addItem') {
      invfuncs.addItem(msg.data, false)
      updateInv = true
    } else if (msg.cmd === 'moveStack') {
      invfuncs.moveStack(msg.data)
      updateInv = true
    } else {
      /*if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msg))
      }*/
    }
    if (msg.cmd === 'godmode') {
      Settings.player.stacksize = 50
      Settings.player.addItem({ id: Settings.resDB.chest.id, n: 100 })
      Settings.player.addItem({ id: Settings.resDB.coal.id, n: 100 })
      Settings.player.addItem({ id: Settings.resDB.copper.id, n: 100 })
      Settings.player.addItem({ id: Settings.resDB.iron.id, n: 100 })
      Settings.player.addItem({ id: Settings.resDB.iron_plate.id, n: 500 })
      Settings.player.addItem({ id: Settings.resDB.stone.id, n: 50 })
      Settings.player.addItem({ id: Settings.resDB.gear.id, n: 50 })
      Settings.player.addItem({ id: Settings.resDB.iron_stick.id, n: 50 })
      Settings.player.addItem({ id: Settings.resDB.hydraulic_piston.id, n: 50 })
      Settings.player.addItem({ id: Settings.resDB.belt1.id, n: 100 })
      Settings.player.addItem({ id: Settings.resDB.belt2.id, n: 100 })
      Settings.player.addItem({ id: Settings.resDB.belt3.id, n: 100 })
      Settings.player.addItem({ id: Settings.resDB.stone_furnace.id, n: 100 })
      Settings.player.addItem({ id: Settings.resDB.inserter_burner.id, n: 100 })
      Settings.player.addItem({ id: Settings.resDB.circuit.id, n: 100 })
      Settings.player.addItem({ id: Settings.resDB.copper_cable.id, n: 100 })
      Settings.player.addItem({ id: Settings.resDB.burner_miner.id, n: 100 })
      Settings.player.addItem({ id: Settings.resDB.pipe.id, n: 100 })
      Settings.player.addItem({ id: Settings.resDB.assembling_machine_1.id, n: 100 })
      Settings.player.addItem({ id: Settings.resDB.assembling_machine_2.id, n: 100 })
      Settings.player.addItem({ id: Settings.resDB.assembling_machine_3.id, n: 100 })
      Settings.player.addItem({ id: Settings.resDB.car.id, n: 100 })
    }

    if (updateInv) {
      /*if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ cmd: 'updateInventories', data: Settings.allInvs }))
      }*/
    }
    // ws.send(JSON.stringify(msg));
  }
}

window.ws = wssend

function updateMapData (data) {
  Settings.game.map = data
  updateOffscreenMap()
}

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
    Settings.allInvs = []
    for (const inv of rawInvs) {
      Settings.allInvs.push(Object.assign(new Inventory(), inv))
    }
    Settings.player.setInventoryID(0)
    if (Settings.selEntity) {
      const inv = socketMsg.data[Settings.selEntity.id]
      window.view.updateInventoryMenu(inv)
    }
  }

  if (socketMsg.msg === 'serverTick') {
    // Settings.game.tick = socketMsg.data;
    // console.log("server tick:", Settings.serverTick);
  }

  if (socketMsg.msg === 'updateEntities') {
    Settings.allInvs = JSON.parse(JSON.stringify(socketMsg.data))
  }

  if (socketMsg.msg === 'updateEntity') {
    Settings.allInvs[socketMsg.data.id] = socketMsg.data.ent
    // Settings.player.setInventory(socketMsg.data.inv, socketMsg.data.invID);
  }
  if (socketMsg.msg === 'remEntity') {
    delete Settings.allInvs[socketMsg.data]
    // Settings.player.setInventory(socketMsg.data.inv, socketMsg.data.invID);
  }
  if (socketMsg.msg === 'updateMapData') updateMapData(socketMsg.data)
  if (socketMsg.msg === 'startGame') Time.gameLoop()
  if (socketMsg.msg === 'setPlayerID') Settings.playerID = socketMsg.data
  if (socketMsg.msg === 'id') console.log("Received: '" + socketMsg.data + "'")
}*/

export { wssend }
