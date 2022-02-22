if (typeof window === 'undefined') {
    c = require("../../common");
    inventory = require("../../core/inventory");
} 
class Chest {
    constructor() {
       c.resDB.chest.mach = this;
    }

    update(map, ent){
    }

    setup(map, ent) {
        let inv;
        if (ent?.pos) {
          inv = inventory.getInv(ent.pos.x, ent.pos.y);
        }
        inv.stack["INV"] = Array(6).fill(c.item(undefined, 0));
    }
}

if (exports == undefined) var exports = {};
exports.Chest = Chest;