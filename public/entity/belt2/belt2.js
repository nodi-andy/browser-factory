if (typeof window === 'undefined') {
    c = require("../../common");
    inventory = require("../../core/inventory");
} 


class Belt2 {
    constructor() {
       c.resDB.belt2.mach = this;
       if (typeof Image !== 'undefined') {
        const image = new Image(512, 32);
        image.src =  c.resDB.belt2.type + "/belt2/belt2_anim.png";
        c.resDB.belt2.anim = image;
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
        let invThis = inventory.getInv(ent.pos.x, ent.pos.y, true);
        let beltThis = inventory.getEnt(ent.pos.x, ent.pos.y);

        let nbPos = c.dirToVec[ent.dir];
        ent.done = true;
        
        let beltFrom = inventory.getEnt(ent.pos.x - nbPos.x, ent.pos.y - nbPos.y);
        if (beltFrom && beltFrom.type != resDB.belt.id) beltFrom = undefined;

        let beltTo = inventory.getEnt(ent.pos.x + nbPos.x, ent.pos.y + nbPos.y);
        if (beltTo && beltTo.type != resDB.belt1.id) beltTo = undefined;

        if (beltTo) {
            let invTo = inventory.getInv(ent.pos.x + nbPos.x, ent.pos.y + nbPos.y);
            let pos = 0;
            if (beltTo.dir != beltThis.dir) pos = 2;
            //let invFrom = getInv(ent.pos.x - nbPos.x, ent.pos.y - nbPos.y);
            if (invTo.nextpacks[pos].id == undefined) {
                invTo.nextpacks[pos].id = invThis.packs[3].id;
                invTo.nextpacks[pos].n = invThis.packs[3].n;
                invThis.packs[3].id = undefined; 
                invThis.packs[3].n = 0; 
            }

        }

        for (let i = 3; i >= 0; i--) {
            if (invThis.packs[i].id == undefined && i > 0) { 
                invThis.nextpacks[i].id = invThis.packs[i-1].id;
                invThis.nextpacks[i].n = invThis.packs[i-1].n;
                invThis.packs[i-1].id = undefined; 
                invThis.packs[i-1].n = 0; 
            } else {                     // Shift to the same position as reservation
               invThis.nextpacks[i].id = invThis.packs[i].id;
               invThis.nextpacks[i].n = invThis.packs[i].n;
            }
        }



        invThis.changed = true;

        if (beltFrom) this.update(map, beltFrom)
    }

    draw(ctx, ent) {
        ctx.drawImage(resName[ent.type].anim, Math.round(c.game.tick/2)%15*64, 0, 64, 64, 0, 0, 64, 64);
    }
}

if (exports == undefined) var exports = {};
exports.Belt2 = Belt2;