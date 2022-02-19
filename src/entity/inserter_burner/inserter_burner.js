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
    }

    update(map, ent){
        ent.done = true;
        if (c.game.tick%6 == 0) {
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
                    }
                }
            }
        }
    }

    draw(ctx, ent) {
        ctx.drawImage(c.resDB.inserter_burner.platform, 0, 0);
        ctx.drawImage(c.resDB.inserter_burner.hand, 0, 0, 64, 64, -24, 16, 64, 64);
        if (ent.pos) {
            let myDir = c.dirToVec[ent.dir];
            let invThis = inventory.getInv(ent.pos.x, ent.pos.y, true);
            if (invThis == undefined) return; // if the server is slow, still no inventory for the entity
            if (invThis.stack.INV && invThis.stack.INV[0]) {
                context.save();
                context.scale(0.5, 0.5);
                context.translate(tileSize * 0.0 * myDir.x, tileSize * 0.0 * myDir.y);
                context.drawImage(resName[invThis.stack.INV[0].id].img, 0, 0);
                context.scale(2, 2);
                context.restore(); 
            }
        }
    }
}

if (exports == undefined) var exports = {};
exports.InserterBurner = InserterBurner;