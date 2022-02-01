if (typeof window === 'undefined') {
  var c = require('./common.js');
} 

class Inventory {
    constructor(inv, pos, newItem = undefined) {
        this.packs = [];
        this.nextpacks = [];
        this.pos = {x: pos.x, y: pos.y};
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

      for(let i = 0; i < selectedPacks.length && newItem; i++) {
        let invObj = selectedPacks[i];
        if (invObj.id == newItem.id) {
          if (invObj.n + newItem.n< this.itemsize) {
            invObj.n += newItem.n;
            return true;
          } else return false;
        }
      }

      if (selectedPacks.length < this.packsize) {
        selectedPacks.push({id: newItem.id, n: newItem.n});
        return true;
      }

      return false;
    }

    addItems(newItems, reserve) {
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
            selectedItems.splice(i, 1);
            i--;
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
    draw(ctx) {
        context.beginPath();
        ctx.fillStyle = "rgba(120, 120, 120, 0.9)";
        ctx.rect(this.x, this.y, this.w, this.h);
        ctx.fill();
        context.font = "48px Arial";
        context.fillText(this.t, this.x, this.y + 48);
    }
}

function getInv(tile){
  if (tile[c.layers.inv] != undefined) return c.allInvs[tile[c.layers.inv]];
}

function getEnt(tile){
  if (tile[c.layers.buildings] != undefined) return c.allEnts[tile[c.layers.buildings]];
}

function createInv(map, pos){
  if (!pos) return;
  let invID = map[pos.x][pos.y][c.layers.inv];
  if (invID == undefined) {
      inv = new Inventory(c.allInvs, pos);
      map[pos.x][pos.y][c.layers.inv] = inv.id;
      invID = inv.id;
  }
  return invID;
}


if (exports == undefined) var exports = {};
exports.Inventory = Inventory;
exports.getInv = getInv;
exports.getEnt = getEnt;
exports.createInv = createInv;