if (typeof window === 'undefined') {
    c = require("../../common");
    inventory = require("../../core/inventory");
} 


class InserterBurner {
    constructor() {
        let db = c.resDB.inserter_burner;
        db.mach = this;

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
        invThis.packsize = 4;
        invThis.itemsize = 1;
        invThis.state = 0;
    }

    update(map, ent){
        ent.done = true;
        if (c.game.tick%32 == 0) {
            if (ent.pos) {
                let myDir = c.dirToVec[ent.dir];
                let invThis = inventory.getInv(ent.pos.x, ent.pos.y, true);
                let invFrom = inventory.getInv(ent.pos.x - myDir.x, ent.pos.y - myDir.y, true);
                let invTo = inventory.getInv(ent.pos.x + myDir.x, ent.pos.y + myDir.y, true);

                let isHandFull = (invThis.stack && invThis.stack.INV && invThis.stack.INV[0] && invThis.stack.INV[0].n > 0);
    
                if (isHandFull) {
                    invThis.moveItemTo(invThis.stack.INV[0], invTo);
                } else {
                    let item = invFrom.getFirst();
                    if (item) {
                        invFrom.moveItemTo(item, invThis);
                        invThis.state = 1;
                    }
                }
            }
        }
    }

    draw(ctx, ent) {
        let invThis = inventory.getInv(ent.pos.x, ent.pos.y, true);
        let itemPos = 0;
        ctx.drawImage(c.resDB.inserter_burner.platform, 0, 0);
        if (invThis?.state == 1 && invThis.stack?.INV[0]) itemPos = Math.round(c.game.tick+32)%64
        ctx.save();
            ctx.translate(tileSize * 0.5, tileSize * 0.5);
            ctx.rotate(itemPos * Math.PI / 32);
            ctx.drawImage(c.resDB.inserter_burner.hand, 0, 0, 64, 64, -48, -16, 64, 64);
        if (ent.pos) {
            let myDir = c.dirToVec[ent.dir];
            if (invThis == undefined) return; // if the server is slow, still no inventory for the entity
            if (invThis.stack?.INV && invThis.stack.INV[0]) {
                ctx.scale(0.5, 0.5);
                ctx.drawImage(resName[invThis.stack.INV[0].id].img, -96, -24);
                ctx.scale(2, 2);
            }
            ctx.restore(); 
        }
    }
}

if (exports == undefined) var exports = {};
exports.InserterBurner = InserterBurner;