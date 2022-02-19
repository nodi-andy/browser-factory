if (typeof window === 'undefined') {
    c = require("../../common");
    inventory = require("../../core/inventory");
} 


class AssemblingMachine1 {
    constructor() {
      let db = c.resDB.assembling_machine_1;
      db.mach = this;
      if (typeof Image !== 'undefined') {
        const image = new Image(512, 32);
        image.src =  db.type + "/assembling_machine_1/platform.png";
        db.anim = image;
      }
      db.size = [3, 3];
    }

    setup(map, ent) {
        let inv = inventory.getInv(ent.pos.x, ent.pos.y);
        inv.itemsize = 50;
        inv.packs[0].t = "INPUT";
        inv.packs[1].t = "INPUT";
        inv.packs[2].t = "OUTPUT";
    }


    update(map, ent){
        //craftToInv(inv, resDB.stone_furnace.output, false);
    }

    draw(ctx, ent) {
        let db = resName[ent.type];
        ctx.drawImage(db.anim, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize);
    }
}

if (exports == undefined) var exports = {};
exports.AssemblingMachine1 = AssemblingMachine1;