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
        inv.stack["INV"] = [];
    }
}

if (exports == undefined) var exports = {};
exports.Chest = Chest;