const { resDB, layers, DIR  } = require("../../common");
const { getInv, createInv} = require("../../core/inventory");

class Chest {
    constructor() {
       resDB.chest.mach = this;
    }

    update(map, ent){
        let inv = getInv(ent.pos.x, ent.pos.y);
        inv.packsize = 10;
        inv.itemsize = 50;
        inv.setAllPacksDir(DIR.out);
    }
}

if (exports == undefined) var exports = {};
exports.Chest = Chest;