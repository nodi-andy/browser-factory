class Entity {
    constructor(inv, x, y, h, w, type, onClick) {
        this.pos = {x: x, y: y};
        this.h = h;
        this.w = w;
        if (inv) {
            inv.push(this);
            this.id = inv.length - 1;
        }
        this.type = type;
        this.dir = 0;
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

    update(map) {
        let myTile = map[this.x][this.y];
        let tileR = map[this.x + 1][this.y];
        if (myTile[layers.items]) {

        }
    }
}

if (exports == undefined) var exports = {};
exports.Entity = Entity;