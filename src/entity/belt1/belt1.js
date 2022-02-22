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

    
    shift(from, itfrom, to, itto, deciding) {
        if ((to.stack[itto] == undefined || (to.stack[itto] && to.stack[itto].moving)) && from.stack[itfrom]) {
            if (deciding) {
                from.stack[itfrom].moving = true;
            } else {
                to.stack[itto] = from.stack[itfrom];
                to.stack[itto].moving = false;
                delete from.stack[itfrom];
            }
        }
    }


    update(map, ent){
        ent.done = true;
        let invThis = inventory.getInv(ent.pos.x, ent.pos.y, true);
        if (invThis == undefined) return;
        let movingParts = c.game.tick%16 == 0;
        let decidingMoving = (c.game.tick-1)%16 == 0;
        if (movingParts || decidingMoving) {
            let beltThis = inventory.getEnt(ent.pos.x, ent.pos.y);
            let nbPos = c.dirToVec[ent.dir];
            let beltFrom = inventory.getEnt(ent.pos.x - nbPos.x, ent.pos.y - nbPos.y);
            let beltTo = inventory.getEnt(ent.pos.x + nbPos.x, ent.pos.y + nbPos.y);
            let invTo = inventory.getInv(ent.pos.x + nbPos.x, ent.pos.y + nbPos.y);

            if (invThis.stack["INV"]) {
                if (invThis.stack.LA == undefined) invThis.stack.LA = invThis.stack["INV"][0];
                else if (invThis.stack.LB == undefined) invThis.stack.LB = invThis.stack["INV"][0];
                else if (invThis.stack.RA == undefined) invThis.stack.RA = invThis.stack["INV"][0];
                else if (invThis.stack.RB == undefined) invThis.stack.RB = invThis.stack["INV"][0];
                delete invThis.stack["INV"];
            }
          
            //SHIFT INTO NEXT BELT
            if (beltTo && beltTo.type != c.resDB.belt1.id) beltTo = undefined;
            if (beltTo) {
                let dAng = c.dirToAng[beltTo.dir] - c.dirToAng[beltThis.dir];
                if (dAng == 0) {
                    this.shift(invThis, "LA", invTo, "LB", decidingMoving);
                    this.shift(invThis, "RA", invTo, "RB", decidingMoving);
                } else if (dAng == -270 || dAng == 90) {
                    this.shift(invThis, "LA", invTo, "RB", decidingMoving);
                    this.shift(invThis, "RA", invTo, "RA", decidingMoving);
                }
                else if (dAng == 270 || dAng == -90) {
                    this.shift(invThis, "LA", invTo, "LA", decidingMoving);
                    this.shift(invThis, "RA", invTo, "LB", decidingMoving);
                }
            }
            // SHIFT ON THE BELT
            this.shift(invThis, "LB", invThis, "LA", decidingMoving);
            this.shift(invThis, "RB", invThis, "RA", decidingMoving);

            if (beltFrom && beltFrom.type != c.resDB.belt1.id) beltFrom = undefined;
            if (beltFrom) this.update(map, beltFrom)
        }
    }

    draw(ctx, ent) {
        let beltPos = Math.round(c.game.tick/1)%16;
        //console.log("B:", beltPos);
        ctx.drawImage(c.resDB.belt1.anim, 0, beltPos * 64, 64, 64, 0, 0, 64, 64);

    }

    drawItems(ctx, ent) {
        let beltPos = Math.round(c.game.tick/1)%16;
        if (ent.pos) {
            let invThis = inventory.getInv(ent.pos.x, ent.pos.y);
            if (invThis == undefined) return; // if the server is slow, no inventory for the entity
            if (invThis.stack == undefined) return;
            let pos = 0;
            if (invThis.stack.LA) {
                if (invThis.stack.LA.moving) pos = beltPos; else pos = 0;
                ctx.drawImage(resName[invThis.stack.LA.id].img, 0, 0, 64, 64, pos*2 + 0.5 * tileSize, 0.1 * tileSize, 32, 32);
            }
            if (invThis.stack.LB) {
                if (invThis.stack.LB.moving) pos = beltPos; else pos = 0;
                ctx.drawImage(resName[invThis.stack.LB.id].img, 0, 0, 64, 64, pos*2, 0.1 * tileSize, 32, 32);
            }
            if (invThis.stack.RA) {
                if (invThis.stack.RA.moving) pos = beltPos; else pos = 0;
                ctx.drawImage(resName[invThis.stack.RA.id].img, 0, 0, 64, 64, pos*2 + 0.5 * tileSize, 0.4 * tileSize, 32, 32);
            }
            if (invThis.stack.RB) {
                if (invThis.stack.RB.moving) pos = beltPos; else pos = 0;
                ctx.drawImage(resName[invThis.stack.RB.id].img, 0, 0, 64, 64, pos*2, 0.4 * tileSize, 32, 32);
            }
        } 

    }
}

if (exports == undefined) var exports = {};
exports.Belt = Belt;