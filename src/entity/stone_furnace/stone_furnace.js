if (typeof window === 'undefined') {
    c = require("../../common");
    inventory = require("../../core/inventory");
} 

class StoneFurnace extends Inventory {
    constructor(pos, data) {
        if (data == undefined) {
            data = { 
                tilePos : {x: c.gridSize.x/2, y: c.gridSize.y/2},
                pos : pos,
                stack : {}
            }
        }
        super(pos, data);
        this.setup(undefined, this);
    }

    setup(map, inv) {
        inventory.setInv(this.pos.x + 1, this.pos. y + 0, this.id);
        inventory.setInv(this.pos.x + 1, this.pos. y + 1, this.id);
        inventory.setInv(this.pos.x + 0, this.pos. y + 1, this.id);

        this.packsize = 1;
        this.itemsize = 50;
        if (this.stack.FUEL == undefined) this.stack.FUEL = [];
        if (this.stack.INPUT == undefined) this.stack.INPUT = [];
        if (this.stack.OUTPUT == undefined) this.stack.OUTPUT = [];
        this.stacksize = 4;
        this.packsize = {};
        this.packsize.FUEL = 1;
        this.packsize.INPUT = 1;
        this.packsize.OUTPUT = 1;
        this.packsize.INV = 8;
        this.state = 0;
        this.lastTime = performance.now();
    }


    update(map, ent){
        let invThis = this;
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

    getStackName(type) {
        if ( type == c.resDB.coal.id) return "FUEL";
    }
}

db = c.resDB.stone_furnace;
db.type = "entity";
if (typeof Image !== 'undefined') {
    const image = new Image(512, 32);
    image.src =  "./src/" + db.type + "/stone_furnace/stone_furnace_64.png";
    db.anim1 = image;
}
db.size = [2, 2];
db.cost = [{id: c.resDB.stone.id, n: 5}];
db.rotatable = false;
db.mach = StoneFurnace;
if (exports == undefined) var exports = {};
exports.StoneFurnace = StoneFurnace;