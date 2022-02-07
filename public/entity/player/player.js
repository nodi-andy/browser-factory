if (typeof window === 'undefined') {
    var c = require('../../common.js');
} 


class Player {
    constructor() {
       c.resDB.player.mach = this;
       this.setup();
    }

    setup(map, ent){
        this.pos = {x: 400, y: 400};
        this.dir = {x: 0, y:0};
        this.live = 100;
        this.nextPos = {x: 400, y: 400};
        this.type = c.resID.player;
        //this.inv = new Inventory();
        this.ss = {x:0, y:0};
    }

    update(map, ent){
        let inv = getInv(ent.pos.x, ent.pos.y);
        /*inv.packsize = 3;
        inv.itemsize = 50;
        inv.setAllPacksDir(DIR.in);
        inv.setAsOutput(resDB.stone);
        inv.setAsOutput(resDB.iron_plate);
        bookFromInv(inv, resDB.furnace.output, false);*/
    }

    loop() {
        if (game.map == undefined) return;
        this.unitdir = toUnitV(this.dir);
        let thisTile = worldToTile({x: this.pos.x, y: this.pos.y});

        this.nextPos.x = this.pos.x + 5 * this.unitdir.x;
        let nextXTile = worldToTile({x: this.nextPos.x, y: this.pos.y});
        let nextTerrain = game.map[nextXTile.x][thisTile.y][layers.terrain][0];
        if (nextXTile.x > 0 && nextXTile.x < gridSize.x - 1 && nextTerrain != resID.deepwater && nextTerrain != resID.water && resID.hills) this.pos.x = this.nextPos.x;

        this.nextPos.y = this.pos.y + 5 * this.unitdir.y;
        let nextYTile = worldToTile({x: this.pos.x, y: this.nextPos.y});
        if (nextYTile.y < 0 || nextXTile.y > gridSize.y) return;
        nextTerrain = game.map[thisTile.x][nextYTile.y][layers.terrain][0];
        if (nextXTile.y > 0 && nextXTile.y < gridSize.y - 1 && nextTerrain != resID.deepwater && nextTerrain != resID.water && resID.hills) this.pos.y = this.nextPos.y;



        if (this.dir.x < 0) this.ss.x--; else this.ss.x++;
        
        if (this.dir.y == -1 && this.dir.x == -1) this.ss.y = 5;
        if (this.dir.y == -1 && this.dir.x == 0)  this.ss.y = 0;
        if (this.dir.y == -1 && this.dir.x == 1)  this.ss.y = 1;
        if (this.dir.y == 0 && this.dir.x == -1)  this.ss.y = 6;
        if (this.dir.y == 0 && this.dir.x == 1)   this.ss.y = 2;
        if (this.dir.y == 1 && this.dir.x == -1)  this.ss.y = 7;
        if (this.dir.y == 1 && this.dir.x == 0)   this.ss.y = 4; 
        if (this.dir.y == 1 && this.dir.x == 1)   this.ss.y = 3;
        
        this.ss.x += 30;
        this.ss.x %= 30;
        if (this.dir.x == 0 && this.dir.y == 0) this.ss.x = 5;

        //console.log(this.pos, thisTile);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.drawImage(c.resDB.player.img, this.ss.x * 96, this.ss.y * 132, 96, 132, - 48, - 66, 96, 132)
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.fillRect(-25,-80, 50, 10);
        ctx.fillStyle = "green";
        ctx.fillRect(-25,-80, (this.live / 100) * 50, 10);
        ctx.restore();
    }
}


if (exports == undefined) var exports = {};
exports.Player = Player;