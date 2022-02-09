let c = require("../../common");
let inventory = require("../../core/inventory");

class StoneFurnace {
    constructor() {
       c.resDB.stone_furnace.mach = this;
    }


    update(map, ent){
        let inv = inventory.getInv(ent.pos.x, ent.pos.y);
        inv.packsize = 3;
        inv.itemsize = 50;
        inv.setAllPacksDir(c.DIR.in);
        inv.setAsOutput(c.resDB.stone);
        inv.setAsOutput(c.resDB.iron_plate);
        //bookFromInv(inv, resDB.stone_furnace.output, false);
    }
}

if (exports == undefined) var exports = {};
exports.Furnace = StoneFurnace;