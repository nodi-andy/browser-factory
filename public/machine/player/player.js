if (typeof window === 'undefined') {
    var c = require('../../common.js');
  } 
class Player {
    constructor() {
       c.resDB.player.mach = this;
       this.dir = {x: 0, y:0};
    }

    setup(map, ent){
        this.pos = {x: 200, y: 200};
        this.type = c.resID.player;
       // this.inv = new Inventory(undefined, {x: 0, y:0});
        this.ss = {x:0, y:0};
    }

    update(map, ent){
        let inv = getInv(ent.pos.x, ent.pos.y);
        /*inv.packsize = 3;
        inv.itemsize = 50;
        inv.setAllPacksDir(DIR.in);
        inv.setAsOutput(resDB.stone_brick);
        inv.setAsOutput(resDB.iron_plate);
        bookFromInv(inv, resDB.furnace.output, false);*/
    }

    loop() {
        this.unitdir = toUnitV(this.dir);
        this.pos.x += 5 * this.unitdir.x;
        this.pos.y += 5 * this.unitdir.y;

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
    }
}

if (exports == undefined) var exports = {};
exports.Player = Player;