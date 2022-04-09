const mode = process.argv[2];
const WebSocket   = require('ws');
const https 	    = require("https");
const fs          = require('fs');
const port = 4000;
var wss;
if (mode == "server") {
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
var terrainmap = perlin.generatePerlinNoise(c.gridSize.y, c.gridSize.x).map(function(x) { return (x * 10); });



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
  if (nID == 0) parentID = 0; else parentID = c.game.id;
  let nCity = {
    id: nID, name: "", 
    type: t, 
    x: Math.floor(x/10)*10, 
    y: Math.floor(y/10)*10, 
    map: Array(c.gridSize.x).fill(0).map(()=>Array(c.gridSize.y).fill(0).map(()=>[[undefined, 0], undefined, {id:undefined, n:0}, undefined, undefined, undefined, 0])), 
    camera: {x: 0, y:0, zoom:4}, 
    res: [0, 100, 0, 0, 0, 0, 100, 0, 0, 0, 0], 
    nb:[],
    p: parentID,
    w: [],
    dist: [],
    tick : 0
  };
  
  if (nID == 0) {
    // discrete perlin
    for(let ax = 0; ax < nCity.map.length; ax++) {
      for(let ay = 0; ay < nCity.map[ax].length; ay++) {
        let perlinVal = terrainmap[ax * c.gridSize.y + ay];
        let resVal = 0;
        if (perlinVal < 1) resVal = [c.resDB.deepsea.id, 0];
        else if (perlinVal < 2) resVal = [c.resDB.sea.id, 0];
        else if (perlinVal < 8) resVal = [c.resDB.grassland.id, Math.round(Math.random() * 3)];
        else resVal = [c.resDB.hills.id, Math.round(Math.random() * 3)];

        nCity.map[ax][ay][c.layers.terrain] = resVal;
        nCity.map[ax][ay][c.layers.vis] = 0;
      }
    }

    Object.keys(c.resDB).forEach(name => {
      let res = c.resDB[name];
      if (res.type == "res") {
        var resmap = perlin.generatePerlinNoise(c.gridSize.x, c.gridSize.y).map(function(x) { return (x * 10); });
        for(let ax = 0; ax < nCity.map.length; ax++) {
          for(let ay = 0; ay < nCity.map[ax].length; ay++) {
            let type = nCity.map[ax][ay][c.layers.terrain][0];
            let perlinVal = resmap[ax * c.gridSize.x + ay];
            if (perlinVal > 8 && 
                nCity.map[ax][ay][c.layers.res].id == undefined &&
                nCity.map[ax][ay][c.layers.terrain][0] == c.resDB.grassland.id)
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
  c.player.remItems(remItems);
  updatePlayer();
}

function remStack(rem) {
  delete c.allInvs[rem.invID].stack[rem.invKey];
  s.sendAll(JSON.stringify({msg:"updateInv", data:c.allInvs}));
}

function addStack(add) {
  c.allInvs[add.invID].stack[add.invKey] = add.item;
  s.sendAll(JSON.stringify({msg:"updateInv", data:c.allInvs}));
}

function addToInv(newItem) {
  for(let i = 0; i < c.player.packs.length && newItem; i++) {
    let invObj = c.player.packs[i];
    if (newItem.res && invObj.id == newItem.id) {
      if (newItem.n == undefined) newItem.n = 1;
      invObj.n += newItem.n;
      newItem = null;
    }
  }
  if (newItem) c.player.packs.push({id: newItem.id, n: newItem.n});
  updatePlayer();
}

function craftToInv(newItem) {
  let costs = c.resName[newItem[0].id].cost;
  for(let iCost = 0; iCost < costs.length; iCost++) {
    let cost = costs[iCost];
    c.player.remItem(cost);      
  }
  c.player.addItem({id:newItem[0].id, n: 1});
}


function getCityById(searchID) {
  for (let i = 0; i < cityDB.length; i++) {
    let c = cityDB[i];
    if (c.id == searchID){
      return c;
    }
  }
}

function protocoll(ws, req) {

  let playerID;
  for (var [key, value] of s.users) {
    if (value.online == false) {
      playerID = key;
    }
  }
  if (playerID == undefined) {
    let playerEnt = {};
    c.player.setup(undefined, playerEnt);

    c.allInvs.push(playerEnt);
    playerEnt.id = c.allInvs.length - 1;

    c.allMovableEnts.push(playerEnt.id);
    playerID = c.allInvs.length - 1;
  }

  ws.playerID = playerID;

  s.users.set(playerID, {ws: ws, online: true});

  ws.on('message', function(message) {
    let msg = JSON.parse(message);
    if (msg.cmd == "addCity") addCity(cityID++, msg.data.x, msg.data.y, msg.data.type);
    if (msg.cmd == "updateInventories") {
      c.allInvs = JSON.parse(JSON.stringify(msg.data));
    }
    if (msg.cmd == "updateMapData") {
      c.game.map = JSON.parse(JSON.stringify(msg.data));
      s.sendAll(JSON.stringify({msg:  "updateMapData", data: c.game.map}), ws.playerID);
    }
    if (msg.cmd == "updateEntity") {
      if (msg.data.ent) {
        c.allInvs[msg.data.id] = JSON.parse(JSON.stringify(msg.data.ent));
        s.sendAll(JSON.stringify({msg:  "updateEntity", data: {id: msg.data.id, ent: c.allInvs[msg.data.id]}}), ws.playerID);
        console.log(msg.data);
      }
    } 

  });
  ws.on('close', function() {
    if (ws.playerID != undefined) {
      s.users.set(ws.playerID, {ws: ws, online: false});
    }
  });
  ws.send(JSON.stringify({msg: "id" , data:JSON.stringify(ws.uuid)}));
  ws.send(JSON.stringify({msg: "updateMapData", data:c.game.map}));
  ws.send(JSON.stringify({msg: "updateInventories", data:c.allInvs}));
  s.sendAll(JSON.stringify({
     msg: "updateEntity",
     data: {id: playerID, ent: c.allInvs[playerID] }
  }));
  ws.send(JSON.stringify({msg: "setPlayerID", data: playerID}));
  ws.send(JSON.stringify({msg: "startGame"}));
}
wss.on("connection", protocoll);




function move(x, y) {

  let gp = c.worldToTile({x:x, y:y});
//  console.log(rmap[gp.x][gp.y]);
  if (c.game.map[gp.x][gp.y][0] != 1) {
    c.player.pos.x = x;
    c.player.pos.y = y;

    let dx,dy,d = false;

    for(let a = 0; a <= 2*Math.PI; a+=Math.PI/4) {
      dx = Math.floor((c.player.pos.x + Math.cos(a)*11) / 10);
      dy = Math.floor((c.player.pos.y + Math.sin(a)*11) / 10);
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
  //s.sendAll(JSON.stringify({msg:"updatePlayer", data: c.player}));
}

function discover(x,y) {
  if (x < 0 || y < 0) return;
  if (c.game.map[x][y] != c.game.map[x][y]) {
    c.game.map[x][y] = c.game.map[x][y];
    return true;
  }
  return false;
}

update();
function update(){ 
  c.game.tick++;
   /*
  // machines,  belts and player excluded
  for(let ient = 0; ient < c.allEnts.length; ient++) {
    let entity = c.allEnts[ient];
    if (!entity) continue;
    if(entity.type == c.resDB.belt1.id) continue;
    if(entity.type == c.resDB.player.id) continue;
    if(c.resName[entity.type].mach) {
      c.resName[entity.type].mach.update(c.game.map, entity);
    }
  }

 
  // BELT
  let belts = [];
  for(let ient = 0; ient < c.allEnts.length; ient++) {
    let entity = c.allEnts[ient];
    if (entity.type == c.resDB.belt1.id) belts.push(entity);
  }

  for(let ibelt = 0; ibelt < belts.length;) {
    let belt = belts[ibelt];
    if (belt.done) ibelt++
    else {
      // go forward until the first belt
      while(belt) {
        let x = belt.pos.x;
        let y = belt.pos.y;

        let nbPos = c.dirToVec[belt.dir];
        let nbTile = c.game.map[x + nbPos.x][y + nbPos.y];
        let nbEntity = c.allEnts[nbTile[c.layers.buildings]];
        if (nbEntity && nbEntity.type == c.resDB.belt1.id && nbEntity.done == false) belt = nbEntity;
        else break;
      }
      c.resDB.belt1.mach.update(c.game.map, belt);
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
