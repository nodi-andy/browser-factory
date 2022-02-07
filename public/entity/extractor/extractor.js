const { resDB, layers, allInvs, DIR, getInv } = require("../../common.js");
const { Inventory } = require("../../core/inventory");

class Extractor {
    constructor() {
       resDB.extractor.mach = this;
    }

    update(map, ent){
        let inv = getInv(ent.pos.x, ent.pos.y);
        inv.setAllPacksDir(DIR.out);

        let tile = map[ent.pos.x][ent.pos.y];
        if (tile[layers.res] && tile[layers.res].n) {

            let newItem = {pos: {x: ent.pos.x, y: ent.pos.y}, type: tile[layers.res].id, n: 1}
            //addItem({})
            let inv = undefined;
            let invID = tile[layers.inv];
            if (invID == undefined) {
              inv = new Inventory(allInvs, ent.pos);
              inv.itemsize = 1;
              tile[layers.inext] = inv.id;
              tile[layers.inv] = inv.id;
            } else inv = inv = allInvs[invID];
            
            if(inv.addItem( {id: newItem.type, n: newItem.n})) tile[layers.res].n -= newItem.n;
        }
    }
}

if (exports == undefined) var exports = {};
exports.Extractor = Extractor;