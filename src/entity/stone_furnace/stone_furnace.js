if (typeof window === 'undefined') {
    c = require("../../common");
    inventory = require("../../core/inventory");
} 

class StoneFurnace {
    constructor() {
        let db = c.resDB.stone_furnace;
        db.mach = this;
        if (typeof Image !== 'undefined') {
            const image = new Image(512, 32);
            image.src =  db.type + "/stone_furnace/stone_furnace.png";
            db.anim1 = image;
        }
    }

    setup(map, ent) {
        let entity = inventory.getEnt(ent.pos.x, ent.pos.y);
        let inv = new inventory.Inventory(c.allInvs, ent.pos);//inventory.getInv(ent.pos.x, ent.pos.y);
        entity.invID = inv.id;
        inv.packsize = 1;
        inv.itemsize = 50;
        inv.stack["FUEL"] = [c.item(undefined, 0)];
        inv.stack["INPUT"] = [c.item(undefined, 0), c.item(undefined, 0)];
        inv.stack["OUTPUT"] = [c.item(undefined, 0)];
    }


    update(map, ent){
        let invThis = inventory.getInv(ent.pos.x, ent.pos.y, true);
        if (invThis.stack["INV"]) {
            if (invThis.stack.INPUT == undefined) invThis.stack.INPUT = invThis.stack["INV"][0];
            else {
                let inItem = invThis.stack["INV"][0];
                let targetSlot = "INPUT";
                if (resName[inItem.id].E)  targetSlot = "FUEL";
                invThis.addStackItem(inItem, targetSlot);
                delete invThis.stack["INV"];
            }
        }
        let inv = inventory.getInv(ent.pos.x, ent.pos.y);
        if (inv.stack["FUEL"] == undefined) return;
        if(inv.stack["FUEL"][0].n && inv.stack["INPUT"][0] && inv.stack["INPUT"][0].n && inv.stack["FUEL"][0].n) {
           let out =  inv.stack["OUTPUT"][0];
           inv.stack["INPUT"][0].n--;
           inv.stack["FUEL"][0].n--;
           out.id = c.resName[inv.stack["INPUT"][0].id].becomes.id;
           out.n++;
        }
    }

    draw(ctx, ent) {
        let db = c.resDB.stone_furnace;
        ctx.drawImage(db.anim1, 0, 0, tileSize, tileSize, 0, 0, tileSize, tileSize);
    }
}

if (exports == undefined) var exports = {};
exports.StoneFurnace = StoneFurnace;