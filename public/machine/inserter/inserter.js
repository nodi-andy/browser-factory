const { resDB, layers, dirToVec, DIR} = require("../../common");
const { getInv, createInv} = require("../../core/inventory");

class Inserter {
    constructor() {
       resDB.inserter.mach = this;
    }

    update(map, ent){
        let nbPos = dirToVec[ent.dir];
        let invFrom = getInv(ent.pos.x - nbPos.x, ent.pos.y - nbPos.y);
        let invThis = getInv(ent.pos.x, ent.pos.y);
        let invTo = getInv(ent.pos.x + nbPos.x, ent.pos.y + nbPos.y);

        let iOut = invFrom.getOutputPackIndex();

        // PICK
        if (invThis.packs.length == 0 && invFrom && iOut != undefined && invFrom.packs.length) {
            if (invThis.addItem({id: invFrom.packs[iOut].id, n: 1})) {
                 invFrom.remItem({id: invFrom.packs[iOut].id, n: 1, fixed: invFrom.packs[iOut].fixed});
            }
        }// PLACE
        else if (invThis.packs.length) {
            if (invTo.addItem({id: invThis.packs[0].id, n: 1})) {
                invThis.remItem({id: invThis.packs[0].id, n: 1});
            }
        }
    }
}

if (exports == undefined) var exports = {};
exports.Inserter = Inserter;