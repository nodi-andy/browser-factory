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
        inv.stack.FUEL = [];
        inv.stack.FUEL.size = 1;
        inv.stack.INPUT = [];
        inv.stack.INPUT.size = 1;
        inv.stack.OUTPUT = [];
        inv.stack.OUTPUT.size = 1;
        inv.stacksize = 4;
        inv.state = 0;
        inv.lastTime = performance.now();
    }


    update(map, ent){
        let invThis = inventory.getInv(ent.pos.x, ent.pos.y, true);
        invThis.need = [];
        if (invThis.stack["FUEL"] == undefined || invThis.stack["FUEL"][0] == undefined || invThis.stack["FUEL"][0].n == 0) invThis.need.push({id: c.resDB.coal.id, n:1});
        if (invThis.stack["INPUT"] == undefined || invThis.stack["INPUT"][0] == undefined || invThis.stack["INPUT"][0].n == 0) invThis.need.push({id: c.resDB.copper_ore.id, n:1});
        
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


        if(inv.stack.FUEL.length && inv.stack.FUEL[0].n && inv.stack.INPUT.length && inv.stack.INPUT[0].n) {
            if (inv.state == 0) {invThis.lastTime = performance.now(); inv.state = 1};
            if (inv.state == 1) {
                let deltaT = performance.now() - invThis.lastTime;
                let becomesThat = c.resName[inv.stack["INPUT"][0].id].becomes;
                if (becomesThat && deltaT > 1000) {
                    if (inv.stack.OUTPUT == undefined || inv.stack.OUTPUT.length == 0) inv.stack.OUTPUT = [c.item(undefined, 0)];
                    if (inv.stack.OUTPUT[0] == undefined) inv.stack.OUTPUT[0] = c.item(undefined, 0);
                    if (inv.stack.OUTPUT[0].n == undefined) inv.stack.OUTPUT[0].n = 0;
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