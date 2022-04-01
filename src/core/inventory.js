if (typeof window === 'undefined') {
  var c = require('../common.js');
  var s = require("../../socket.js");
  var e = require('./entity.js');
} 

class Inventory {
    constructor(pos, entData) {
        this.stack = {};
        if (pos) this.pos = {x: pos.x, y: pos.y};
        this.stacksize = 1;
        this.packsize = {};
        this.packsize.INV = 4;
        this.itemsize = 1;
        if (entData) Object.assign(this, entData);
    }

    getStackName() {
        return "INV";
    }

    moveItemTo(item, to, toStackname) {
      if (to == undefined) return false;
      if (this.remItem(item)) {
        if(to.addItem(item, toStackname)) {
          return true;
        } else {
          this.addItem(item);
          return false;
        }
      }
      return false;
    }

    getFilledStackSize() {
      let ret = 0;
      let keys = Object.keys(this.stack);
      for(let iStack = 0; iStack < keys.length; iStack++) {
        let key = keys[iStack];
        if (this.stack[key]?.id || this.stack[key][0]?.id) ret++;
      }
      return ret;
    }

    // use this.hasPlaceFor()
    addItem(newItem, stackName) {
      if (newItem == undefined) return false;
      if (stackName == undefined) stackName = "INV";
      if (this.hasPlaceFor(newItem, stackName) == false) return false;
      if (this.stacksize == undefined) this.stacksize = 1;

      if (this.stack[stackName] == undefined) {
        if (this.getFilledStackSize() < this.stacksize)  this.stack[stackName] = [];
        else return false;
      }

      let key = stackName;

      for(let iPack = 0; iPack < this.packsize[key]; iPack++) {
        let pack = this.stack[key];
        if (Array.isArray(pack)) pack = pack[iPack];
          if (pack == undefined) {
            pack = {id: newItem.id, n: 1}
            this.stack[key].push(pack);
            return true;
          } else if (pack.id == undefined) {
            if (pack.reserved == true) return false;
              pack = {id: newItem.id, n: 1}
              this.stack[key] = pack;
              return true;
          } else if (pack.id == newItem.id && pack.n + newItem.n <= this.itemsize) {
            pack.n += newItem.n;
            return true;
          }
      }
      
      return false;
    }

    hasPlaceFor(newItem, stackName) {
      if (newItem == undefined) return false;
      if (stackName == undefined) stackName = "INV";
      if (this.stacksize == undefined) this.stacksize = 1;

      if (this.stack[stackName] == undefined) {
        if (this.getFilledStackSize() >= this.stacksize) return false;
      }

      if (this.stack[stackName]?.full == true) return false;

      let key = stackName;
      for(let iPack = 0; iPack < this.packsize[key]; iPack++) {
          let pack = this.stack[key];
          if (Array.isArray(pack)) pack = pack[iPack];
          if (pack?.id == undefined) return true;
          if (pack.id == newItem.id) {
            if (pack.n + newItem.n <= this.itemsize) {
              return true;
            }
        }
      }
      return false;
    }

    addItems(newItems) {
      let ret = true;
      for(let i = 0; i < newItems.length; i++) {
        ret = ret && this.addItem(newItems[i]);
      }
      return ret;
    }

    remItemFromStack(removingItem, stackName) {
      if (Array.isArray(this.stack[stackName]) == false) {
        let pack = this.stack[stackName];
        if (pack && pack.id == removingItem.id) {
          let n = pack.n - removingItem.n;
          if (n > 0) {
            pack.n = n;
            return true;
          } else if (n == 0) {
            delete this.stack[stackName];
            return true;
          } else return false;
        }
      } else {
        for(let iPack = 0; iPack < this.packsize[stackName] && removingItem; iPack++) {
          let pack = this.stack[stackName][iPack];
          if (pack && pack.id == removingItem.id) { // Find the pack
            let n = pack.n - removingItem.n;
            if (n > 0) {
              pack.n = n;
              return true;
            } else if (n == 0) {
              this.stack[stackName].splice(iPack, 1); // Remove empty pack
              iPack--;
              return true;
            } else return false;
          }
        }
      }
    }

    remItem(removingItem, prefStackName) {
        if (removingItem == undefined) return false;

        if (this.stack[prefStackName] == undefined || this.remItemFromStack(removingItem, prefStackName) == false) {
          let keys = Object.keys(this.stack);
          for(let iStack = 0; iStack < keys.length; iStack++) {
            if (this.remItemFromStack(removingItem, keys[iStack])) {
              return true;
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

    remItems(newItems) {
      let ret = true;
      for(let i = 0; i < newItems.length; i++) {
        ret = ret && this.remItem(newItems[i]);
      }
      return ret;
    }

    remStack(stackKey) {
      delete this.stack[stackKey];
    }
  
    hasItem(searchItem) {
      let keys = Object.keys(this.stack);
      for(let iStack = 0; iStack < keys.length && searchItem; iStack++) {
        let key = keys[iStack];
        if (Array.isArray(this.stack[key])) {
          for(let iPack = 0; iPack < this.stack[key].length && searchItem; iPack++) {
            let pack = this.stack[key][iPack];
            if (pack && pack.id == searchItem.id) { // Find the pack
              return (pack.n >= searchItem.n);
            }
          }
        } else {
          if (this.stack[key] && this.stack[key]?.id == searchItem.id) { // Find the pack
            return (this.stack[key].n >= 0);
          }
        }
      }
      return false;
    }

    hasItems(searchItem) {
      let ret = true;
      for(let i = 0; i < searchItem.length; i++) {
        ret = ret && this.hasItem(searchItem[i]);
      }
      return ret;
    }



    getFirstItem(){
      let firstPack = this.getFirstPack();
      if (firstPack?.length) return firstPack[0];
      return firstPack;
    }
    
    getFirstPack(pref) {
      let key;
      let selectedKey;
      if (pref && this.stack[pref]) selectedKey = pref;
      else  {
        let keys = Object.keys(this.stack);
        if(keys.length) {
          for(let iStack = 0; iStack < keys.length; iStack++) {
            key = keys[iStack];
            if (this.stack[key]?.id || this.stack[key][0]?.id) {
              selectedKey = key;
              break;
            }
          }
        } 
      }
      if (selectedKey == undefined) return;
      let pack = this.stack[selectedKey];
      if (Array.isArray(pack)) pack = pack[0];
      return pack;
    }
    
    draw(ctx) {
      ctx.beginPath();
        ctx.fillStyle = "rgba(120, 120, 120, 0.9)";
        ctx.rect(this.x, this.y, this.w, this.h);
        ctx.fill();
        ctx.font = "48px Arial";
        ctx.fillText(this.t, this.x, this.y + 48);
    }
}

function getNumberOfItems(ent, type) {
  let n = 0;
  let keys = Object.keys(ent.stack);
  for(let iStack = 0; iStack < keys.length; iStack++) {
    let key = keys[iStack];
    for(let iPack = 0; iPack < ent.packsize[key]; iPack++) {
      let pack = ent.stack[key][iPack];
      if (pack && pack.id == type) {
        n += pack.n;
      }
    }
  }
  return n;
}

function mineToInv(minedItem) {
  let newItem = {};
  newItem.id = resName[minedItem.id].becomes;
  newItem.n = 1;
  c.game.map[minedItem.source.x][minedItem.source.y][layers.res].n--;
  c.allInvs[c.playerID].addItem(newItem);
  view.updateInventoryMenu(c.player);
}

function craftToInv(inv, items) {
  if (!items) return;
  items.forEach(item => {
      let itemsExist = true;
      for(let c = 0; c < item.cost.length && itemsExist; c++) {
          itemsExist = false;
          itemsExist = inv.hasItems(item.cost);
      }
      if (itemsExist) { 
          let newItem = {id: item.id, n: 1} ;
          c.player.addItem(newItem);
          inv.remItems(item.cost);
          view.updateInventoryMenu(c.player);
      }
      return itemsExist;
  })

}

function getInv(x, y, create = false){
  let tile = c.game.map[x][y];
  if (tile[c.layers.inv] == undefined && create)  createInvOnMap(x, y);
  return c.allInvs[tile[c.layers.inv]];
}

function setInv(x, y, invID){
  let tile = c.game.map[x][y];
  tile[c.layers.inv] = invID;
}

function setEnt(x, y, invID){
  let tile = c.game.map[x][y];
  tile[c.layers.buildings] = invID;
}

function createInvOnMap(x, y){
  let invID = c.game.map[x][y][c.layers.inv];
  if (invID == undefined) {
      inv = new Inventory({x: x, y: y});

      c.allInvs.push(inv);
      inv.id = c.allInvs.length - 1;

      c.game.map[x][y][c.layers.inv] = inv.id;
      inv.type = "empty";
      invID = inv.id;
  }
  return invID;
}

function createInv(type, newEntity) {
  newEntity.id = c.allInvs.length;
  c.allInvs.push(new resName[type].mach(newEntity.pos, newEntity));
  return c.allInvs.length-1;
}

function addInventory(newEntity, updateDir) {
  if(!newEntity) return;
  let inv = getInv(newEntity.pos.x, newEntity.pos.y);
  if (inv == undefined || inv.type == "empty") {
    if (c.pointer.item.n > 0) {
      let invID = createInv(newEntity.type, newEntity);
      inv = c.allInvs[invID];
      inv.id = invID;
      inv.pos = {x: newEntity.pos.x, y: newEntity.pos.y};
      inv.dir = newEntity.dir;
      inv.type = newEntity.type;
      c.game.map[newEntity.pos.x][newEntity.pos.y][c.layers.inv] = inv.id;
      if (typeof window !== "undefined") view.updateInventoryMenu(c.player);
      c.pointer.item.n--;
      if (c.pointer.item.n == 0) c.pointer.item = undefined;
    }
    if (c.isBrowser) {
      if (c.resName[newEntity.type].mach && c.resName[newEntity.type].mach.setup) c.resName[newEntity.type].mach.setup(c.game.map, inv);
    }
  }
  if (inv) return inv.id;
}

function addItem(newItem) {

  let inv = undefined;
  let invID = c.game.map[newItem.pos.x][newItem.pos.y][c.layers.inv];
  if (invID == undefined) {
    inv = new Inventory(newItem.pos);
    c.allInvs.push(inv);
    inv.id = c.allInvs.length - 1;
    c.game.map[newItem.pos.x][newItem.pos.y][c.layers.inv] = inv.id;
    inv.type = "empty";
  } else inv = inv = c.allInvs[invID];
  inv.addItem( {id: newItem.inv.item.id, n: 1});
  /*s.sendAll(JSON.stringify({msg:"updateInv", data:c.allInvs}));
  s.sendAll(JSON.stringify({msg: "updateMapData", data:c.game.map}));*/
}


function moveStack(data) {
  if (data.fromInvID == data.toInvID && data.fromInvKey == data.toInvKey && data.fromStackPos == data.toStackPos) return;
  let from = c.allInvs[data.fromInvID].stack[data.fromInvKey][data.fromStackPos];
  c.allInvs[data.toInvID].stack[data.toInvKey][data.toStackPos] = from;
  c.allInvs[data.fromInvID].stack[data.fromInvKey][data.fromStackPos] = undefined;
  //s.sendAll(JSON.stringify({msg:"updateInv", data:c.allInvs}));
  if (data.fromInvID == 0 || data.toInvID == 0) c.player.setInventory(c.allInvs[0]);
  if (data.fromInvID == c.selEntity?.id || data.toInvID == c.selEntity?.id) view.updateInventoryMenu(c.selEntity);
}

if (exports == undefined) var exports = {};
exports.Inventory = Inventory;
exports.getInv = getInv;
exports.setInv = setInv;
exports.setEnt = setEnt;
exports.addItem = addItem;
exports.moveStack = moveStack;
exports.craftToInv = craftToInv;
exports.createInv = createInv;

var invfuncs = {};
invfuncs.Inventory = Inventory;
invfuncs.getInv = getInv;
invfuncs.setInv = setInv;
invfuncs.setEnt = setEnt;
invfuncs.createInv = createInv;
var inventory = invfuncs;

