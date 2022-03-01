if (typeof window === 'undefined') {
    c = require("../../common");
    inventory = require("../../core/inventory");
} 


class Belt {
    constructor() {
        let db = c.resDB.belt1;
        db.mach = this;
        db.playerCanWalkOn = true;
        db.size = [1, 1];
        db.cost = [{res: c.resDB.iron_plate, n: 1}, {res: c.resDB.gear, n: 1}]
       if (typeof Image !== 'undefined') {
        const image = new Image(512, 32);
        image.src =  c.resDB.belt1.type + "/belt1/belt1_anim.png";
        c.resDB.belt1.anim = image;
       }
    }

    setup(map, ent) {
        let invThis = inventory.getInv(ent.pos.x, ent.pos.y, true);
        invThis.stacksize = 5;
        invThis.packsize = {};
        invThis.packsize.INV = 1;
    }

    
    shift(from, itfrom, to, itto, deciding) {
        if ((to.stack[itto] == undefined || (to.stack[itto] && to.stack[itto].moving)) && from.stack[itfrom]) {
            if (deciding) {
                from.stack[itfrom].moving = true;
            } else {
                if (from.stack[itfrom].moving) {
                    to.stack[itto] = from.stack[itfrom];
                    to.stack[itto].moving = false;
                    delete from.stack[itfrom];
                }
            }
        }
    }


    update(map, ent, first = false){
        ent.done = true;
        let invThis = inventory.getInv(ent.pos.x, ent.pos.y, true);

        if (invThis == undefined) return;
        let movingParts = c.game.tick%8 == 0;
        let decidingMoving = (c.game.tick-1)%8 == 0;
        if (movingParts || decidingMoving) {
            let beltThis = inventory.getEnt(ent.pos.x, ent.pos.y);
            let nbPos = c.dirToVec[ent.dir];
            let beltFrom = inventory.getEnt(ent.pos.x - nbPos.x, ent.pos.y - nbPos.y);
            if (beltFrom && Math.abs(beltThis.dir - beltFrom.dir)==2) beltFrom = undefined;
            if (beltFrom == undefined) {
                // LEFT
                let nbLeft = c.dirToVec[(ent.dir+1)%4];
                let beltFromLeft = inventory.getEnt(ent.pos.x - nbLeft.x, ent.pos.y - nbLeft.y);
                if(beltFromLeft && ((beltFromLeft.dir-ent.dir)+4) % 4 != 1) {
                    beltFromLeft = undefined;
                }

                // RIGHT
                let nbRight = c.dirToVec[(ent.dir+3)%4];
                let beltFromRight = inventory.getEnt(ent.pos.x - nbRight.x, ent.pos.y - nbRight.y);
                if(beltFromRight && ((beltFromRight.dir-ent.dir)+4) % 4 != 3) {
                    beltFromRight = undefined;
                }

                if (beltFromLeft && beltFromRight) beltFrom = undefined;
                else {
                    if (beltFromLeft) beltFrom = beltFromLeft;
                    if (beltFromRight) beltFrom = beltFromRight;
                }
            }
            let beltTo = inventory.getEnt(ent.pos.x + nbPos.x, ent.pos.y + nbPos.y);
            let invTo = inventory.getInv(ent.pos.x + nbPos.x, ent.pos.y + nbPos.y);

            if (invThis.stack.INV) {
                if (invThis.stack.LA == undefined) invThis.stack.LA = invThis.stack.INV[0];
                else if (invThis.stack.RA == undefined) invThis.stack.RA = invThis.stack.INV[0];
                else if (invThis.stack.LB == undefined) invThis.stack.LB = invThis.stack.INV[0];
                else if (invThis.stack.RB == undefined) invThis.stack.RB = invThis.stack.INV[0];
                else if (invThis.stack.LC == undefined) invThis.stack.LC = invThis.stack.INV[0];
                else if (invThis.stack.RC == undefined) invThis.stack.RC = invThis.stack.INV[0];
                else if (invThis.stack.LD == undefined) invThis.stack.LD = invThis.stack.INV[0];
                else if (invThis.stack.RD == undefined) invThis.stack.RD = invThis.stack.INV[0];
                delete invThis.stack.INV;
            }
          
            //SHIFT INTO NEXT BELT
            if (beltTo && beltTo.type != c.resDB.belt1.id) beltTo = undefined;
            if (beltTo) {
                let dAng = c.dirToAng[beltTo.dir] - c.dirToAng[beltThis.dir];
                if (first == false) dAng = 0;
                if (dAng == 0) {
                    this.shift(invThis, "LA", invTo, "LD", decidingMoving);
                    this.shift(invThis, "RA", invTo, "RD", decidingMoving);
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
            this.shift(invThis, "LD", invThis, "LC", decidingMoving);
            this.shift(invThis, "LC", invThis, "LB", decidingMoving);
            this.shift(invThis, "LB", invThis, "LA", decidingMoving);
            this.shift(invThis, "RD", invThis, "RC", decidingMoving);
            this.shift(invThis, "RC", invThis, "RB", decidingMoving);
            this.shift(invThis, "RB", invThis, "RA", decidingMoving);

            if (beltFrom && beltFrom.type != c.resDB.belt1.id) beltFrom = undefined;
            if (beltFrom && beltFrom.done == false) this.update(map, beltFrom)
        }
    }

    draw(ctx, ent) {
        let beltPos = Math.round(c.game.tick/1)%16;
        //console.log("B:", beltPos);
        ctx.drawImage(c.resDB.belt1.anim, 0, beltPos * 64, 64, 64, 0, 0, 64, 64);

    }

    drawItems(ctx, ent) {
        let beltPos = Math.round(c.game.tick/1)%8;
        if (ent.pos) {
            let invThis = inventory.getInv(ent.pos.x, ent.pos.y);
            if (invThis == undefined) return; // if the server is slow, no inventory for the entity
            if (invThis.stack == undefined) return;
            let pos = 0;
            let xpos = 0.6;
            let dx = -0.25;
            if (invThis.stack.LA) {
                if (invThis.stack.LA.moving) pos = beltPos; else pos = 0;
                ctx.drawImage(resName[invThis.stack.LA.id].img, 0, 0, 64, 64, pos*2 + xpos * tileSize, 0.1 * tileSize, 32, 32);
            }
            
            if (invThis.stack.RA) {
                if (invThis.stack.RA.moving) pos = beltPos; else pos = 0;
                ctx.drawImage(resName[invThis.stack.RA.id].img, 0, 0, 64, 64, pos*2 + xpos * tileSize , 0.4 * tileSize, 32, 32);
            }
            xpos += dx;
            if (invThis.stack.LB) {
                if (invThis.stack.LB.moving) pos = beltPos; else pos = 0;
                ctx.drawImage(resName[invThis.stack.LB.id].img, 0, 0, 64, 64, pos*2 + xpos * tileSize , 0.1 * tileSize, 32, 32);
            }

            if (invThis.stack.RB) {
                if (invThis.stack.RB.moving) pos = beltPos; else pos = 0;
                ctx.drawImage(resName[invThis.stack.RB.id].img, 0, 0, 64, 64, pos*2 + xpos * tileSize , 0.4 * tileSize  , 32, 32);
            }

            xpos += dx;
            if (invThis.stack.LC) {
                if (invThis.stack.LC.moving) pos = beltPos; else pos = 0;
                ctx.drawImage(resName[invThis.stack.LC.id].img, 0, 0, 64, 64, pos*2 + xpos * tileSize , 0.1 * tileSize, 32, 32);
            }

            if (invThis.stack.RC) {
                if (invThis.stack.RC.moving) pos = beltPos; else pos = 0;
                ctx.drawImage(resName[invThis.stack.RC.id].img, 0, 0, 64, 64, pos*2 + xpos * tileSize , 0.4 * tileSize  , 32, 32);
            }

            xpos += dx;
            if (invThis.stack.LD) {
                if (invThis.stack.LD.moving) pos = beltPos; else pos = 0;
                ctx.drawImage(resName[invThis.stack.LD.id].img, 0, 0, 64, 64, pos*2 + xpos * tileSize , 0.1 * tileSize, 32, 32);
            }

            if (invThis.stack.RD) {
                if (invThis.stack.RD.moving) pos = beltPos; else pos = 0;
                ctx.drawImage(resName[invThis.stack.RD.id].img, 0, 0, 64, 64, pos*2 + xpos * tileSize , 0.4 * tileSize  , 32, 32);
            }

        } 

    }
}

if (exports == undefined) var exports = {};
exports.Belt = Belt;