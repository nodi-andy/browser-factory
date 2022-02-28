if (typeof window === 'undefined') {
    c = require("../../common");
    inventory = require("../../core/inventory");
} 
class Chest {
    constructor() {
       c.resDB.chest.mach = this;
    }

    update(map, ent){
        let inv;
        if (ent?.pos) {
          inv = inventory.getInv(ent.pos.x, ent.pos.y, true);
        }
        inv.stack.INV.size = 6;
        inv.itemsize = 50;
    }

    setup(map, ent) {
        let inv;
        if (ent?.pos) {
          inv = inventory.getInv(ent.pos.x, ent.pos.y, true);
          inv.stack.INV = [];
        }
    }
}

if (exports == undefined) var exports = {};
exports.Chest = Chest;