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
const { items } = require('./public/item.js');
var perlin = require('perlin-noise');
const { Entity } = require('./public/entity.js');
var perlinmap = perlin.generatePerlinNoise(80, 80).map(function(x) { return Math.round(x * 10); });
app.listen(80);

new extractor.Extractor();
new shifter.Shifter();
//let personDB = [];
let cityDB = [];

let player1 = c.player1;
player1.inv = new inventory.Inventory(c.allInvs, {x: 0, y:0});
player1.inv.addItem({id: c.resDB.stone.id, n: 23});
player1.inv.addItem({id: c.resDB.coal.id, n: 87});
let cityID = 0, pID = 0;
addCity(cityID++, 50, 50, "city")
let city = getCityById(0); //{id: 0, name: "", type: "city", x: 50, y: 50, map: Array(80).fill(0).map(()=>Array(80).fill(0).map(()=>Array(2).fill(1))), rmap:Array(80).fill(0).map(()=>Array(80).fill(0).map(()=>Array(2).fill(1))), camera: {x: 0, y:0, zoom:4}, res: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], nb:[], p: 0, w: [], population: [], dist: []}


function addCity(nID, x, y, t) {
  if (nID == 0) parentID = 0; else parentID = city.id;
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
  /*let p = {x: nCity.x, y: nCity.y}
  console.log("POS:", p);
  nCity.dist[c.resDB.water.id] = findNextRes(nCity.x/10, nCity.y/10, c.resDB.water.id);
  nCity.dist[c.resDB.forest.id] = findNextRes(nCity.x/10, nCity.y/10, c.resDB.forest.id);
  nCity.dist[c.resDB.idea.id] = {x:nCity.x, y:nCity.y}

  for(let i = 0; i < 12; i++) {
    let p = {id:pID++, job:"jobless", path: [], to: -1, pos: {x: nCity.x + i *10, y: nCity.y}};
    nCity.population.push(p);
    personDB.push(p);
  }*/

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
  for(let i = 0; i < player1.inv.items.length && newItem; i++) {
    let invObj = player1.inv.items[i];
    if (invObj.id == newItem.id) {
      invObj.n += newItem.n;
      newItem = null;
    }
  }
  if (newItem) player1.inv.items.push(newItem);
}


function mineToInv(newItem) {
  if (!newItem) return;
  let tile = city.rmap[newItem.source.x][newItem.source.y];
  for(let i = 0; i < player1.inv.items.length && newItem; i++) {
    let invObj = player1.inv.items[i];
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
    for(let i = 0; i < player1.inv.items.length; i++) {
        let invObj = player1.inv.items[i];
        if (invObj.id == newItem.cost[c].id) {
            invObj.n -= newItem.cost[c].n;
            if (invObj.n == 0) {
              player1.inv.items.splice(i, 1);
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
      //console.log("up:", city); 
      city = getCityById(city.p);/* console.log(city);*/
    }
    if(msg.cmd == 'keydown' && msg.data == "ArrowRight") ws.player.dir = 5;
    if(msg.cmd == "addCity") addCity(cityID++, msg.data.x, msg.data.y, msg.data.type);
    if(msg.cmd == "addEntity") addEntity(msg.data);
    if (msg.cmd == "addItem") addItem(msg.data);
    if(msg.cmd == "addToInv") addToInvs(msg.data);
    if(msg.cmd == "mineToInv") mineToInv(msg.data);
    if(msg.cmd == "craftToInv") {craftToInv(msg.data); updatePlayer();}
    if(msg.cmd == "camera") city.camera = msg.data.camera;
    if(msg.cmd == "selCity") {
      console.log(msg);
      city = getCityById(msg.data);
      //console.log(city);
    }
    if(msg.cmd == "conCity") {
      console.log(msg);
      let cityA = getCityById(msg.data.a);
       let cityB = getCityById(msg.data.b);
       //console.log(cityA, cityB);
       cityA.nb.push(cityB.id);
       cityB.nb.push(cityA.id);
     }

  });
  ws.on('close', function() {
    if (ws.uuid) users.delete(ws.uuid);
  });
  ws.send(JSON.stringify({msg: "id" , data:JSON.stringify(ws.uuid)}));
  ws.send(JSON.stringify({msg: "updateMap", data:city}));
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
  city.rmap[newEntity.pos.x][newEntity.pos.y][c.layers.buildings] = newEntity.id;

  let ent = undefined;
  let entID = city.rmap[newEntity.pos.x][newEntity.pos.y][c.layers.buildings];
  if (entID == undefined) {
    ent = new Entity(c.allEnts, newEntity.pos.x, newEntity.pos.y, newEntity.dir, newEntity.w, newEntity.h, newEntity.type);
    city.rmap[newEntity.pos.x][newEntity.pos.y][c.layers.buildings] = ent.id;
  } else {
    ent = ent = c.allInvs[entID];
  }
/*  let mach = c.resName[ent.type].mach;
  if (mach) {
    ent.m = new mach(ent);
  }*/
  
  sendAll(JSON.stringify({msg:"updateEntities", data: c.allEnts}));
  sendAll(JSON.stringify({msg:"updateMap", data:city}));
}

function addItem(newItem) {
  let inv = undefined;
  let invID = city.rmap[newItem.pos.x][newItem.pos.y][c.layers.inv];
  if (invID == undefined) {
    inv = new inventory.Inventory(c.allInvs, newItem.pos);
    city.rmap[newItem.pos.x][newItem.pos.y][c.layers.inv] = inv.id;
  } else inv = inv = c.allInvs[invID];
  
  inv.addItem( {id: newItem.inv.id, n: newItem.inv.n});
  sendAll(JSON.stringify({msg:"updateInv", data:c.allInvs}));
  sendAll(JSON.stringify({msg:"updateMap", data:city}));
}

function worldToGrid(x, y) {
  return {x: Math.round(x/10), y: Math.floor(y/10)};
}

function move(x, y) {

  let gp = worldToGrid(x, y);
//  console.log(rmap[gp.x][gp.y]);
  if (city.rmap[gp.x][gp.y][0] != 1) {
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
      //sendAll(JSON.stringify({msg:"map", data: {city.rmap}}));
    }
  }
  updatePlayer();
}

function updatePlayer() {
  sendAll(JSON.stringify({msg:"updatePlayer", data: player1}));
}

function discover(x,y) {
  if (city.map[x][y] != city.rmap[x][y]) {
    city.map[x][y] = city.rmap[x][y];
    return true;
  }
  return false;
}

render();
function render(){ 
  setTimeout(render, 500);

  for(let ient = 0; ient < c.allEnts.length; ient++) {
      let entity = c.allEnts[ient];
      let x = entity.pos.x;
      let y = entity.pos.y;
      let tile = city.map[x][y];
      let inv = tile[c.layers.inv];

      /*if (entity.type == c.resDB.belt.id) {
        let nbPos = c.dirToVec[entity.dir];
        let nbTile = city.map[x + nbPos.x][y + nbPos.y];
      
        if (entity != undefined && inv) {
          let nb = c.allEnts[nbTile[c.layers.buildings]]; // next building
          let nbInv = nbTile[c.layers.inv];
          if (nb && nbInv == undefined) {
            let type = nb.type;
            if (type == c.resDB.belt.id &&   // this belt?
              nb && nb.type == c.resDB.belt.id && // adj. belt?
              nbTile[c.layers.inext] == undefined // adj. next time empty?
            ) 
            {
              nbTile[c.layers.inext] = inv;
            } 
          } else {
            tile[c.layers.inext] = inv;
          }        
        }
      } else {
        c.bookFromInv(c.allInvs[inv], c.resName[entity.type].output, false);
      }*/

      if(entity && c.resName[entity.type].mach) {
        c.resName[entity.type].mach.update(city.map, entity);
      }
  }
  c.allInvs.forEach(inv => {
    let ent = city.map[inv.pos.x][inv.pos.y][c.layers.buildings];
    if (ent == undefined) {
      inv.addItems(inv.items, true);
    }
  }
  );

  // time switch
  c.allInvs.forEach(inv => {
    inv.items = JSON.parse(JSON.stringify(inv.nextitems));
    inv.nextitems = [];
  }
  );
  /*for(let ax = 0; ax < city.map.length; ax++) {
    for(let ay = 0; ay < city.map[ax].length; ay++) {
      let tile = city.map[ax][ay];
      tile[c.layers.inv] = tile[c.layers.inext];
    }
  }
  for(let ax = 0; ax < city.map.length; ax++) {
    for(let ay = 0; ay < city.map[ax].length; ay++) {
      let tile = city.map[ax][ay];
      tile[c.layers.inext] = undefined;
    }
  }*/
  sendAll(JSON.stringify({msg:"updateInv", data:c.allInvs}));
  sendAll(JSON.stringify({msg: "updateMapData", data:city.map}));
}

function fillArray(arr, x, y, dx, dy, d) {
  for(let ix = 0; ix < dx; ix++) {
    for(let iy = 0; iy < dy; iy++) {
      arr[x+ix][y+iy][0] = d;
      arr[x+ix][y+iy][1] = d;
    }
  }
}