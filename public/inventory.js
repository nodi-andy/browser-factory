class Inventory {
    constructor(inv, newItem = undefined) {
        this.items = [];
        this.pos = {x: 0, y:0};
        if (inv) {
          inv.push(this);
          this.id = inv.length - 1;
        }
        this.addItem(newItem);
    }

    addItem(newItem) {
        for(let i = 0; i < this.items.length && newItem; i++) {
          let invObj = this.items[i];
          if (invObj.id == newItem.id) {
            invObj.n += newItem.n;
            newItem = null;
          }
        }
        if (newItem) this.items.push({id: newItem.id, n: newItem.n});
        return true;
    }
    addItems(newItems) {
      newItems.forEach(item => {this.addItem(item)});
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

if (exports == undefined) var exports = {};
exports.Inventory = Inventory;