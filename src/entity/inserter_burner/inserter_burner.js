if (typeof window === 'undefined') {
    c = require("../../common");
    inventory = require("../../core/inventory");
} 


class InserterBurner extends Inventory {
    constructor(pos, data) {
        super(pos, data);
        data.pos = pos;
        this.setup(undefined, data);
    }

    setup(map, ent) {
        this.stack = {};
        this.stack.INV = [];
        this.stack.FUEL = [];
        this.stacksize = 3;
        this.packsize = {};
        this.packsize.INV = 1;
        this.packsize.FUEL = 1;
        this.armPos = 0;
        this.energy = 0;
    }

    update(map, ent){
        if (this.stack.FUEL == undefined) this.stack.FUEL = [];
        this.done = true;
        if (this.pos) {
            if (this.stack["FUEL"][0]?.n > 0 && this.energy <= 2) {
                this.energy += c.resName[this.stack["FUEL"][0].id].E; // add time factor
                this.stack["FUEL"][0].n--;
            }
            let isHandFull = this.stack?.INV[0]?.n > 0;

            let myDir = c.dirToVec[this.dir];

            if ((isHandFull || this.armPos > 0) && this.state == 1) this.armPos = (this.armPos + 1) % 64;
            
            let invFrom = inventory.getInv(ent.pos.x - myDir.x, ent.pos.y - myDir.y, true);
            let invTo = inventory.getInv(ent.pos.x + myDir.x, ent.pos.y + myDir.y, true);

            if (this.armPos == 0 && !isHandFull && this.energy <= 0 && invFrom.hasItem(c.resDB.coal.id)) { // LOAD COAL
                invFrom.moveItemTo({id:c.resDB.coal.id, n:1}, this, "FUEL");
            } else if (this.armPos == 0 && !isHandFull && this.energy > 0) { // PICK
                let item;
                if (invFrom.stack.OUTPUT)
                    item = invFrom.getFirstPack("OUTPUT");
                else if (invTo?.need?.length) {
                    for (let ineed = 0; ineed < invTo.need.length; ineed++) {
                        if (invFrom.hasItem(invTo.need[ineed])) {
                            item = invTo.need[ineed];
                            break;
                        }
                    }
                } else item = invFrom.getFirstPack();

                if (item?.n && invFrom.moveItemTo({id:item.id, n:1}, this)) {
                    this.energy--;
                    this.state = 1;
                } else this.state = 0;
            } else if (this.armPos == 32 && isHandFull) { // PLACE
                if (invTo == undefined) return;
                let stackName;

                //place onto belt
                if (invTo.type == c.resDB.belt1.id) {
                    let relDir = (invTo.dir - this.dir + 3) % 4;
                    let dirPref = ["R", "L", "R", "L"];
                    stackName = dirPref[relDir];
                } else {  // place into assembling machine
                    stackName = invTo.getStackName(this.stack.INV[0].id);
                }

                if (invTo.hasPlaceFor(this.stack.INV[0], stackName)) {
                    this.moveItemTo(this.stack.INV[0], invTo, stackName);
                    this.state = 1;
                } else
                    this.state = 0;
            } 
        
        }
    }

    draw(ctx, ent) {
        let db = c.resDB.burner_miner;
        ctx.drawImage(c.resDB.inserter_burner.platform, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize);
    }

    drawItems(ctx) {
        ctx.save();

        if (this.pos) {
            ctx.translate(tileSize * 0.5, tileSize * 0.5);
            ctx.rotate(this.armPos * Math.PI / 32);
            ctx.drawImage(c.resDB.inserter_burner.hand, 0, 0, 64, 64, -48, -15, 64, 64);
            if (this.stack?.INV[0]?.n && this.stack?.INV[0]?.id) {
                ctx.scale(0.5, 0.5);
                ctx.drawImage(resName[this.stack.INV[0].id].img, -96, -24);
                ctx.scale(2, 2);
            }
        }
        ctx.restore(); 
    }
}

db = c.resDB.inserter_burner;
db.size = [1, 1];
if (typeof Image !== 'undefined') {
    let image = new Image(64, 64);
    image.src =  "./src/" + c.resDB.inserter_burner.type + "/inserter_burner/inserter_platform.png";
    c.resDB.inserter_burner.platform = image;
    image = new Image(64, 64);
    image.src =  "./src/" + c.resDB.inserter_burner.type + "/inserter_burner/inserter_burner_hand.png";
    c.resDB.inserter_burner.hand = image;
}
db.mach = InserterBurner;
db.cost      = [{id: resDB.iron_plate.id, n: 1}, {id: resDB.gear.id, n: 1}, {id: resDB.hydraulic_piston.id, n: 1}];

exports.InserterBurner = InserterBurner;