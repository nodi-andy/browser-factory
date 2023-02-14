const mode = process.argv[2];
const WebSocket   = require('ws');
const https 	    = require("https");
const fs          = require('fs');
const port = 4000;
var wss;
if (mode === "server") {
  const server = https.createServer({
        key: fs.readFileSync('../../mynodicom-privkey.pem'),
        cert: fs.readFileSync('../../mynodicom-fullchain.pem')
      }
  );
  wss = new WebSocket.Server({ server });
  server.listen(port);
} else {
  wss = new WebSocket.Server({port: port});
}

console.log("Listening to: " + port);


// LOAD CORE LIBS
const { StringDecoder } = require('string_decoder');
const { randomUUID } = require('crypto');
var c = require('./src/common.js');
var invfuncs = require('./src/core/inventory.js');
const Inventory = invfuncs.Inventory;
var s = require("./socket");


new (require('./src/entity/burner_miner/burner_miner.js').BurnerMiner)();
new (require('./src/entity/inserter_burner/inserter_burner.js').InserterBurner)();
var inserter = require('./src/entity/inserter/inserter.js');
var belt = require('./src/entity/belt1/belt1.js');
var stone_furnace = require('./src/entity/stone_furnace/stone_furnace.js');
var chest = require('./src/entity/chest/chest.js');
var player = require('./src/entity/player/player.js');


var perlin = require('perlin-noise');
const { Entity } = require('./src/core/entity.js');


// GENERATE TERRAIN
var terrainmap = perlin.generatePerlinNoise(Settings.gridSize.y, Settings.gridSize.x).map(function(x) { return (x * 10); });



new belt.Belt();
new inserter.Inserter();
new stone_furnace.StoneFurnace();
new chest.Chest();
c.player = new player.Player();
c.allMovableEnts = [];
//let personDB = [];
let cityDB = [];



let cityID = 0;
addCity(cityID++, 50, 50, "c.game")
c.game = getCityById(0);


function addCity(nID, x, y, t) {
  if (nID === 0) parentID = 0; else parentID = window.game.id;
  let nCity = {
    id: nID, name: "", 
    type: t, 
    x: Math.floor(x/10)*10, 
    y: Math.floor(y/10)*10, 
    map: Array(Settings.gridSize.x).fill(0).map(()=>Array(Settings.gridSize.y).fill(0).map(()=>[[undefined, 0], undefined, {id:undefined, n:0}, undefined, undefined, undefined, 0])), 
    res: [0, 100, 0, 0, 0, 0, 100, 0, 0, 0, 0], 
    nb:[],
    p: parentID,
    w: [],
    dist: [],
    tick : 0
  };
  
  if (nID === 0) {
    // discrete perlin
    for(let ax = 0; ax < nCity.map.length; ax++) {
      for(let ay = 0; ay < nCity.map[ax].length; ay++) {
        let perlinVal = terrainmap[ax * Settings.gridSize.y + ay];
        let resVal = 0;
        if (perlinVal < 1) resVal = [c.resDB.deepsea.id, 0];
        else if (perlinVal < 2) resVal = [c.resDB.sea.id, 0];
        else if (perlinVal < 8) resVal = [c.resDB.grassland.id, Math.round(Math.random() * 3)];
        else resVal = [c.resDB.hills.id, Math.round(Math.random() * 3)];

        nCity.map[ax][ay][c.layers.terrain] = resVal;
        nCity.map[ax][ay][c.layers.vis] = 0;
      }
    }

    Object.keys(Settings.resDB).forEach(name => {
      let res = Settings.resDB[name];
      if (res.type === "res") {
        var resmap = perlin.generatePerlinNoise(Settings.gridSize.x, Settings.gridSize.y).map(function(x) { return (x * 10); });
        for(let ax = 0; ax < nCity.map.length; ax++) {
          for(let ay = 0; ay < nCity.map[ax].length; ay++) {
            let type = nCity.map[ax][ay][c.layers.terrain][0];
            let perlinVal = resmap[ax * Settings.gridSize.x + ay];
            if (perlinVal > 8 && 
                nCity.map[ax][ay][c.layers.res].id == null &&
                nCity.map[ax][ay][c.layers.terrain][0] === Settings.resDB.grassland.id)
            {
              nCity.map[ax][ay][c.layers.res].id = res.id;
              nCity.map[ax][ay][c.layers.res].n = Math.round((perlinVal - 8) * 300);
            }
          }
        }
    
      }
    });

  } else {
    let pCity = getCityById(nCity.p);
    for(let ax = 0; ax < nCity.map.length; ax++) {
      for(let ay = 0; ay < nCity.map[ax].length; ay++) {
        nCity.map[ax][ay][c.layers.terrain][0] = pCity.map[Math.floor(nCity.x/10) - 4 + Math.floor(ax/10)][Math.floor(nCity.y/10) - 4 + Math.floor(ay/10)][0];
      }
    }
    pCity.w.push(nCity);
  }

  cityDB.push(nCity);
}


function remFromInv(remItems) {
  Settings.player.remItems(remItems);
  updatePlayer();
}

function remStack(rem) {
  delete window.game.allInvs[rem.invID].stack[rem.invKey];
  s.sendAll(JSON.stringify({msg:"updateInv", data:c.allInvs}));
}

function addStack(add) {
  window.game.allInvs[add.invID].stack[add.invKey] = add.item;
  s.sendAll(JSON.stringify({msg:"updateInv", data:c.allInvs}));
}

function addToInv(newItem) {
  for(let i = 0; i < Settings.player.packs.length && newItem; i++) {
    let invObj = Settings.player.packs[i];
    if (newItem.res && invObj.id === newItem.id) {
      if (newItem.n == null) newItem.n = 1;
      invObj.n += newItem.n;
      newItem = null;
    }
  }
  if (newItem) Settings.player.packs.push({id: newItem.id, n: newItem.n});
  updatePlayer();
}

function craftToInv(newItem) {
  let costs = Settings.resName[newItem[0].id].cost;
  for(let iCost = 0; iCost < costs.length; iCost++) {
    let cost = costs[iCost];
    Settings.player.remItem(cost);      
  }
  Settings.player.addItem({id:newItem[0].id, n: 1});
}


function getCityById(searchID) {
  for (let i = 0; i < cityDB.length; i++) {
    let c = cityDB[i];
    if (Settings.id === searchID){
      return c;
    }
  }
}

function protocoll(ws, req) {

  let playerID;
  for (var [key, value] of s.users) {
    if (value.online === false) {
      playerID = key;
    }
  }
  if (playerID == null) {
    let playerEnt = {};
    Settings.player.setup(undefined, playerEnt);

    window.game.allInvs.push(playerEnt);
    playerEnt.id = window.game.allInvs.length - 1;

    Settings.allMovableEnts.push(playerEnt.id);
    playerID = window.game.allInvs.length - 1;
  }

  ws.playerID = playerID;

  s.users.set(playerID, {ws: ws, online: true});

  ws.on('message', function(message) {
    let msg = JSON.parse(message);
    if (msg.cmd === "addCity") addCity(cityID++, msg.data.x, msg.data.y, msg.data.type);
    if (msg.cmd === "updateInventories") {
      window.game.allInvs = JSON.parse(JSON.stringify(msg.data));
    }
    if (msg.cmd === "updateMapData") {
      window.game.map = JSON.parse(JSON.stringify(msg.data));
      s.sendAll(JSON.stringify({msg:  "updateMapData", data: window.game.map}), ws.playerID);
    }
    if (msg.cmd === "updateEntity") {
      if (msg.data.ent) {
        window.game.allInvs[msg.data.id] = JSON.parse(JSON.stringify(msg.data.ent));
        s.sendAll(JSON.stringify({msg:  "updateEntity", data: {id: msg.data.id, ent: window.game.allInvs[msg.data.id]}}), ws.playerID);
        console.log(msg.data);
      }
    } 

  });
  ws.on('close', function() {
    if (ws.playerID !== undefined) {
      s.users.set(ws.playerID, {ws: ws, online: false});
    }
  });
  ws.send(JSON.stringify({msg: "id" , data:JSON.stringify(ws.uuid)}));
  ws.send(JSON.stringify({msg: "updateMapData", data:c.game.map}));
  ws.send(JSON.stringify({msg: "updateInventories", data:c.allInvs}));
  s.sendAll(JSON.stringify({
     msg: "updateEntity",
     data: {id: playerID, ent: window.game.allInvs[playerID] }
  }));
  ws.send(JSON.stringify({msg: "setPlayerID", data: playerID}));
  ws.send(JSON.stringify({msg: "startGame"}));
}
wss.on("connection", protocoll);




function move(x, y) {

  let gp = Settings.worldToTile({x:x, y:y});
//  console.log(rmap[gp.x][gp.y]);
  if (window.game.map[gp.x][gp.y][0] !== 1) {
    Settings.player.pos.x = x;
    Settings.player.pos.y = y;

    let dx,dy,d = false;

    for(let a = 0; a <= 2*Math.PI; a+=Math.PI/4) {
      dx = Math.floor((Settings.player.pos.x + Math.cos(a)*11) / 10);
      dy = Math.floor((Settings.player.pos.y + Math.sin(a)*11) / 10);
      d = d || discover(dx,dy);
    }

    if (d) {
      //console.log(dx,dy);
      //sendAll(JSON.stringify({msg:"map", data: {c.game.map}}));
    }
  }
  updatePlayer();
}

function updatePlayer() {
  //s.sendAll(JSON.stringify({msg:"updatePlayer", data: Settings.player}));
}

function discover(x,y) {
  if (x < 0 || y < 0) return;
  if (window.game.map[x][y] !== window.game.map[x][y]) {
    window.game.map[x][y] = window.game.map[x][y];
    return true;
  }
  return false;
}

update();
function update(){ 
  window.game.tick++;
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

  //s.sendAll(JSON.stringify({msg:"updateInv", data:c.allInvs}));
  //s.sendAll(JSON.stringify({msg:"updateEntities", data:c.allEnts}));
  s.sendAll(JSON.stringify({msg:"serverTick", data:c.game.tick}));
  setTimeout(update, 100);
}
