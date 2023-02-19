import { Settings } from './src/common.js'
const mode = process.argv[2]
const WebSocket = require('ws')
const https = require('https')
const fs = require('fs')
const port = 4000
let wss
if (mode === 'server') {
  const server = https.createServer({
    key: fs.readFileSync('../../mynodicom-privkey.pem'),
    cert: fs.readFileSync('../../mynodicom-fullchain.pem')
  }
  )
  wss = new WebSocket.Server({ server })
  server.listen(port)
} else {
  wss = new WebSocket.Server({ port })
}

console.log('Listening to: ' + port)

// LOAD CORE LIBS
const c = require('./common.js')
const s = require('./socket')

function protocoll (ws, req) {
  let playerID
  for (const [key, value] of s.users) {
    if (value.online === false) {
      playerID = key
    }
  }
  if (playerID == null) {
    const playerEnt = {}
    window.player.setup(undefined, playerEnt)

    window.game.allInvs.push(playerEnt)
    playerEnt.id = window.game.allInvs.length - 1

    Settings.allMovableEnts.push(playerEnt.id)
    playerID = window.game.allInvs.length - 1
  }

  ws.playerID = playerID

  s.users.set(playerID, { ws, online: true })

  ws.on('message', function (message) {
    const msg = JSON.parse(message)
    if (msg.cmd === 'updateInventories') {
      window.game.allInvs = JSON.parse(JSON.stringify(msg.data))
    }
    if (msg.cmd === 'updateMapData') {
      window.game.map = JSON.parse(JSON.stringify(msg.data))
      s.sendAll(JSON.stringify({ msg: 'updateMapData', data: window.game.map }), ws.playerID)
    }
    if (msg.cmd === 'updateEntity') {
      if (msg.data.ent) {
        window.game.allInvs[msg.data.id] = JSON.parse(JSON.stringify(msg.data.ent))
        s.sendAll(JSON.stringify({ msg: 'updateEntity', data: { id: msg.data.id, ent: window.game.allInvs[msg.data.id] } }), ws.playerID)
        console.log(msg.data)
      }
    }
  })
  ws.on('close', function () {
    if (ws.playerID !== undefined) {
      s.users.set(ws.playerID, { ws, online: false })
    }
  })
  ws.send(JSON.stringify({ msg: 'id', data: JSON.stringify(ws.uuid) }))
  ws.send(JSON.stringify({ msg: 'updateMapData', data: c.game.map }))
  ws.send(JSON.stringify({ msg: 'updateInventories', data: c.allInvs }))
  s.sendAll(JSON.stringify({
    msg: 'updateEntity',
    data: { id: playerID, ent: window.game.allInvs[playerID] }
  }))
  ws.send(JSON.stringify({ msg: 'setPlayerID', data: playerID }))
  ws.send(JSON.stringify({ msg: 'startGame' }))
}
wss.on('connection', protocoll)

update()
function update () {
  window.game.tick++
  /*
  // machines,  belts and player excluded
  for(let ient = 0; ient < Settings.allEnts.length; ient++) {
    let entity = Settings.allEnts[ient];
    if (!entity) continue;
    if(entity.type === Settings.resDB.belt1.id) continue;
    if(entity.type === Settings.resDB.player.id) continue;
    if(Settings.resName[entity.type].mach) {
      Settings.resName[entity.type].mach.update(window.game.map, entity);
    }
  }

  // BELT
  let belts = [];
  for(let ient = 0; ient < Settings.allEnts.length; ient++) {
    let entity = Settings.allEnts[ient];
    if (entity.type === Settings.resDB.belt1.id) belts.push(entity);
  }

  for(let ibelt = 0; ibelt < belts.length;) {
    let belt = belts[ibelt];
    if (belt.done) ibelt++
    else {
      // go forward until the first belt
      while(belt) {
        let x = belt.pos.x;
        let y = belt.pos.y;

        let nbPos = Settings.dirToVec[belt.dir];
        let nbTile = window.game.map[x + nbPos.x][y + nbPos.y];
        let nbEntity = Settings.allEnts[nbTile[c.layers.buildings]];
        if (nbEntity && nbEntity.type === Settings.resDB.belt1.id && nbEntity.done === false) belt = nbEntity;
        else break;
      }
      Settings.resDB.belt1.mach.update(window.game.map, belt);
    }
  }

  for(let ibelt = 0; ibelt < belts.length; ibelt++) {
    belts[ibelt].done = false;
  }
*/

  // s.sendAll(JSON.stringify({msg:"updateInv", data:c.allInvs}));
  // s.sendAll(JSON.stringify({msg:"updateEntities", data:c.allEnts}));
  s.sendAll(JSON.stringify({ msg: 'serverTick', data: c.game.tick }))
  setTimeout(update, 100)
}
