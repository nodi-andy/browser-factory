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
        invThis.stacksize = 4;
        invThis.packsize = 1;
        invThis.itemsize = 1;
    }

    update(map, ent){
        ent.done = true;
        let invThis = inventory.getInv(ent.pos.x, ent.pos.y, true);
        if (invThis == undefined) return;
        let movingParts = false//c.game.tick%12 == 0;
        let decidingMoving = (c.game.tick-1)%12 == 0;
        if (movingParts || decidingMoving) {
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
            //if (invThis.stack.LA) invThis.stack.LA.moving = false;
            //if (invThis.stack.LB) invThis.stack.LB.moving = false;
          
            if (beltFrom && beltFrom.type != c.resDB.belt1.id) beltFrom = undefined;
            if (beltTo && beltTo.type != c.resDB.belt1.id) beltTo = undefined;
            if (beltTo) {
                let invTo = inventory.getInv(ent.pos.x + nbPos.x, ent.pos.y + nbPos.y);

                if (invTo.stack.LB == undefined && invThis.stack.LA) {
                    if (decidingMoving) {
                        invThis.stack.LA.moving = true;
                    } else {
                        invTo.stack.LB = invThis.stack.LA;
                        invTo.stack.LB.moving = false;
                        delete invThis.stack.LA;
                    }
                }
                if (invTo.stack.RB == undefined && invThis.stack.RA) {
                    /*invTo.stack.RB = invThis.stack.RA;
                    invThis.stack.RB.moving = true;
                    delete invThis.stack.RA;*/
                }
            }

            if (invThis.stack.LB && invThis.stack.LA == undefined) {
                if (decidingMoving) {
                    invThis.stack.LB.moving = true;
                } else {
                    invThis.stack.LA = invThis.stack.LB;
                    invThis.stack.LA.moving = false;
                    delete invThis.stack.LB;
                }
            }

            if (invThis.stack.RB && invThis.stack.RA == undefined) {
                /*invThis.stack.RA = invThis.stack.RB;
                invThis.stack.RA.moving = true;
                delete invThis.stack.RB;*/
            }

            invThis.changed = true;

            if (beltFrom) this.update(map, beltFrom)
        }
    }

    draw(ctx, ent) {
        let beltPos = Math.round(c.game.tick/1)%16;
        //console.log("B:", beltPos);
        ctx.drawImage(c.resDB.belt1.anim, beltPos*64, 0, 64, 64, 0, 0, 64, 64);


        if (ent.pos) {
            let invThis = inventory.getInv(ent.pos.x, ent.pos.y);
            if (invThis == undefined) return; // if the server is slow, no inventory for the entity
            let pos = 0;
            if (invThis.stack.LA) {
                if (invThis.stack.LA.moving) pos = beltPos; else pos = 0;
                ctx.drawImage(resName[invThis.stack.LA.id].img, 0, 0, 64, 64, 0, -pos*2, 32, 32);
            }
            if (invThis.stack.LB) {
                if (invThis.stack.LB.moving) pos = beltPos; else pos = 0;
                ctx.drawImage(resName[invThis.stack.LB.id].img, 0, 0, 64, 64, 0, -pos*2 + 32, 32, 32);
            }
        } 

    }
}

if (exports == undefined) var exports = {};
exports.Belt = Belt;