if (typeof window === 'undefined') {
  var c = require('../common.js');
  var s = require("../../socket.js");
  var e = require('./entity.js');
} 

class Inventory {
    constructor(inv, pos) {
        this.stack = {};
        if (pos) this.pos = {x: pos.x, y: pos.y};
        this.stacksize = 1;
        this.packsize = 1;
        this.itemsize = 1;
        if (inv) {
          inv.push(this);
          this.id = inv.length - 1;
          if (pos) {
            let tile = c.game.map[pos.x][pos.y];
            tile[c.layers.inv] = this.id;
          }
        }
    }

    moveItemTo(item, to) {
      if (to.addStackItem(item)) {
            this.remStackItem({res: item, n: item.n});
      }
    }

    addStackItem(newItem, stackName) {
      if (newItem == undefined) return false;
      if (stackName == undefined) stackName = "INV";
      let keys = Object.keys(this.stack);
      if (this.stack[stackName] == undefined) this.stack[stackName] = [];

      for(let iSearch = 0; iSearch < 2; iSearch++) {
        //for(let iStack = 0; iStack < keys.length && newItem; iStack++)
        {
          let key = stackName;//keys[iStack];

          for(let iPack = 0; iPack < this.stack[key].length || (iSearch == 1 && iPack == 0); iPack++) {
              let pack = this.stack[key][iPack];
              if (pack == undefined && iSearch == 0) continue;
              if (pack)
              { 
                if (pack.id == undefined) pack.id = newItem.id;
                if (pack.id == newItem.id) {
                  if (pack.n + newItem.n <= this.itemsize) {
                    pack.n += newItem.n;
                    return true;
                  }
                }
              }
              let lastSlot = (iPack == this.stack[key].length-1 && iPack < this.packsize)  // new slot at the end
              let freeSlot = (pack == undefined && this.stack[key].length < this.packsize && iSearch == 1) // empty slot
              if (freeSlot || lastSlot ){
                  if (lastSlot) iPack++
                  this.stack[key][iPack] = {};
                  this.stack[key][iPack].id = newItem.id;
                  this.stack[key][iPack].n = newItem.n;
                  return true;
              } 
          }
        }
      }
      
      return false;
    }

    addStackItems(newItems) {
      let ret = true;
      for(let i = 0; i < newItems.length; i++) {
        ret = ret && this.addStackItem(newItems[i]);
      }
      return ret;
    }

    remStackItem(removingItem) {
        if (removingItem == undefined) return false;

        let keys = Object.keys(this.stack);
        for(let iStack = 0; iStack < keys.length && removingItem; iStack++) {
          let key = keys[iStack];
          if (Array.isArray(this.stack[key]) == false) {
            let pack = this.stack[key];
            if (pack && pack.id == removingItem.res.id) {
              let n = pack.n - removingItem.n;
              if (n > 0) {
                pack.n = n;
                return true;
              } else if (n == 0) {
                delete this.stack[key];
                return true;
              } else return false;
            }
          } else {
            for(let iPack = 0; iPack < this.stack[key].length && removingItem; iPack++) {
              let pack = this.stack[keys][iPack];
              if (pack && pack.id == removingItem.res.id) { // Find the pack
                let n = pack.n - removingItem.n;
                if (n > 0) {
                  pack.n = n;
                  return true;
                } else if (n == 0) {
                  this.stack[keys].splice(iPack, 1); // Remove empty pack
                  iPack--;
                  return true;
                } else return false;
              }
            }
          }
        }
        return false;
    }

    remPack(stackName, packPos) {
      let stack = this.stack[stackName];
      if (stack) {
        let pack = stack[packPos];
        if (pack) {
          stack.splice(packPos, 1);
        }
      }
    }

    addPack(stackName, packPos, pack) {
      let stack = this.stack[stackName];
      if (stack) {
        stack.splice(packPos, 0, pack);
      }
    }

    remStackItems(newItems) {
      let ret = true;
      for(let i = 0; i < newItems.length; i++) {
        ret = ret && this.remStackItem(newItems[i]);
      }
      return ret;
    }

    remStack(stackKey) {
      delete this.stack[stackKey];
    }
  
    remItems(newItems) {
      let ret = true;
      for(let i = 0; i < newItems.length; i++) {
        ret = ret && this.remItem(newItems[i]);
      }
      return ret;
    }

    hasStackItem(searchItem) {
      let keys = Object.keys(this.stack);
      for(let iStack = 0; iStack < keys.length && searchItem; iStack++) {
        let key = keys[iStack];
        for(let iPack = 0; iPack < this.stack[key].length && searchItem; iPack++) {
          let pack = this.stack[keys][iPack];
          if (pack && pack.id == searchItem.res.id) { // Find the pack
             return (pack.n >= searchItem.n);
          }
        }
      }
      return false;
    }

    hasStackItems(searchItem) {
      let ret = true;
      for(let i = 0; i < searchItem.length; i++) {
        ret = ret && this.hasStackItem(searchItem[i]);
      }
      return ret;
    }

    getNumberOfItems(type) {
      let n = 0;
      let keys = Object.keys(this.stack);
      for(let iStack = 0; iStack < keys.length; iStack++) {
        let key = keys[iStack];
        for(let iPack = 0; iPack < this.stack[key].length; iPack++) {
          let pack = this.stack[key][iPack];
          if (pack && pack.id == type) {
            n += pack.n;
          }
        }
      }
      return n;
    }

    getFirstPack(pref) {
      let key;
      if (pref) key = pref;
      else  {
        let keys = Object.keys(this.stack);
        if(keys.length) key = keys[0];
      }
      let pack = this.stack[key];
      if (Array.isArray(pack)) pack = pack[0];
      return pack;
    }
    
    draw(ctx) {
        context.beginPath();
        ctx.fillStyle = "rgba(120, 120, 120, 0.9)";
        ctx.rect(this.x, this.y, this.w, this.h);
        ctx.fill();
        context.font = "48px Arial";
        context.fillText(this.t, this.x, this.y + 48);
    }
}


function mineToInv(minedItem) {
  let newItem = {};
  newItem.id = resName[minedItem.id].becomes.id;
  newItem.n = 1;
  game.map[minedItem.source.x][minedItem.source.y][layers.res].n--;
  c.player1.inv.addStackItem(newItem);
  view.updateInventoryMenu(c.player1.inv);
}

function craftToInv(inv, items) {
  if (!items) return;
  items.forEach(item => {
      let itemsExist = true;
      for(let c = 0; c < item.cost.length && itemsExist; c++) {
          itemsExist = false;
          itemsExist = inv.hasStackItems(item.cost);
      }
      if (itemsExist) { 
          let newItem = {id: item.id, n: 1} ;
          c.player1.inv.addStackItem(newItem);
          for(let c = 0; c < item.cost.length; c++) {
            inv.remStackItems(item.cost);
          }
          view.updateInventoryMenu(c.player1.inv);
      }
      return itemsExist;
  })

}

function getInv(x, y, create = false){
  let tile = c.game.map[x][y];
  if (tile[c.layers.inv] == undefined && create)  createInvOnMap(x, y);
  return c.allInvs[tile[c.layers.inv]];
}

function getEnt(x, y){
  let tile = c.game.map[x][y];
  if (tile[c.layers.buildings] != undefined) return c.allEnts[tile[c.layers.buildings]];
}

function setInv(x, y, invID){
  let tile = c.game.map[x][y];
  tile[c.layers.inv] = invID;
}

function setEnt(x, y, entID){
  let tile = c.game.map[x][y];
  tile[c.layers.buildings] = entID;
}

function createInvOnMap(x, y){
  let invID = c.game.map[x][y][c.layers.inv];
  if (invID == undefined) {
      inv = new Inventory(c.allInvs, {x: x, y:y});
      c.game.map[x][y][c.layers.inv] = inv.id;
      invID = inv.id;
  }
  return invID;
}

function createInv() {
  c.allInvs.push(new invfuncs.Inventory());
  return c.allInvs.length-1;
}

function addEntity(newEntity, updateDir) {
  if(!newEntity) return;

  let entID = c.game.map[newEntity.pos.x][newEntity.pos.y][c.layers.buildings];
  if (entID == undefined) {
    if (c.pointer.item.n > 0) {
      let ent = new e.Entity(c.allEnts, newEntity.pos.x, newEntity.pos.y, newEntity.dir, newEntity.w, newEntity.h, newEntity.type);
      c.game.map[newEntity.pos.x][newEntity.pos.y][c.layers.buildings] = ent.id;
      if (typeof window !== "undefined") view.updateInventoryMenu(c.player1.inv);
      c.pointer.item.n--;
      if (c.pointer.item.n == 0) c.pointer.item = undefined;
    }
    if (c.isBrowser) {
      if (c.resName[newEntity.type].mach && c.resName[newEntity.type].mach.setup) c.resName[newEntity.type].mach.setup(c.game.map, newEntity);
    }
  }
  
  /*if (updateDir) {
    sendAll(JSON.stringify({msg:"updateEntities", data: c.allEnts}));
    sendAll(JSON.stringify({msg:"updateInventories", data: c.allInvs}));
    sendAll(JSON.stringify({msg: "updateMapData", data:c.game.map}));
  } else {
    wssend({cmd: "updateEntities", data: c.allEnts});
    wssend({cmd: "updateInventories", data: c.allInvs});
    wssend({cmd: "updateMapData", data: c.game.map});
  }*/
}

function addItem(newItem) {

  let inv = undefined;
  let invID = c.game.map[newItem.pos.x][newItem.pos.y][c.layers.inv];
  if (invID == undefined) {
    inv = new Inventory(c.allInvs, newItem.pos);
    c.game.map[newItem.pos.x][newItem.pos.y][c.layers.inv] = inv.id;
  } else inv = inv = c.allInvs[invID];
  
  inv.addStackItem( {id: newItem.inv.item.id, n: 1});
  /*s.sendAll(JSON.stringify({msg:"updateInv", data:c.allInvs}));
  s.sendAll(JSON.stringify({msg: "updateMapData", data:c.game.map}));*/
}


function moveStack(data) {
  if (data.fromInvID == data.toInvID && data.fromInvKey == data.toInvKey && data.fromStackPos == data.toStackPos) return;
  let from = c.allInvs[data.fromInvID].stack[data.fromInvKey][data.fromStackPos];
  c.allInvs[data.toInvID].stack[data.toInvKey][data.toStackPos] = from;
  c.allInvs[data.fromInvID].stack[data.fromInvKey][data.fromStackPos] = undefined;
  //s.sendAll(JSON.stringify({msg:"updateInv", data:c.allInvs}));
  if (data.fromInvID == 0 || data.toInvID == 0) c.player1.setInventory(c.allInvs[0]);
  if (data.fromInvID == c.selEntity?.inv.id || data.toInvID == c.selEntity?.inv.id) showInventory(c.selEntity.inv);
}

if (exports == undefined) var exports = {};
exports.Inventory = Inventory;
exports.getInv = getInv;
exports.getEnt = getEnt;
exports.setInv = setInv;
exports.setEnt = setEnt;
exports.addEntity = addEntity;
exports.addItem = addItem;
exports.moveStack = moveStack;
exports.craftToInv = craftToInv;
exports.createInv = createInv;

var invfuncs = {};
invfuncs.Inventory = Inventory;
invfuncs.getInv = getInv;
invfuncs.getEnt = getEnt;
invfuncs.setInv = setInv;
invfuncs.setEnt = setEnt;
invfuncs.addEntity = addEntity;
invfuncs.createInv = createInv;
var inventory = invfuncs;

