const { randomUUID } = require('crypto');
const express = require('express');
const { StringDecoder } = require('string_decoder');
const app = express();
app.use(express.static('public'));
const users = new Map();
require('express-ws')(app);
var c = require('./public/common.js');
var inventory = require('./public/inventory.js');
var extractor = require('./public/extractor.js');
var shifter = require('./public/shifter.js');
var belt = require('./public/belt.js');
var furnace = require('./public/furnace.js');


var perlin = require('perlin-noise');
const { Entity } = require('./public/entity.js');
var perlinmap = perlin.generatePerlinNoise(80, 80).map(function(x) { return Math.round(x * 10); });
app.listen(80);

new belt.Belt();
new shifter.Shifter();
new extractor.Extractor();
new furnace.Furnace();
//let personDB = [];
let cityDB = [];

let player1 = c.player1;
player1.inv = new inventory.Inventory(undefined, {x: 0, y:0});
player1.inv.packsize = 20;
player1.inv.itemsize = 20;
player1.inv.addItem({id: c.resDB.stone.id, n: 1});
player1.inv.addItem({id: c.resDB.coal.id, n: 87});
player1.inv.addItem({id: c.resDB.furnace.id, n: 7});
player1.inv.addItem({id: c.resDB.belt.id, n: 7});
player1.inv.addItem({id: c.resDB.chest.id, n: 7});
let cityID = 0, pID = 0;
addCity(cityID++, 50, 50, "c.city")
c.city = getCityById(0); //{id: 0, name: "", type: "c.city", x: 50, y: 50, map: Array(80).fill(0).map(()=>Array(80).fill(0).map(()=>Array(2).fill(1))), rmap:Array(80).fill(0).map(()=>Array(80).fill(0).map(()=>Array(2).fill(1))), camera: {x: 0, y:0, zoom:4}, res: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], nb:[], p: 0, w: [], population: [], dist: []}


function addCity(nID, x, y, t) {
  if (nID == 0) parentID = 0; else parentID = c.city.id;
  let nCity = {id: nID, name: "", type: t, x: Math.floor(x/10)*10, y: Math.floor(y/10)*10, map: Array(80).fill(0).map(()=>Array(80).fill(0).map(()=>[0, 0, {id:0, n:0}, undefined, undefined, undefined, 0])), camera: {x: 0, y:0, zoom:4}, res: [0, 100, 0, 0, 0, 0, 100, 0, 0, 0, 0], nb:[], p: parentID, w: [], population : [], dist: []};
  nCity.rmap = Array(80).fill(0).map(()=>Array(80).fill(0).map(()=>[0, 0, {id:0, n:0}, undefined, undefined, undefined, 0]));


  if (nID == 0) {
    for(let ax = 0; ax < nCity.map.length; ax++) {
      for(let ay = 0; ay < nCity.map[ax].length; ay++) {
        let type = perlinmap[ax*80+ay];
        nCity.rmap[ax][ay][c.layers.terrain] = type;
        nCity.rmap[ax][ay][c.layers.vis] = 0;
      }
    }
    for(let ax = 0; ax < nCity.map.length; ax++) {
      for(let ay = 0; ay < nCity.map[ax].length; ay++) {
        let type = nCity.rmap[ax][ay][c.layers.terrain];
        if (type > 7 && nCity.rmap[ax][ay][c.layers.res].id == 0) {
          let res = Math.random();
          if (res > 0.9) resFill(nCity.rmap, ax, ay,  {id: c.resDB.tree.id, n: Math.floor(Math.random()*8)+3});
          else if (res > 0.7) resFill(nCity.rmap, ax, ay, {id: c.resDB.coal.id, n : 100});
          else if (res > 0.4) resFill(nCity.rmap, ax, ay, {id: c.resDB.stone.id, n : 100});
          else if (res > 0.2) resFill(nCity.rmap, ax, ay, {id: c.resDB.iron.id, n : 100});
          else resFill(nCity.rmap, ax, ay, {id: c.resDB.copper.id, n : 100});
        } else {
          if (nCity.rmap[ax][ay][c.layers.res].id == 0 && nCity.rmap[ax][ay][c.layers.terrain] > 2) {
            let randomRes = Math.random();
            if (randomRes > 0.98) nCity.rmap[ax][ay][c.layers.res] = {id: c.resDB.tree.id, n: Math.floor(Math.random()*8)+3};
            if (randomRes > 0.99) nCity.rmap[ax][ay][c.layers.res] = {id: c.resDB.stone.id, n : 100};
          }
        }
      }
    }
  } else {
    let pCity = getCityById(nCity.p);
    for(let ax = 0; ax < nCity.map.length; ax++) {
      for(let ay = 0; ay < nCity.map[ax].length; ay++) {
        nCity.map[ax][ay][c.layers.terrain] = pCity.map[Math.floor(nCity.x/10) - 4 + Math.floor(ax/10)][Math.floor(nCity.y/10) - 4 + Math.floor(ay/10)][0];
      }
    }
    pCity.w.push(nCity);
  }

  nCity.map = nCity.rmap;
  cityDB.push(nCity);
}

function resFill(map, x, y, res) {
  if (map[x] && map[x][y] && map[x][y][c.layers.res].id == 0 && map[x][y][c.layers.terrain] > 7) {
    map[x][y][c.layers.res].id = res.id;
    if (res.id == c.resDB.tree.id) map[x][y][c.layers.res].n = Math.floor(Math.random()*8)+3; 
    else map[x][y][c.layers.res].n = res.n;
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


function addToInv(newItem) {
  for(let i = 0; i < player1.inv.packs.length && newItem; i++) {
    let invObj = player1.inv.packs[i];
    if (invObj.id == newItem.id) {
      invObj.n += newItem.n;
      newItem = null;
    }
  }
  if (newItem) player1.inv.packs.push(newItem);
}


function mineToInv(newItem) {
  if (!newItem) return;
  let tile = c.city.rmap[newItem.source.x][newItem.source.y];
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
        if (invObj.id == newItem.cost[c].id) {
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
      //console.log("up:", c.city); 
      c.city = getCityById(c.city.p);/* console.log(c.city);*/
    }
    if(msg.cmd == 'keydown' && msg.data == "ArrowRight") ws.player.dir = 5;
    if(msg.cmd == "addCity") addCity(cityID++, msg.data.x, msg.data.y, msg.data.type);
    if(msg.cmd == "addEntity") addEntity(msg.data);
    if (msg.cmd == "addItem") addItem(msg.data);
    if(msg.cmd == "addToInv") addToInvs(msg.data);
    if(msg.cmd == "mineToInv") mineToInv(msg.data);
    if(msg.cmd == "craftToInv") {craftToInv(msg.data); updatePlayer();}
    if(msg.cmd == "camera") c.city.camera = msg.data.camera;

  });
  ws.on('close', function() {
    if (ws.uuid) users.delete(ws.uuid);
  });
  ws.send(JSON.stringify({msg: "id" , data:JSON.stringify(ws.uuid)}));
  ws.send(JSON.stringify({msg: "updateMap", data:c.city}));
  ws.send(JSON.stringify({msg: "updatePlayer", data: player1}));
  ws.send(JSON.stringify({msg: "updateInv", data:c.allInvs}));
  ws.send(JSON.stringify({msg: "updateEntities", data: c.allEnts}));
});

function sendAll(message) {
  users.forEach((val, key) => {
    val.send(message);
  })
}

function addEntity(newEntity) {
  if(!newEntity) return;

  let entID = c.city.rmap[newEntity.pos.x][newEntity.pos.y][c.layers.buildings];
  if (entID == undefined) {
    let ent = new Entity(c.allEnts, newEntity.pos.x, newEntity.pos.y, newEntity.dir, newEntity.w, newEntity.h, newEntity.type);
    c.city.rmap[newEntity.pos.x][newEntity.pos.y][c.layers.buildings] = ent.id;
  }
/*  let mach = c.resName[ent.type].mach;
  if (mach) {
    ent.m = new mach(ent);
  }*/
  
  sendAll(JSON.stringify({msg:"updateEntities", data: c.allEnts}));
  sendAll(JSON.stringify({msg:"updateMap", data:c.city}));
}

function addItem(newItem) {
  let inv = undefined;
  let invID = c.city.rmap[newItem.pos.x][newItem.pos.y][c.layers.inv];
  if (invID == undefined) {
    inv = new inventory.Inventory(c.allInvs, newItem.pos);
    c.city.rmap[newItem.pos.x][newItem.pos.y][c.layers.inv] = inv.id;
  } else inv = inv = c.allInvs[invID];
  
  inv.addItem( {id: newItem.inv.id, n: newItem.inv.n});
  sendAll(JSON.stringify({msg:"updateInv", data:c.allInvs}));
  sendAll(JSON.stringify({msg:"updateMap", data:c.city}));
}

function worldToGrid(x, y) {
  return {x: Math.round(x/10), y: Math.floor(y/10)};
}

function move(x, y) {

  let gp = worldToGrid(x, y);
//  console.log(rmap[gp.x][gp.y]);
  if (c.city.rmap[gp.x][gp.y][0] != 1) {
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
      //sendAll(JSON.stringify({msg:"map", data: {c.city.rmap}}));
    }
  }
  updatePlayer();
}

function updatePlayer() {
  sendAll(JSON.stringify({msg:"updatePlayer", data: player1}));
}

function discover(x,y) {
  if (c.city.map[x][y] != c.city.rmap[x][y]) {
    c.city.map[x][y] = c.city.rmap[x][y];
    return true;
  }
  return false;
}

render();
function render(){ 
  setTimeout(render, 500);

  // Inertia: no entity, no movement
  c.allInvs.forEach(inv => { inv.changed = false; }  );

  
  // shifter, extractor
  for(let ient = 0; ient < c.allEnts.length; ient++) {
    let entity = c.allEnts[ient];
    if(entity && (entity.type == c.resDB.shifter.id || entity.type == c.resDB.extractor.id || entity.type == c.resDB.furnace.id) && c.resName[entity.type].mach) {
      c.resName[entity.type].mach.update(c.city.map, entity);
    }
  }

  // BELT
  let belts = [];
  for(let ient = 0; ient < c.allEnts.length; ient++) {
    let entity = c.allEnts[ient];
    if (entity.type == c.resDB.belt.id) belts.push(entity);
  }

  for(let ibelt = 0; ibelt < belts.length;) {
    let belt = belts[ibelt];
    if (belt.done) ibelt++
    else {
      while(belt) {
        let x = belt.pos.x;
        let y = belt.pos.y;

        let nbPos = c.dirToVec[belt.dir];
        let nbTile = c.city.map[x + nbPos.x][y + nbPos.y];
        let nbEntity = c.allEnts[nbTile[c.layers.buildings]];
        if (nbEntity && nbEntity.type == c.resDB.belt.id && nbEntity.done == false) belt = nbEntity;
        else break;
      }
      c.resDB.belt.mach.update(c.city.map, belt);
    }
  }

  /*// Inertia: no entity, no movement
  c.allInvs.forEach(inv => {
    let ent = c.city.map[inv.pos.x][inv.pos.y][c.layers.buildings];
    if (ent == undefined) {
      inv.addItems(inv.packs, true);
    }
  }
  );*/

  // time switch
  c.allInvs.forEach(inv => {
    if (inv.changed) {
      inv.packs = JSON.parse(JSON.stringify(inv.nextpacks));
      inv.nextpacks = [];
    }
  }
  );

  for(let ibelt = 0; ibelt < belts.length; ibelt++) {
    belts[ibelt].done = false;
  }

  sendAll(JSON.stringify({msg:"updateInv", data:c.allInvs}));
  sendAll(JSON.stringify({msg: "updateMapData", data:c.city.map}));
}

function fillArray(arr, x, y, dx, dy, d) {
  for(let ix = 0; ix < dx; ix++) {
    for(let iy = 0; iy < dy; iy++) {
      arr[x+ix][y+iy][0] = d;
      arr[x+ix][y+iy][1] = d;
    }
  }
}