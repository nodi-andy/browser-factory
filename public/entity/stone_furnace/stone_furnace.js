const { resDB, bookFromInv, DIR  } = require("../../common");
const { getInv} = require("../../core/inventory");
class StoneFurnace {
    constructor() {
       resDB.stone_furnace.mach = this;
    }


    update(map, ent){
        let inv = getInv(ent.pos.x, ent.pos.y);
        inv.packsize = 3;
        inv.itemsize = 50;
        inv.setAllPacksDir(DIR.in);
        inv.setAsOutput(resDB.stone);
        inv.setAsOutput(resDB.iron_plate);
        bookFromInv(inv, resDB.furnace.output, false);
    }
}

if (exports == undefined) var exports = {};
exports.Furnace = StoneFurnace;