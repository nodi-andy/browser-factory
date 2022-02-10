let c = require("../../common");
let inventory = require("../../core/inventory");

class StoneFurnace {
    constructor() {
       c.resDB.stone_furnace.mach = this;
    }

    setup(map, ent) {
        let entity = inventory.getEnt(ent.pos.x, ent.pos.y);
        let inv = new inventory.Inventory(c.allInvs);//inventory.getInv(ent.pos.x, ent.pos.y);
        entity.invID = inv.id;
        inv.setPackSize(6);
        inv.itemsize = 50;
        inv.stack["FUEL"] = [c.item(undefined, 0)];
        inv.stack["INPUT"] = [c.item(undefined, 0), c.item(undefined, 0)];
        inv.stack["OUTPUT"] = [c.item(undefined, 0)];
    }


    update(map, ent){
        //bookFromInv(inv, resDB.stone_furnace.output, false);
    }
}

if (exports == undefined) var exports = {};
exports.StoneFurnace = StoneFurnace;