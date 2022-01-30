if (typeof window === 'undefined') {
  var c = require('./common.js');
} 

class Inventory {
    constructor(inv, pos, newItem = undefined) {
        this.items = [];
        this.nextitems = [];
        this.pos = {x: pos.x, y: pos.y};
        if (inv) {
          inv.push(this);
          this.id = inv.length - 1;
        }
        this.addItem(newItem);
    }

    addItem(newItem, reserve) {
      let selectedItems = this.items;
      if (reserve) selectedItems = this.nextitems;
        for(let i = 0; i < selectedItems.length && newItem; i++) {
          let invObj = selectedItems[i];
          if (invObj.id == newItem.id) {
            invObj.n += newItem.n;
            newItem = null;
          }
        }
        if (newItem) selectedItems.push({id: newItem.id, n: newItem.n});
        return true;
    }

    addItems(newItems, reserve) {
      newItems.forEach(item => {this.addItem(item, reserve)});
    }

    remItem(newItem, reserve) {
      let selectedItems = this.items;
      if (reserve) selectedItems = this.nextitems;
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
        this.remItem(this.items[i]);
      }
      return false;
    }

    hasItem(newItem) {
        for(let i = 0; i < this.items.length; i++) {
          let invObj = this.items[i];
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

function getInv(id){
  if (id) return c.allInvs[id];
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
exports.createInv = createInv;