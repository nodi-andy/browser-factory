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
        this.need = [];
        this.preneed = [];

        if (this.stack["OUTPUT"][0]?.id !== undefined) {
            let outputItem = this.stack["OUTPUT"][0].id;
            this.preneed = JSON.parse(JSON.stringify(resName[outputItem].cost));

        } else { 
            if (this.stack["INPUT"] == undefined || this.stack["INPUT"][0] == undefined || this.stack["INPUT"][0].n == 0) {
                this.preneed.push({id: c.resDB.copper.id, n:1});
                this.preneed.push({id: c.resDB.stone.id, n:1});
                this.preneed.push({id: c.resDB.iron.id, n:1});
            }
            if (this.stack["FUEL"] == undefined || this.stack["FUEL"][0] == undefined || this.stack["FUEL"][0].n == 0) {
                this.preneed.push({id: c.resDB.coal.id, n:1});
                this.preneed.push({id: c.resDB.wood.id, n:1});
            }
        }

        for(let costItemID = 0; costItemID < this.preneed.length; costItemID++) {
            let costItem = this.preneed[costItemID];
            let existing = getNumberOfItems(c.allInvs[this.id], costItem.id);
            if (existing >= costItem.n) {
                this.need.push(costItem);
            } else {
                this.need.unshift(costItem);
            }
        }

        if (this.stack["INV"]) {
            if (this.stack.INPUT == undefined) this.stack.INPUT = this.stack["INV"][0];
            else {
                let inItem = this.stack["INV"][0];
                let targetSlot = "INPUT";
                if (resName[inItem.id].E)  targetSlot = "FUEL";
                this.addItem(inItem, targetSlot);
                delete this.stack["INV"];
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
            if (inv.state == 0) {this.lastTime = performance.now(); inv.state = 1};
            if (inv.state == 1) {
                let deltaT = performance.now() - this.lastTime;
                let becomesThat = c.resName[inv.stack["INPUT"][0].id].smeltedInto;
                if (becomesThat && deltaT > 5000) {
                    //if (inv.stack.OUTPUT == undefined || inv.stack.OUTPUT.length == 0) inv.stack.OUTPUT = [c.item(undefined, 0)];
                    if (inv.stack.OUTPUT[0] == undefined) inv.stack.OUTPUT[0] = c.item(undefined, 0);
                    if (inv.stack.OUTPUT[0].n == undefined) inv.stack.OUTPUT[0].n = 0;
                    inv.stack["INPUT"][0].n--;
                    inv.stack["FUEL"][0].n--;
                    inv.stack["OUTPUT"][0].id = becomesThat;
                    inv.stack["OUTPUT"][0].n++;
                    this.lastTime = performance.now();
                }
            }
        }
    }

    draw(ctx, ent) {
    }

    drawItems(ctx) {
        let mapSize = c.resDB.stone_furnace.size;
        let viewSize = c.resDB.stone_furnace.viewsize;
        ctx.drawImage(c.resDB.stone_furnace.img, 0, 0, tileSize, tileSize, 0, -(viewSize[1] - mapSize[1]) * tileSize, viewSize[0] * tileSize, viewSize[1] * tileSize);
    
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
    db.img = image;
}
db.size = [2, 2];
db.viewsize = [2, 3]
db.cost = [{id: c.resDB.stone.id, n: 5}];
db.rotatable = false;
db.mach = StoneFurnace;
exports.StoneFurnace = StoneFurnace;