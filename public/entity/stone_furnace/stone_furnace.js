let c = require("../../common");
let inventory = require("../../core/inventory");

class StoneFurnace {
    constructor() {
       c.resDB.stone_furnace.mach = this;
    }

    setup(map, ent) {
        let inv = inventory.getInv(ent.pos.x, ent.pos.y);
        inv.setPackSize(6);
        inv.itemsize = 50;
        inv.packs[0].t = "FUEL";
        inv.packs[1].t = "FUEL";
        inv.packs[2].t = "INPUT";
        inv.packs[3].t = "INPUT";
        inv.packs[4].t = "OUTPUT";
        inv.packs[5].t = "OUTPUT";
    }


    update(map, ent){
        //bookFromInv(inv, resDB.stone_furnace.output, false);
    }
}

if (exports == undefined) var exports = {};
exports.StoneFurnace = StoneFurnace;