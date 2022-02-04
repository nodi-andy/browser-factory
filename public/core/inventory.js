if (typeof window === 'undefined') {
  var c = require('../common.js');
} 

class Inventory {
    constructor(inv, pos, newItem = undefined) {
        this.packs = [];
        this.nextpacks = [];
        if (pos) this.pos = {x: pos.x, y: pos.y};
        this.packsize = 1;
        this.itemsize = 1;
        this.changed = false;
        if (inv) {
          inv.push(this);
          this.id = inv.length - 1;
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

    addItems(newItems, dir, reserve) {
      newItems.forEach(item => {this.addItem(item, reserve)});
    }

    remItem(newItem, reserve) {
      let selectedItems = this.packs;
      if (reserve) selectedItems = this.nextpacks;
      for(let i = 0; i < selectedItems.length && newItem; i++) {
        let invObj = selectedItems[i];
        if (invObj.id == newItem.id) {
          invObj.n -= newItem.n;
          if (invObj.n == 0) {
            if (newItem.fixed == true) {
              invObj.id = undefined;
            } else {
              selectedItems.splice(i, 1);
              i--;
            }
          }
          newItem = null;
        }
      }
      return true;
  }
  
    remItems(newItems) {
      for(let i = 0; i < newItems.length; i++) {
        this.remItem(newItems[i]);
      }
      return false;
    }

    hasItem(newItem) {
        for(let i = 0; i < this.packs.length; i++) {
          let invObj = this.packs[i];
          if (invObj.id == newItem.id)  return (invObj.n >= newItem.n);
        }
        return false;
    }

    hasItems(newItems) {
        for(let i = 0; i < newItems.length; i++) {
          if (this.hasItem( newItems[i]) == false)  return false;
        }
        return true;
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
exports.createInv = createInv;
