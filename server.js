const { randomUUID } = require('crypto');
const express = require('express');
const { StringDecoder } = require('string_decoder');
const app = express();
app.use(express.static('public'));
const users = new Map();
require('express-ws')(app);
var c = require('./public/common.js');
var inventory = require("./public/core/inventory")
const Inventory = require('./public/core/inventory.js').Inventory;

new (require('./public/entity/extractor/extractor.js').Extractor)();
var inserter = require('./public/entity/inserter/inserter.js');
var belt = require('./public/entity/belt1/belt1.js');
var belt2 = require('./public/entity/belt2/belt2.js');
var furnace = require('./public/entity/stone_furnace/stone_furnace.js');
var chest = require('./public/entity/chest/chest.js');
var player = require('./public/entity/player/player.js');


var perlin = require('perlin-noise');
const { Entity } = require('./public/core/entity.js');

var terrainmap = perlin.generatePerlinNoise(c.gridSize.x, c.gridSize.y).map(function(x) { return (x * 10); });

app.listen(80);

new belt.Belt();
new belt2.Belt2();
new inserter.Inserter();
new furnace.Furnace();
new chest.Chest();
let player1 = new player.Player();
//let personDB = [];
let cityDB = [];

c.player1 = player1;
player1.setup();
player1.inv = new Inventory();
player1.inv.packsize = 20;
player1.inv.itemsize = 20;
player1.inv.addItem({id: c.resDB.stone.id, n: 10});
player1.inv.addItem({id: c.resDB.coal.id, n: 87});
player1.inv.addItem({id: c.resDB.iron_plate.id, n: 170});
player1.inv.addItem({id: c.resDB.copper_plate.id, n: 170});
player1.inv.addItem({id: c.resDB.stone_furnace.id, n: 7});
//player1.inv.addItem({id: c.resDB.belt1.id, n: 7});
//player1.inv.addItem({id: c.resDB.chest.id, n: 7});
c.allEnts.push(player1);
player1.id = c.allEnts.length-1;

let cityID = 0, pID = 0;
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
        let perlinVal = terrainmap[ax * c.gridSize.x + ay];
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

    
        /*if (type > 7 && nCity.map[ax][ay][c.layers.res].id == undefined) {
          let res = Math.random();
          if (res > 0.9) resFill(nCity.map, ax, ay,  {id: c.resDB.tree.id, n: Math.floor(Math.random()*8)+3});
          else if (res > 0.7) resFill(nCity.map, ax, ay, {id: c.resDB.coal_ore.id});
          else if (res > 0.4) resFill(nCity.map, ax, ay, {id: c.resDB.stone_ore.id});
          else if (res > 0.2) resFill(nCity.map, ax, ay, {id: c.resDB.iron_ore.id});
          else resFill(nCity.map, ax, ay, {id: c.resDB.copper_ore.id, n : 100});
        } else {
          if (nCity.map[ax][ay][c.layers.res].id == 0 && nCity.map[ax][ay][c.layers.terrain][0] > 2) {
            let randomRes = Math.random();
            if (randomRes > 0.98) nCity.map[ax][ay][c.layers.res] = {id: c.resDB.tree.id, n: Math.floor(Math.random()*8)+3};
            if (randomRes > 0.99) nCity.map[ax][ay][c.layers.res] = {id: c.resDB.stone.id, n : 100};
          }
        }*/

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

function resFill(map, x, y, res) {
  if (map[x] && map[x][y] && map[x][y][c.layers.res].id == undefined && map[x][y][c.layers.terrain][0] > 7) {
    map[x][y][c.layers.res].id = res.id;
    map[x][y][c.layers.res].n = Math.round((map[x][y][c.layers.terrain][0]-7) * 500);
    resFill(map, x + 1, y, res);
    resFill(map, x, y + 1, res);
    resFill(map, x+1, y+1, res);
    resFill(map, x-1, y, res);
    resFill(map, x, y-1, res);
    resFill(map, x-1, y-1, res);
  }
}

function addToInvs(newItems) {
  for(let i = 0; i < newItems.length; i++) {
    let invObj = newItems[i];
    addToInv(invObj);
  }
}

function remFromInv(remItems) {
  player1.inv.remItems(remItems);
  updatePlayer();
}


function addToInv(newItem) {
  for(let i = 0; i < player1.inv.packs.length && newItem; i++) {
    let invObj = player1.inv.packs[i];
    if (invObj.id == newItem.res.id) {
      if (newItem.n == undefined) newItem.n = 1;
      invObj.n += newItem.n;
      newItem = null;
    }
  }
  if (newItem) player1.inv.packs.push({id: newItem.res.id, n: newItem.n});
  updatePlayer();
}


function mineToInv(newItem) {
  if (!newItem) return;
  let tile = c.game.map[newItem.source.x][newItem.source.y];
  for(let i = 0; i < player1.inv.packs.length && newItem; i++) {
    let invObj = player1.inv.packs[i];
    if (invObj.id == newItem.id) {
      invObj.n += newItem.n;
      tile[c.layers.res].n -= newItem.n;
      if (tile[c.layers.res].n == 0) tile[c.layers.res].id = 0;
      newItem = null;
    }
  }
  if (newItem) {
    player1.inv.addItem({id: newItem.id, n: newItem.n});
    tile[c.layers.res].n -= newItem.n;
  }
  updatePlayer();
}

function craftToInv(newItem) {
  for(let c = 0; c < newItem.cost.length; c++) {
    for(let i = 0; i < player1.inv.packs.length; i++) {
        let invObj = player1.inv.packs[i];
        if (invObj.id == newItem.cost[c].res.id) {
            invObj.n -= newItem.cost[c].n;
            if (invObj.n == 0) {
              player1.inv.packs.splice(i, 1);
              i--;
            }
        }
    }
  }
  addToInv({id:newItem.id, n: 1});
}


function getCityById(searchID) {
  for (let i = 0; i < cityDB.length; i++) {
    let c = cityDB[i];
    if (c.id == searchID){
      return c;
    }
  }
}
/*
function getPersonById(searchID) {
  for (let i = 0; i < personDB.length; i++) {
    let c = personDB[i];
    if (c.id == searchID){
      return c;
    }
  }
}*/

app.ws('/', function(ws, req) {
  ws.uuid = randomUUID();
  users.set(ws.uuid, ws);
  if (users.size == 1) ws.player = player1;
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
    if(msg.cmd == 'keydown' && msg.data == "ArrowRight") ws.player.dir = 5;
    if(msg.cmd == "addCity") addCity(cityID++, msg.data.x, msg.data.y, msg.data.type);
    if(msg.cmd == "addEntity") addEntity(msg.data);
    if (msg.cmd == "addItem") addItem(msg.data);
    if (msg.cmd == "remFromInv") remFromInv(msg.data);
    if(msg.cmd == "addToInv") addToInvs(msg.data);
    if(msg.cmd == "mineToInv") mineToInv(msg.data);
    if(msg.cmd == "craftToInv") {craftToInv(msg.data); updatePlayer();}
    if(msg.cmd == "camera") c.game.camera = msg.data.camera;

  });
  ws.on('close', function() {
    if (ws.uuid) users.delete(ws.uuid);
  });
  ws.send(JSON.stringify({msg: "id" , data:JSON.stringify(ws.uuid)}));
  ws.send(JSON.stringify({msg: "updateMapData", data:c.game.map}));
  ws.send(JSON.stringify({msg: "updatePlayer", data: player1}));
  ws.send(JSON.stringify({msg: "updateInv", data:c.allInvs}));
  ws.send(JSON.stringify({msg: "updateEntities", data: c.allEnts}));
});

function sendAll(message) {
  users.forEach((val, key) => {
    val.send(message);
  })
}

function createInv(x, y){
  
  let invID = c.game.map[x][y][c.layers.inv];
  if (invID == undefined) {
      inv = new Inventory(c.allInvs, {x: x, y:y});
      c.game.map[x][y][c.layers.inv] = inv.id;
      invID = inv.id;
  }
  return invID;
}

function addEntity(newEntity) {
  if(!newEntity) return;

  let entID = c.game.map[newEntity.pos.x][newEntity.pos.y][c.layers.buildings];
  if (entID == undefined) {
    let ent = new Entity(c.allEnts, newEntity.pos.x, newEntity.pos.y, newEntity.dir, newEntity.w, newEntity.h, newEntity.type);
    c.game.map[newEntity.pos.x][newEntity.pos.y][c.layers.buildings] = ent.id;
  }
  if (c.resName[newEntity.type].mach && c.resName[newEntity.type].mach.setup) c.resName[newEntity.type].mach.setup(c.game.map, newEntity);
/*  let mach = c.resName[ent.type].mach;
  if (mach) {
    ent.m = new mach(ent);
  }*/
  
  sendAll(JSON.stringify({msg:"updateEntities", data: c.allEnts}));
  sendAll(JSON.stringify({msg: "updateMapData", data:c.game.map}));
}

function addItem(newItem) {
  let inv = undefined;
  let invID = c.game.map[newItem.pos.x][newItem.pos.y][c.layers.inv];
  if (invID == undefined) {
    inv = new Inventory(c.allInvs, newItem.pos);
    c.game.map[newItem.pos.x][newItem.pos.y][c.layers.inv] = inv.id;
  } else inv = inv = c.allInvs[invID];
  
  inv.addItem( {id: newItem.inv.item.id, n: 1});
  sendAll(JSON.stringify({msg:"updateInv", data:c.allInvs}));
}

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
  sendAll(JSON.stringify({msg:"updatePlayer", data: player1}));
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
  // Inertia: no entity, no movement
  c.allInvs.forEach(inv => { inv.changed = false; }  );
  
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

  // time switch
  c.allInvs.forEach(inv => {
    if (inv.changed) {
      inv.packs = JSON.parse(JSON.stringify(inv.nextpacks));
    }
  });


  sendAll(JSON.stringify({msg:"updateInv", data:c.allInvs}));
  setTimeout(update, 50);
}

function fillArray(arr, x, y, dx, dy, d) {
  for(let ix = 0; ix < dx; ix++) {
    for(let iy = 0; iy < dy; iy++) {
      arr[x+ix][y+iy][0] = d;
      arr[x+ix][y+iy][1] = d;
    }
  }
}