if (typeof window === 'undefined') {
    c = require("../../common");
    inventory = require("../../core/inventory");
} 


class InserterBurner {
    constructor() {
        let db = c.resDB.inserter_burner;
        db.mach = this;
        db.size = [1, 1];
       if (typeof Image !== 'undefined') {
        let image = new Image(64, 64);
        image.src =  c.resDB.inserter_burner.type + "/inserter_burner/inserter_platform.png";
        c.resDB.inserter_burner.platform = image;
        image = new Image(64, 64);
        image.src =  c.resDB.inserter_burner.type + "/inserter_burner/inserter_burner_hand.png";
        c.resDB.inserter_burner.hand = image;
       }
    }

    setup(map, ent) {
        let invThis = inventory.getInv(ent.pos.x, ent.pos.y, true);
        invThis.stack["INV"] = [];
        invThis.stacksize = 3;
    }

    update(map, ent){
        ent.done = true;
        if (c.game.tick%32 == 0) {
            if (ent.pos) {
                let myDir = c.dirToVec[ent.dir];
                let invThis = inventory.getInv(ent.pos.x, ent.pos.y, true);
                let invFrom = inventory.getInv(ent.pos.x - myDir.x, ent.pos.y - myDir.y, true);
                let invTo = inventory.getInv(ent.pos.x + myDir.x, ent.pos.y + myDir.y, true);


                if (invThis.stack.INV == undefined) invThis.stack.INV = [];
                invThis.stack.INV.size = 6;
                let isHandFull = (invThis?.stack?.INV && invThis.stack.INV[0] && invThis.stack.INV[0].n > 0);
    
                if (isHandFull == false || isHandFull == undefined) { // PICK
                    let item;
                    if (invTo.need?.length) item = invTo.need[0];
                    //if (item == undefined) item = invFrom.getFirstPack("OUTPUT");
                    if (item?.n && (c.game.tick%64) == 0 && invFrom.moveItemTo({id:item.id, n:1}, invThis)) {
                        invThis.state = 1;
                    } else invThis.state = 0;
                } else { // PLACE
                    invThis.moveItemTo(invThis.stack.INV[0], invTo);
                    invThis.state = 1;
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
            let invThis = inventory.getInv(ent.pos.x, ent.pos.y, true);

            if (invThis?.state == 1) armPos = Math.round(c.game.tick)%64

            ctx.translate(tileSize * 0.5, tileSize * 0.5);
            ctx.rotate(armPos * Math.PI / 32);
            ctx.drawImage(c.resDB.inserter_burner.hand, 0, 0, 64, 64, -48, -16, 64, 64);

            let myDir = c.dirToVec[ent.dir];
            if (invThis?.stack?.INV && invThis?.stack?.INV[0]?.n) {
                ctx.scale(0.5, 0.5);
                ctx.drawImage(resName[invThis.stack.INV[0].id].img, -96, -24);
                ctx.scale(2, 2);
            }
        }
        ctx.restore(); 
    }
}

if (exports == undefined) var exports = {};
exports.InserterBurner = InserterBurner;