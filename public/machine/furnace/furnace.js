const { resDB, layers, bookFromInv, allInvs  } = require("../../common");
const { Inventory , getInv} = require("../../core/inventory");
class Furnace {
    constructor() {
       resDB.furnace.mach = this;
    }


    update(map, ent){
        let inv = getInv(ent.pos.x, ent.pos.y);
        inv.packsize = 10;
        inv.itemsize = 50;
        bookFromInv(inv, resDB.furnace.output, false);
    }
}

if (exports == undefined) var exports = {};
exports.Furnace = Furnace;