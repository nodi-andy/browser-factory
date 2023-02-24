import { Settings } from '../common.js'
import { Inventory } from './inventory.js'

// const ws        = new WebSocket('wss:/www.mynodi.com:4000');
// const ws = new WebSocket('ws://localhost:4000')

function wssend (msg) {
    let updateInv = false
    if (msg.cmd === 'addEntity') {
      Inventory.addInventory(msg.data, false)
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
      window.player.stacksize = 50
      window.player.addItem({ id: window.classDB.Chest.id, n: 100 })
      window.player.addItem({ id: window.classDB.Coal.id, n: 100 })
      window.player.addItem({ id: window.classDB.Copper.id, n: 100 })
      window.player.addItem({ id: window.classDB.Iron.id, n: 100 })
      window.player.addItem({ id: window.classDB.IronPlate.id, n: 500 })
      window.player.addItem({ id: window.classDB.Stone.id, n: 50 })
      window.player.addItem({ id: window.classDB.Gear.id, n: 50 })
      window.player.addItem({ id: window.classDB.IronStick.id, n: 50 })
      window.player.addItem({ id: window.classDB.HydraulicPiston.id, n: 50 })
      window.player.addItem({ id: classDB.Belt1.id, n: 100 })
      window.player.addItem({ id: classDB.Belt2.id, n: 100 })
      window.player.addItem({ id: classDB.Belt3.id, n: 100 })
      window.player.addItem({ id: window.classDB.BurnerMiner.id, n: 100 })
      window.player.addItem({ id: window.classDB.StoneFurnace.id, n: 100 })
      window.player.addItem({ id: window.classDB.InserterBurner.id, n: 100 })
      //window.player.addItem({ id: Settings.resDB.circuit.id, n: 100 })
      //window.player.addItem({ id: Settings.resDB.CopperCable.id, n: 100 })
      //window.player.addItem({ id: Settings.resDB.generator.id, n: 100 })
      //window.player.addItem({ id: Settings.resDB.pipe.id, n: 100 })
      //window.player.addItem({ id: Settings.resDB.assembling_machine_1.id, n: 100 })
      //window.player.addItem({ id: Settings.resDB.assembling_machine_2.id, n: 100 })
      //window.player.addItem({ id: Settings.resDB.assembling_machine_3.id, n: 100 })
      //window.player.addItem({ id: Settings.resDB.car.id, n: 100 })
    }

    if (updateInv) {
      /* if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ cmd: 'updateInventories', data: window.game.allInvs }))
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
    window.game.allInvs = []
    for (const inv of rawInvs) {
      window.game.allInvs.push(Object.assign(new Inventory(), inv))
    }
    Settings.player.setInventoryID(0)
    if (Settings.selEntity) {
      const inv = socketMsg.data[Settings.selEntity.id]
      window.game.updateInventoryMenu(inv)
    }
  }

  if (socketMsg.msg === 'serverTick') {
    // window.game.tick = socketMsg.data;
    // console.log("server tick:", Settings.serverTick);
  }

  if (socketMsg.msg === 'updateEntities') {
    window.game.allInvs = JSON.parse(JSON.stringify(socketMsg.data))
  }

  if (socketMsg.msg === 'updateEntity') {
    window.game.allInvs[socketMsg.data.id] = socketMsg.data.ent
    // Settings.player.setInventory(socketMsg.data.inv, socketMsg.data.invID);
  }
  if (socketMsg.msg === 'remEntity') {
    delete window.game.allInvs[socketMsg.data]
    // Settings.player.setInventory(socketMsg.data.inv, socketMsg.data.invID);
  }
  if (socketMsg.msg === 'updateMapData') updateMapData(socketMsg.data)
  if (socketMsg.msg === 'startGame') Time.gameLoop()
  if (socketMsg.msg === 'setPlayerID') window.game.playerID = socketMsg.data
  if (socketMsg.msg === 'id') console.log("Received: '" + socketMsg.data + "'")
} */

export { wssend }
