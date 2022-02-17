if (typeof window === 'undefined') {
  var c = require('../common.js');
  var s = require("../../socket.js");
} 

class Inventory {
    constructor(inv, pos) {
        this.stack = {};
        this.packs = [];
        this.nextpacks = [];
        if (pos) this.pos = {x: pos.x, y: pos.y};
        this.stacksize = 1;
        this.packsize = 64;
        this.itemsize = 1;
        this.changed = false;
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
      this.remStackItem({res: item, n: item.n});
      to.addStackItem(item);
    }

    addStackItem(newItem) {
      if (newItem == undefined) return false;
      let keys = Object.keys(this.stack);
      for(let iStack = 0; iStack < keys.length && newItem; iStack++) {
        let key = keys[iStack];

        for(let iPack = 0; iPack < this.stack[key].length && newItem; iPack++) {
            let pack = this.stack[key][iPack];
            if (pack == undefined && this.stack[key].length < this.packsize) pack = {};
            if (pack.id == undefined) pack.id = newItem.id;
            if (pack.id == newItem.id) {
              if (pack.n + newItem.n <= this.itemsize) {
                pack.n += newItem.n;
                return true;
              }
            }
        }
      }

      if (keys.length <= this.stacksize) {
        if (this.stack["INV"] == undefined) this.stack["INV"] = [];
        if (this.stack["INV"].length < this.packsize) {
          this.stack["INV"].push({id: newItem.id, n: newItem.n, dir: false, fixed: newItem.fixed});
          return true;
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
          if (pack.id == searchItem.res.id) { // Find the pack
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
      for(let i = 0; i < this.packs.length; i++) {
        let invObj = this.packs[i];
        if (invObj.id == type)  n += invObj.n;
      }
      return n;
    }

    setPackSize(n){
      while(this.packs.length < n) this.packs.push({id:undefined, n:0});
    }

    getFirst() {
      let keys = Object.keys(this.stack);
      if(keys.length && this.stack[keys[0]]) {
        return this.stack[keys[0]];
      }
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


function getInv(x, y){
  let tile = c.game.map[x][y];
  if (tile[c.layers.inv] == undefined)  createInv(x, y);
  return c.allInvs[tile[c.layers.inv]];
}

function getEnt(x, y){
  let tile = c.game.map[x][y];
  if (tile[c.layers.buildings] != undefined) return c.allEnts[tile[c.layers.buildings]];
}

function createInv(x, y){
  
  let invID = c.game.map[x][y][c.layers.inv];
  if (invID == undefined) {
      inv = new Inventory(c.allInvs, {x: x, y:y});
      c.game.map[x][y][c.layers.inv] = inv.id;
      invID = inv.id;
  }
  //ws.send(JSON.stringify({msg: "updateMapData", data:c.game.map}));
  return invID;
}

function addEntity(newEntity, updateDir) {
  if(!newEntity) return;

  let entID = c.game.map[newEntity.pos.x][newEntity.pos.y][c.layers.buildings];
  if (entID == undefined) {
    let ent = new Entity(c.allEnts, newEntity.pos.x, newEntity.pos.y, newEntity.dir, newEntity.w, newEntity.h, newEntity.type);
    c.game.map[newEntity.pos.x][newEntity.pos.y][c.layers.buildings] = ent.id;
  }
  if (c.resName[newEntity.type].mach && c.resName[newEntity.type].mach.setup) c.resName[newEntity.type].mach.setup(c.game.map, newEntity);
  
  if (updateDir) {
    sendAll(JSON.stringify({msg:"updateEntities", data: c.allEnts}));
    sendAll(JSON.stringify({msg: "updateMapData", data:c.game.map}));
  } else {
    wssend({cmd: "updateEntities", data: c.allEnts});
    wssend({cmd: "updateMapData", data: c.game.map});
  }
}

if (exports == undefined) var exports = {};
exports.Inventory = Inventory;
exports.getInv = getInv;
exports.getEnt = getEnt;

var inventory = {};
inventory.getInv = getInv;
inventory.getEnt = getEnt;