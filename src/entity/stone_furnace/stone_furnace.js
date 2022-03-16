if (typeof window === 'undefined') {
    c = require("../../common");
    inventory = require("../../core/inventory");
} 

class StoneFurnace {
    constructor() {
        let db = c.resDB.stone_furnace;
        db.mach = this;
        db.type = "entity";
        if (typeof Image !== 'undefined') {
            const image = new Image(512, 32);
            image.src =  "./src/" + db.type + "/stone_furnace/stone_furnace_64.png";
            db.anim1 = image;
        }
        db.size = [2, 2];
        db.cost = [{id: c.resDB.stone.id, n: 5}];
        db.rotatable = false;
    }

    setup(map, inv) {
        inventory.setInv(inv.pos.x + 1, inv.pos. y + 0, inv.id);
        inventory.setInv(inv.pos.x + 1, inv.pos. y + 1, inv.id);
        inventory.setInv(inv.pos.x + 0, inv.pos. y + 1, inv.id);

        inv.packsize = 1;
        inv.itemsize = 50;
        if (inv.stack.FUEL == undefined) inv.stack.FUEL = [];
        if (inv.stack.INPUT == undefined) inv.stack.INPUT = [];
        if (inv.stack.OUTPUT == undefined) inv.stack.OUTPUT = [];
        inv.stacksize = 4;
        inv.packsize = {};
        inv.packsize.FUEL = 1;
        inv.packsize.INPUT = 1;
        inv.packsize.OUTPUT = 1;
        inv.packsize.INV = 8;
        inv.state = 0;
        inv.lastTime = performance.now();
    }


    update(map, ent){
        let invThis = inventory.getInv(ent.pos.x, ent.pos.y, true);
        invThis.need = [];
        if (invThis.stack["FUEL"] == undefined || invThis.stack["FUEL"][0] == undefined || invThis.stack["FUEL"][0].n == 0) {
            invThis.need.push({id: c.resDB.coal.id, n:1});
            invThis.need.push({id: c.resDB.wood.id, n:1});
        }
        if (invThis.stack["INPUT"] == undefined || invThis.stack["INPUT"][0] == undefined || invThis.stack["INPUT"][0].n == 0) {
            invThis.need.push({id: c.resDB.copper.id, n:1});
            invThis.need.push({id: c.resDB.stone.id, n:1});
            invThis.need.push({id: c.resDB.iron.id, n:1});
            invThis.need.push({id: c.resDB.coal.id, n:1});
        } else {
            let inputItem = invThis.stack["INPUT"][0].id;
            invThis.need.push({id: inputItem, n:1});

            invThis.preneed = JSON.parse(JSON.stringify(resName[resName[inputItem].smeltedInto].cost));

            invThis.need = [];
            for(let costItemID = 0; costItemID < invThis.preneed.length; costItemID++) {
                let costItem = invThis.preneed[costItemID];
                let existing = getNumberOfItems(c.allInvs[invThis.id], costItem.id);
                if (existing >= costItem.n) {
                    invThis.need.push(costItem);
                } else {
                    invThis.need.unshift(costItem);
                }
            }
        }

        
        
        if (invThis.stack["INV"]) {
            if (invThis.stack.INPUT == undefined) invThis.stack.INPUT = invThis.stack["INV"][0];
            else {
                let inItem = invThis.stack["INV"][0];
                let targetSlot = "INPUT";
                if (resName[inItem.id].E)  targetSlot = "FUEL";
                invThis.addItem(inItem, targetSlot);
                delete invThis.stack["INV"];
            }
        }
        let inv = inventory.getInv(ent.pos.x, ent.pos.y);
        if (inv.stack["FUEL"] == undefined ||
            inv.stack["INPUT"] == undefined || 
            inv.stack["INPUT"][0] == undefined || 
            inv.stack["INPUT"][0].id == undefined ||
            c.resName[inv.stack["INPUT"][0].id].smeltedInto == undefined) {
                inv.state = 0;
                return;
            }


        if(inv.stack.FUEL.length && inv.stack.FUEL[0].n && inv.stack.INPUT.length && inv.stack.INPUT[0].n) {
            if (inv.state == 0) {invThis.lastTime = performance.now(); inv.state = 1};
            if (inv.state == 1) {
                let deltaT = performance.now() - invThis.lastTime;
                let becomesThat = c.resName[inv.stack["INPUT"][0].id].smeltedInto;
                if (becomesThat && deltaT > 5000) {
                    //if (inv.stack.OUTPUT == undefined || inv.stack.OUTPUT.length == 0) inv.stack.OUTPUT = [c.item(undefined, 0)];
                    if (inv.stack.OUTPUT[0] == undefined) inv.stack.OUTPUT[0] = c.item(undefined, 0);
                    if (inv.stack.OUTPUT[0].n == undefined) inv.stack.OUTPUT[0].n = 0;
                    inv.stack["INPUT"][0].n--;
                    inv.stack["FUEL"][0].n--;
                    inv.stack["OUTPUT"][0].id = becomesThat;
                    inv.stack["OUTPUT"][0].n++;
                    invThis.lastTime = performance.now();
                }
            }
        }
    }

    draw(ctx, ent) {
        let db = c.resDB.stone_furnace;
        ctx.drawImage(db.anim1, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize);
    }
}

if (exports == undefined) var exports = {};
exports.StoneFurnace = StoneFurnace;