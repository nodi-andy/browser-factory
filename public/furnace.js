const { resDB, layers, bookFromInv, allInvs  } = require("./common");
const { Inventory , getInv} = require("./inventory");
class Furnace {
    constructor() {
       resDB.furnace.mach = this;
    }


    update(map, ent){
        let tile = map[ent.pos.x][ent.pos.y];

        let invID = tile[layers.inv];
        let inv = undefined;
        if (invID == undefined) {
            inv = new Inventory(allInvs, ent.pos);
            map[ent.pos.x][ent.pos.y][layers.inv] = inv.id;
        }
        inv = getInv(tile);
        inv.packsize = 10;
        inv.itemsize = 50;
        bookFromInv(inv, resDB.furnace.output, false);
    }
}

if (exports == undefined) var exports = {};
exports.Furnace = Furnace;