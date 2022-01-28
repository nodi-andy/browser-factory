class Items extends Array{
    constructor(id, n) {
        super();
        this.id = id;
        this.n = n;
    }

    addItem(newItem) {
        for(let i = 0; i < this.items.length && newItem; i++) {
          let invObj = this[i];
          if (invObj.id == newItem.id) {
            invObj.n += newItem.n;
            newItem = null;
          }
        }
        if (newItem) this.items.push({id: newItem.id, n: newItem.n});
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
exports.items = Items;