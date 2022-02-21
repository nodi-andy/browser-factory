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
        inv.stack["INPUT"] = [c.item(undefined, 0)];
        inv.stack["OUTPUT"] = [c.item(undefined, 0)];
        inv.state = 0;
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
        if (inv.stack["FUEL"] == undefined ||
            inv.stack["INPUT"] == undefined || 
            inv.stack["INPUT"][0] == undefined || 
            inv.stack["INPUT"][0].id == undefined ||
            c.resName[inv.stack["INPUT"][0].id].becomes == undefined) {
                inv.state = 0;
                return;
            }

        if(inv.stack["FUEL"][0].n && inv.stack["INPUT"][0].n) {
            if (inv.state == 0) {invThis.lastTime = performance.now(); inv.state = 1};
            if (inv.state == 1) {
                let deltaT = performance.now() - invThis.lastTime;
                let becomesThat = c.resName[inv.stack["INPUT"][0].id].becomes;
                if (becomesThat && deltaT > 1000) {
                    let out =  inv.stack["OUTPUT"][0];
                    inv.stack["INPUT"][0].n--;
                    inv.stack["FUEL"][0].n--;
                    out.id = becomesThat.id;
                    out.n++;
                    invThis.lastTime = performance.now();
                }
            }
        }
    }

    draw(ctx, ent) {
        let db = c.resDB.stone_furnace;
        ctx.drawImage(db.anim1, 0, 0, tileSize, tileSize, 0, 0, tileSize, tileSize);
    }
}

if (exports == undefined) var exports = {};
exports.StoneFurnace = StoneFurnace;