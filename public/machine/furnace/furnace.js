const { resDB, layers, bookFromInv, DIR  } = require("../../common");
const { Inventory , getInv} = require("../../core/inventory");
class Furnace {
    constructor() {
       resDB.furnace.mach = this;
    }


    update(map, ent){
        let inv = getInv(ent.pos.x, ent.pos.y);
        inv.packsize = 10;
        inv.itemsize = 50;
        inv.setAllPacksDir(DIR.in);
        inv.setAsOutput(resDB.stone_brick);
        inv.setAsOutput(resDB.iron_plate);
        bookFromInv(inv, resDB.furnace.output, false);
    }
}

if (exports == undefined) var exports = {};
exports.Furnace = Furnace;