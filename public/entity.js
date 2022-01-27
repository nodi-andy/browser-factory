class Entity extends Inventory{
    constructor(x, y, h, w, id, onClick) {
        super();
        this.x = x;
        this.y = y;
        this.h = h;
        this.w = w;
        this.id = id;
        this.onClick = onClick;
    }

    collision(p) {
        return (p.x > this.x && p.y > this.y && p.x < this.x+ this.w && p.y < this.y + this.h)
    }

    draw(ctx) {
        ctx.font = "8px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(resDB[Object.keys(resDB)[this.id]].emo, this.x * tileSize, this.y * tileSize + 8);
    }
}