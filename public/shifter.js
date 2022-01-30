const { resDB, layers, dirToVec} = require("./common");
const { getInv, createInv} = require("./inventory");

class Shifter {
    constructor() {
       resDB.shifter.mach = this;
    }

    update(map, ent){
        let nbPos = dirToVec[ent.dir];
        let invFrom = getInv(map[ent.pos.x - nbPos.x][ent.pos.y - nbPos.y][layers.inv]);
        let invTo = getInv(map[ent.pos.x + nbPos.x][ent.pos.y + nbPos.y][layers.inv]);
        if (invFrom && invFrom.items.length && invTo == undefined) {
            createInv(map, {x: ent.pos.x + nbPos.x, y: ent.pos.y + nbPos.y});
            invTo = getInv(map[ent.pos.x + nbPos.x][ent.pos.y + nbPos.y][layers.inv]);
        } 
        if (invFrom && invTo && invFrom.items.length) {
            invTo.addItem(invFrom.items[0], true);
            invFrom.remItem(invFrom.items[0])
        }
    }
}

if (exports == undefined) var exports = {};
exports.Shifter = Shifter;