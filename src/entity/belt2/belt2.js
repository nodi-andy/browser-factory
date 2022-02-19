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
    }

    update(map, ent){
        let invThis = inventory.getInv(ent.pos.x, ent.pos.y, true);
        let beltThis = inventory.getEnt(ent.pos.x, ent.pos.y);

        let nbPos = c.dirToVec[ent.dir];
        ent.done = true;
        
        let beltFrom = inventory.getEnt(ent.pos.x - nbPos.x, ent.pos.y - nbPos.y);
        if (beltFrom && beltFrom.type != c.resDB.belt1.id) beltFrom = undefined;

        let beltTo = inventory.getEnt(ent.pos.x + nbPos.x, ent.pos.y + nbPos.y);
        if (beltTo && beltTo.type != c.resDB.belt1.id) beltTo = undefined;

        if (beltFrom) this.update(map, beltFrom)
    }

    draw(ctx, ent) {
        ctx.drawImage(c.resDB.belt2.anim, Math.round(c.game.tick/2)%16 * 64, 0, 64, 64, 0, 0, 64, 64);
    }
}

if (exports == undefined) var exports = {};
exports.Belt2 = Belt2;