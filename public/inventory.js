class Inventory extends Array{
    constructor(items) {
        super();
        this.items = items;
        this.pos = {x: 0, y:0};
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