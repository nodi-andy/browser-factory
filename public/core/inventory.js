if (typeof window === 'undefined') {
  var c = require('../common.js');
} 

class Inventory {
    constructor(inv, pos, newItem = undefined) {
        this.stack = {};
        this.packs = [];
        this.nextpacks = [];
        if (pos) this.pos = {x: pos.x, y: pos.y};
        this.packsize = 1;
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
        this.addItem(newItem);
    }

    addItem(newItem, reserve) {
      if (newItem == undefined) return false;

      let selectedPacks = this.packs;
      if (reserve) selectedPacks = this.nextpacks;

      if (newItem.fixed != true) {
        for(let i = 0; i < selectedPacks.length && newItem; i++) {
          let pack = selectedPacks[i];
          if (pack.id == undefined) pack.id = newItem.id;
          if (pack.id == newItem.id) {
            if (pack.n + newItem.n <= this.itemsize) {
              pack.n += newItem.n;
              return true;
            } //else return false;
          }
        }
      }

      if (selectedPacks.length < this.packsize) {
        selectedPacks.push({id: newItem.id, n: newItem.n, dir: false, fixed: newItem.fixed});
        return true;
      }
    return false;
    }

    addStackItem(newItem) {
      if (newItem == undefined) return false;
      let keys = Object.keys(this.stack);
      for(let iStack = 0; iStack < keys.length && newItem; iStack++) {
        let key = keys[iStack];
        for(let iPack = 0; iPack < this.stack[key].length && newItem; iPack++) {

            let pack = this.stack[keys][iPack];
            if (pack.id == undefined) pack.id = newItem.id;
            if (pack.id == newItem.id) {
              if (pack.n + newItem.n <= this.itemsize) {
                pack.n += newItem.n;
                return true;
              }
            }
        }
      }
      if (keys.length < this.packsize) {
        if (this.stack["INV"] == undefined) this.stack["INV"] = [];
        this.stack["INV"].push({id: newItem.id, n: newItem.n, dir: false, fixed: newItem.fixed});
        return true;
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
        return false;
    }

    remStackItems(newItems) {
      let ret = true;
      for(let i = 0; i < newItems.length; i++) {
        ret = ret && this.remStackItem(newItems[i]);
      }
      return ret;
    }

    addItems(newItems, dir, reserve) {
      newItems.forEach(item => {this.addItem(item, reserve)});
    }

    remItem(removingItem, reserve) {
      let selectedPacks = this.packs;
      if (reserve) selectedPacks = this.nextpacks;

      for(let i = 0; i < selectedPacks.length && removingItem; i++) {
        let invObj = selectedPacks[i];
        if (invObj.id == removingItem.res.id) { // Find the pack
          let n = invObj.n - removingItem.n;
          if (n > 0) {
            invObj.n = n;
            return true;
          } else if (n == 0) {
            if (removingItem.fixed == true) { invObj.id = undefined;
            } else {
              selectedPacks.splice(i, 1); // Remove empty pack
              i--;
            }
            return true;
          } else return false;
          // newItem = null;
        }
      }
      return false;
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

  hasItems(newItems) {
      for(let i = 0; i < newItems.length; i++) {
        if (this.hasItem( newItems[i]) == false)  return false;
      }
      return true;
  }

    hasItem(newItem) {
        for(let i = 0; i < this.packs.length; i++) {
          let invObj = this.packs[i];
          if (invObj.id == newItem.res.id)  return (invObj.n >= newItem.n);
        }
        return false;
    }

    hasItems(newItems) {
        for(let i = 0; i < newItems.length; i++) {
          if (this.hasItem( newItems[i]) == false)  return false;
        }
        return true;
    }

    getNumberOfItems(type) {
      let n = 0;
      for(let i = 0; i < this.packs.length; i++) {
        let invObj = this.packs[i];
        if (invObj.id == type)  n += invObj.n;
      }
      return n;
    }

    setAllPacksDir(d) {
      for(let i = 0; i < this.packs.length; i++) {
        this.packs[i]. dir = d;
      }
    }

    setAsOutput(item) {
      for(let i = 0; i < this.packs.length; i++) {
        let invPack = this.packs[i];
        if (invPack.id == item.id) invPack.dir = c.DIR.out;
      }
    }

    setPackSize(n){
      while(this.packs.length < n) this.packs.push({id:undefined, n:0});
    }

    getOutputPackIndex() {
      for(let i = 0; i < this.packs.length; i++) {
        let invPack = this.packs[i];
        if (invPack.dir == c.DIR.out) return i;
      }
      return undefined;
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
  return invID;
}

if (exports == undefined) var exports = {};
exports.Inventory = Inventory;
exports.getInv = getInv;
exports.getEnt = getEnt;

var inventory = {};
inventory.getInv = getInv;
inventory.getEnt = getEnt;