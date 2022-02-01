const { resDB, layers, dirToVec} = require("./common");
const { getInv, createInv} = require("./inventory");

class Shifter {
    constructor() {
       resDB.shifter.mach = this;
    }

    update(map, ent){
        let nbPos = dirToVec[ent.dir];
        let invFrom = getInv(map[ent.pos.x - nbPos.x][ent.pos.y - nbPos.y]);
        let invThis = getInv(map[ent.pos.x][ent.pos.y]);
        let invTo = getInv(map[ent.pos.x + nbPos.x][ent.pos.y + nbPos.y]);
        if (invFrom == undefined) {
            createInv(map, {x: ent.pos.x - nbPos.x, y: ent.pos.y - nbPos.y});
            invFrom = getInv(map[ent.pos.x - nbPos.x][ent.pos.y - nbPos.y]);
        } 

        if (invThis == undefined) {
            createInv(map, {x: ent.pos.x, y: ent.pos.y});
            invThis = getInv(map[ent.pos.x][ent.pos.y]);
        } 

        if (invTo == undefined) {
            createInv(map, {x: ent.pos.x + nbPos.x, y: ent.pos.y + nbPos.y});
            invTo = getInv(map[ent.pos.x + nbPos.x][ent.pos.y + nbPos.y]);
        } 

        if (invFrom && invThis.packs.length == 0 && invFrom.packs.length) {
            if (invThis.addItem({id: invFrom.packs[0].id, n: 1}, true)) {
                 invFrom.remItem({id: invFrom.packs[0].id, n: 1});
                 invFrom.changed = true;
                 invThis.changed = true;
            }
        }
        else if (invThis && invTo && invThis.packs.length /*&& invTo.packs.length == 0*/) {
            if (invTo.addItem({id: invThis.packs[0].id, n: 1}/*, true*/)) {
                invThis.remItem({id: invThis.packs[0].id, n: 1});
                //invTo.changed = true;
                //invThis.changed = true;
            }
            else {
                invThis.addItems(invThis.packs, true);
                invThis.changed = true;
            }
        }
    }
}

if (exports == undefined) var exports = {};
exports.Shifter = Shifter;