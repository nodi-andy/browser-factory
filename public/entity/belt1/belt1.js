if (typeof window === 'undefined') {
    c = require("../../common");
    inventory = require("../../core/inventory");
} 


class Belt {
    constructor() {
        let db = c.resDB.belt1;
        db.mach = this;
        db.playerCanWalkOn = true;

       if (typeof Image !== 'undefined') {
        const image = new Image(512, 32);
        image.src =  c.resDB.belt1.type + "/belt1/belt1_anim.png";
        c.resDB.belt1.anim = image;
       }
    }

    setup(map, ent) {
        let invThis = inventory.getInv(ent.pos.x, ent.pos.y, true);
        invThis.packsize = 4;
        invThis.itemsize = 1;
        while (invThis.packs.length < 4) invThis.addItem({id: undefined, n: 0, fixed: true});
        while (invThis.nextpacks.length < 4) invThis.addItem({id: undefined, n: 0, fixed: true}, true);
    }

    update(map, ent){
        ent.done = true;
        if (c.game.tick%6 == 0) {
            let invThis = inventory.getInv(ent.pos.x, ent.pos.y, true);
            let beltThis = inventory.getEnt(ent.pos.x, ent.pos.y);
            let nbPos = c.dirToVec[ent.dir];
            let beltFrom = inventory.getEnt(ent.pos.x - nbPos.x, ent.pos.y - nbPos.y);
            let beltTo = inventory.getEnt(ent.pos.x + nbPos.x, ent.pos.y + nbPos.y);

            if (invThis.stack["INV"]) {
                if (invThis.stack.LA == undefined) invThis.stack.LA = invThis.stack["INV"][0];
                else if (invThis.stack.LB == undefined) invThis.stack.LB = invThis.stack["INV"][0];
                else if (invThis.stack.RA == undefined) invThis.stack.RA = invThis.stack["INV"][0];
                else if (invThis.stack.RB == undefined) invThis.stack.RB = invThis.stack["INV"][0];
                delete invThis.stack["INV"];
            }

          
            if (beltFrom && beltFrom.type != c.resDB.belt1.id) beltFrom = undefined;
            if (beltTo && beltTo.type != c.resDB.belt1.id) beltTo = undefined;
            if (beltTo) {
                let invTo = inventory.getInv(ent.pos.x + nbPos.x, ent.pos.y + nbPos.y);

                if (invTo.stack.LB == undefined && invThis.stack.LA) {
                    invTo.stack.LB = invThis.stack.LA;
                    delete invThis.stack.LA;
                }
                if (invTo.stack.RB == undefined && invThis.stack.RA) {
                    invTo.stack.RB = invThis.stack.RA;
                    delete invThis.stack.RA;
                }
            }

            if (invThis.stack.LB && invThis.stack.LA == undefined) {
                invThis.stack.LA = invThis.stack.LB;
                delete invThis.stack.LB;
            }

            if (invThis.stack.RB && invThis.stack.RA == undefined) {
                invThis.stack.RA = invThis.stack.RB;
                delete invThis.stack.RB;
            }

            invThis.changed = true;

            if (beltFrom) this.update(map, beltFrom)
        }
    }

    draw(ctx, ent) {
        ctx.drawImage(c.resDB.belt1.anim, Math.round(c.game.tick/4)%16*64, 0, 64, 64, 0, 0, 64, 64);
        if (ent.pos) {
            let invThis = inventory.getInv(ent.pos.x, ent.pos.y, true);
            if (invThis == undefined) return; // if the server is slow, no inventory for the entity
            context.save();
            context.scale(0.5, 0.5);
            let myDir = c.dirToVec[ent.dir];
            if (invThis.stack.LA) {
                context.translate(tileSize * 0.0 * myDir.x, tileSize * 0.0 * myDir.y);
                context.drawImage(resName[invThis.stack.LA.id].img, 0, 0);
            }
            if (invThis.stack.LB) {
                context.translate(tileSize * 0.5 * myDir.y, tileSize * 0.5 * myDir.x);
                context.drawImage(resName[invThis.stack.LB.id].img, 0, 0);
            }
            if (invThis.stack.RA) {
                context.translate(tileSize * 0.5 * myDir.x, tileSize * 0.5 * myDir.y);
                context.drawImage(resName[invThis.stack.LA.id].img, 0, 0);
            }
            if (invThis.stack.RB) {
                context.translate(tileSize * 0.5 * myDir.y, tileSize * 0.5 * myDir.x);
                context.drawImage(resName[invThis.stack.LB.id].img, 0, 0);
            }
            context.scale(2, 2);
            context.restore();
        }
    }
}

if (exports == undefined) var exports = {};
exports.Belt = Belt;