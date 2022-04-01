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
        this.stack["INV"] = [];
        this.stacksize = 3;
        this.packsize = {};
        this.packsize.INV = 1;
    }

    update(map, ent){
        ent.done = true;
        if (c.game.tick%32 == 0) {
            if (ent.pos) {
                let myDir = c.dirToVec[ent.dir];
                let invThis = inventory.getInv(ent.pos.x, ent.pos.y, true);
                let invFrom = inventory.getInv(ent.pos.x - myDir.x, ent.pos.y - myDir.y, true);
                let invTo = inventory.getInv(ent.pos.x + myDir.x, ent.pos.y + myDir.y, true);

                if (!invFrom) return;
                
                if (invThis.stack.INV == undefined) invThis.stack.INV = [];
                invThis.stack.INV.size = 6;
                let isHandFull = (invThis?.stack?.INV && invThis.stack.INV[0] && invThis.stack.INV[0].n > 0);
    
                if (!isHandFull) { // PICK
                    let item;
                    if (invTo?.need?.length) {
                        for (let ineed = 0; invTo.need && ineed < invTo.need.length; ineed++) {
                            if (invFrom.hasItem(invTo.need[ineed])) {
                                item = invTo.need[ineed];
                                break;
                            }
                        }
                    } else if (item == undefined) item = invFrom.getFirstPack("OUTPUT");
                    if (item?.n && (c.game.tick%64) == 0 && invFrom.moveItemTo({id:item.id, n:1}, invThis)) {
                        invThis.state = 1;
                    } else invThis.state = 0;
                } else { // PLACE
                    let stackName;

                    //place onto belt
                    if (invTo.type == c.resDB.belt1.id) {
                        let relDir = (invTo.dir - invThis.dir + 3) % 4;
                        let dirPref = ["L", "R", "L", "R"];
                        stackName = dirPref[relDir];
                    } else {  // place into assembling machine
                        stackName = invTo.getStackName(this.stack.INV[0].id);
                    }

                    if (invTo.hasPlaceFor(this.stack.INV[0], stackName)) {
                        invThis.moveItemTo(this.stack.INV[0], invTo, stackName);
                        invThis.state = 1;
                    } else
                        invThis.state = 0;
                } 
            }
        }
    }

    draw(ctx, ent) {
        let db = c.resDB.burner_miner;
        let armPos = 0;
        ctx.drawImage(c.resDB.inserter_burner.platform, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize);
        ctx.save();


        if (ent?.pos) {
            let isHandFull = (this.stack?.INV && this.stack.INV[0] && this.stack.INV[0].n > 0);
            if (isHandFull) armPos = 32
            if (this.state == 1) armPos = Math.round(c.game.tick)%64

            ctx.translate(tileSize * 0.5, tileSize * 0.5);
            ctx.rotate(armPos * Math.PI / 32);
            ctx.drawImage(c.resDB.inserter_burner.hand, 0, 0, 64, 64, -48, -16, 64, 64);

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

if (exports == undefined) var exports = {};
exports.InserterBurner = InserterBurner;