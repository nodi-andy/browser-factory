if (typeof window === 'undefined') {
    c = require("../../common");
    inventory = require("../../core/inventory");
} 
class Chest {
    constructor() {
       c.resDB.chest.mach = this;
    }

    update(map, ent){
        let inv = inventory.getInv(ent.pos.x, ent.pos.y);
        inv.packsize = 10;
        inv.itemsize = 50;
        inv.setAllPacksDir(c.DIR.out);
    }
}

if (exports == undefined) var exports = {};
exports.Chest = Chest;