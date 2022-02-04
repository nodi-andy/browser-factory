if (typeof window === "undefined") {
    c = require("../../common");
    //var Inventory = require('../../core/inventory.js');
}

class Player {
    constructor() {
       //resDB.player.mach = this;
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
        //if(this.dir)
        this.ss.x++;
        this.ss.x %= 30;
    }
}

if (exports == undefined) var exports = {};
exports.Player = Player;