const { resDB, layers, dirToVec } = require("../../common");
const { getEnt, getInv, createInv } = require("../../core/inventory");

class Belt {
    constructor() {
       resDB.belt.mach = this;
    }

    update(map, ent){
        let nbPos = dirToVec[ent.dir];
        ent.done = true;
        
        let beltFrom = getEnt(ent.pos.x - nbPos.x, ent.pos.y - nbPos.y);
        if (beltFrom && beltFrom.id != resDB.belt.id) beltFrom = undefined;
        
        let beltTo = getEnt(ent.pos.x + nbPos.x, ent.pos.y + nbPos.y);
        let invThis = getInv(ent.pos.x, ent.pos.y, true);
        if (invThis == undefined) {
            createInv(map, {x: ent.pos.x, y: ent.pos.y});
            invThis = getInv(ent.pos.x, ent.pos.y);
        } 

        if (beltTo) {
            let invTo = getInv(ent.pos.x + nbPos.x, ent.pos.y + nbPos.y);
            if (invThis && invThis.packs.length && invTo == undefined) {
                createInv(map, {x: ent.pos.x + nbPos.x, y: ent.pos.y + nbPos.y});
                invTo = getInv(ent.pos.x + nbPos.x, ent.pos.y + nbPos.y);
            } 
            if (invThis && invTo && invThis.packs.length) {
                if (invTo.addItem({id: invThis.packs[0].id, n: 1}, false, true)) {
                    invThis.remItem({id: invThis.packs[0].id, n: 1});
                    invTo.changed = true;
                    invThis.changed = true;
                }
                else
                {
                    invThis.addItems(invThis.packs, false, true);
                    invThis.changed = true;
                }
            }
        }
        else
        {
            invThis.addItems(invThis.packs, false, true);
            invThis.changed = true;
        }
        if (beltFrom) this.update(map, beltFrom)
    }
}

if (exports == undefined) var exports = {};
exports.Belt = Belt;