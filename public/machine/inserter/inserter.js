const { resDB, layers, dirToVec} = require("../../common");
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

        // PICK
        if (invFrom && invThis.packs.length == 0 && invFrom.packs.length) {
            if (invThis.addItem({id: invFrom.packs[0].id, n: 1}, false, true)) {
                 invFrom.remItem({id: invFrom.packs[0].id, n: 1});
                 invFrom.changed = true;
                 invThis.changed = true;
            }
        }// PLACE
        else if (invThis && invTo && invThis.packs.length) {
            if (invTo.addItem({id: invThis.packs[0].id, n: 1})) {
                invThis.remItem({id: invThis.packs[0].id, n: 1});
            }
            else {
                invThis.addItems(invThis.packs, false, true);
                invThis.changed = true;
            }
        }
    }
}

if (exports == undefined) var exports = {};
exports.Inserter = Inserter;