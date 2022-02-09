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
        bookFromInv(inv, resDB.stone_furnace.output, false);*/
    }

    checkCollision(pos) {
        let terrain = game.map[pos.x][pos.y][layers.terrain][0];
        let building = game.map[pos.x][pos.y][layers.buildings];
        let canWalkOn = true;
        if (building) {
            canWalkOn = false;
            if(resName[c.allEnts[building].type].playerCanWalkOn) canWalkOn  = building.playerCanWalkOn;
        }
         
        return (terrain == resID.deepwater || terrain == resID.water || terrain == resID.hills || canWalkOn == false)
    }

    loop() {
        if (game.map == undefined) return;
        this.unitdir = toUnitV(this.dir);
        let thisTile = worldToTile({x: this.pos.x, y: this.pos.y});

        this.nextPos.x = this.pos.x + 5 * this.unitdir.x;
        let nextXTile = worldToTile({x: this.nextPos.x, y: this.pos.y});
        if (nextXTile.x > 0 && nextXTile.x < gridSize.x - 1 && this.checkCollision({x: nextXTile.x, y: thisTile.y}) == false) this.pos.x = this.nextPos.x;

        this.nextPos.y = this.pos.y + 5 * this.unitdir.y;
        let nextYTile = worldToTile({x: this.pos.x, y: this.nextPos.y});
        if (nextYTile.y > 0 && nextYTile.y < gridSize.y - 1 && this.checkCollision({x: thisTile.x, y: nextYTile.y}) == false) this.pos.y = this.nextPos.y;



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
        ctx.drawImage(c.resDB.player.img, this.ss.x * 96, this.ss.y * 132, 96, 132, - 48, -100, 96, 132)
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.fillRect(-25,-120, 50, 10);
        ctx.fillStyle = "green";
        ctx.fillRect(-25,-120, (this.live / 100) * 50, 10);
        ctx.restore();
    }
}


if (exports == undefined) var exports = {};
exports.Player = Player;