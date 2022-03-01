// START HTTP(S) and WS(S)
const express = require('express');
const app = express();

const httpMode = process.argv[2];
const wsMode = process.argv[3];
var port = parseInt(process.argv[4]);

if (httpMode == "https") {
  // HTTPS and WSS
  var https = require("https");
  var fs = require('fs');
  var options = {
    key: fs.readFileSync('../../mynodicom-privkey.pem'),
    cert: fs.readFileSync('../../mynodicom-fullchain.pem')
  };
  port = 443;
} else if (httpMode == "no-http") {
  //port for ws shall be entered
} else {
  // default http
  app.use(express.static('src'));
  port = 80;
}

if(wsMode == "wss") {
  var server = https.createServer(options, app);
  require('express-ws')(app, server);
} else { // default ws
  require('express-ws')(app);
}

app.listen(port);


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
var belt2 = require('./src/entity/belt2/belt2.js');
var stone_furnace = require('./src/entity/stone_furnace/stone_furnace.js');
var chest = require('./src/entity/chest/chest.js');
var player = require('./src/entity/player/player.js');


var perlin = require('perlin-noise');
const { Entity } = require('./src/core/entity.js');


// GENERATE TERRAIN
var terrainmap = perlin.generatePerlinNoise(c.gridSize.y, c.gridSize.x).map(function(x) { return (x * 10); });



new belt.Belt();
new belt2.Belt2();
new inserter.Inserter();
new stone_furnace.StoneFurnace();
new chest.Chest();
let player1 = new player.Player();
//let personDB = [];
let cityDB = [];

c.player1 = player1;
c.player1.setup();
player1.inv.packsize = 64;
player1.inv.itemsize = 1000;


player1.inv.stack["INV"].push({id: c.resDB.stone.id, n: 100});
player1.inv.stack["INV"].push({id: c.resDB.iron.id, n: 100});
player1.inv.stack["INV"].push({id: c.resDB.copper.id, n: 100});
player1.inv.stack["INV"].push({id: c.resDB.raw_wood.id, n: 100});
player1.inv.stack["INV"].push({id: c.resDB.coal.id, n: 50});
player1.inv.stack["INV"].push({id: c.resDB.coal.id, n: 50});
player1.inv.stack["INV"].push({id: c.resDB.coal.id, n: 50});
player1.inv.stack["INV"].push({id: c.resDB.iron_plate.id, n: 170});
/*player1.inv.stack["INV"].push({id: c.resDB.copper_plate.id, n: 170});
player1.inv.stack["INV"].push({id: c.resDB.stone_furnace.id, n: 7});*/
player1.inv.stack["INV"].push({id: c.resDB.belt1.id, n: 1000});
//player1.inv.stack["INV"].push({id: c.resDB.belt2.id, n: 100});

c.allEnts.push(player1);
player1.id = c.allEnts.length-1;

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
        if (perlinVal < 1) resVal = [c.resDB.deepwater.id, 0];
        else if (perlinVal < 2) resVal = [c.resDB.water.id, 0];
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
  player1.inv.remItems(remItems);
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
  for(let i = 0; i < player1.inv.packs.length && newItem; i++) {
    let invObj = player1.inv.packs[i];
    if (newItem.res && invObj.id == newItem.res.id) {
      if (newItem.n == undefined) newItem.n = 1;
      invObj.n += newItem.n;
      newItem = null;
    }
  }
  if (newItem) player1.inv.packs.push({id: newItem.res.id, n: newItem.n});
  updatePlayer();
}

function craftToInv(newItem) {
  let costs = c.resName[newItem[0].res.id].cost;
  for(let iCost = 0; iCost < costs.length; iCost++) {
    let cost = costs[iCost];
    c.player1.inv.remStackItem(cost);      
  }
  c.player1.inv.addItem({id:newItem[0].res.id, n: 1});
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
  ws.uuid = randomUUID();
  s.users.set(ws.uuid, ws);
  if (s.users.size == 1) ws.player = player1;
 // if (users.size == 2) ws.player = player2;
  ws.on('message', function(message) {
    let msg = JSON.parse(message);
    if(msg.cmd == 'keydown' && msg.data == "KeyA") { move(player1.pos.x - 4, player1.pos.y + 0); }
    if(msg.cmd == 'keydown' && msg.data == "KeyD") { move(player1.pos.x + 4, player1.pos.y + 0); }
    if(msg.cmd == 'keydown' && msg.data == "KeyW") { move(player1.pos.x + 0, player1.pos.y - 4); }
    if(msg.cmd == 'keydown' && msg.data == "KeyS") { move(player1.pos.x + 0, player1.pos.y + 4); }
    if(msg.cmd == 'keydown' && msg.data == "Space") { addCity(cityID++, player1.pos.x, player1.pos.y) }
    if(msg.cmd == 'keydown' && msg.data == "ArrowLeft") { 
      //console.log("up:", c.game); 
      c.game = getCityById(c.game.p);/* console.log(c.game);*/
    }
    if (msg.cmd == 'keydown' && msg.data == "ArrowRight") ws.player.dir = 5;
    if (msg.cmd == "addCity") addCity(cityID++, msg.data.x, msg.data.y, msg.data.type);
    if (msg.cmd == "updateEntities") c.allEnts = JSON.parse(JSON.stringify(msg.data));
    if (msg.cmd == "updateInventories") {
      c.allInvs = JSON.parse(JSON.stringify(msg.data));
    }
    if (msg.cmd == "updatePlayerInv") {
      c.player1.invID = msg.data;
    }
    if (msg.cmd == "updateMapData") c.game.map = JSON.parse(JSON.stringify(msg.data));
    if (msg.cmd == "camera") c.game.camera = msg.data.camera;

  });
  ws.on('close', function() {
    if (ws.uuid) s.users.delete(ws.uuid);
  });
  ws.send(JSON.stringify({msg: "id" , data:JSON.stringify(ws.uuid)}));
  ws.send(JSON.stringify({msg: "updateMapData", data:c.game.map}));
  ws.send(JSON.stringify({msg: "updateInventories", data:c.allInvs}));
  ws.send(JSON.stringify({msg: "updateEntities", data: c.allEnts}));
  ws.send(JSON.stringify({msg: "updatePlayerInv", data: player1.invID}));
  ws.send(JSON.stringify({msg: "startGame"}));
}

app.ws('/browser-factorio', protocoll);




function move(x, y) {

  let gp = c.worldToTile({x:x, y:y});
//  console.log(rmap[gp.x][gp.y]);
  if (c.game.map[gp.x][gp.y][0] != 1) {
    player1.pos.x = x;
    player1.pos.y = y;

    let dx,dy,d = false;

    for(let a = 0; a <= 2*Math.PI; a+=Math.PI/4) {
      dx = Math.floor((player1.pos.x + Math.cos(a)*11) / 10);
      dy = Math.floor((player1.pos.y + Math.sin(a)*11) / 10);
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
  s.sendAll(JSON.stringify({msg:"updatePlayer", data: player1}));
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