if (typeof window === 'undefined') {
    c = require("../../common");
    inventory = require("../../core/inventory");
} 

class BurnerMiner {
    constructor() {
       let db = c.resDB.burner_miner;
       db.mach = this;
       if (typeof Image !== 'undefined') {
         const image = new Image(512, 32);
         image.src =  db.type + "/burner_miner/platform.png";
         db.anim1 = image;
       }
       if (typeof Image !== 'undefined') {
        const image = new Image(512, 32);
        image.src =  db.type + "/burner_miner/drill.png";
        db.anim2 = image;
      }
      db.size = [2, 2];
    }

    setup(map, ent) {
        let inv = inventory.getInv(ent.pos.x, ent.pos.y);
        inv.setPackSize(1);
        inv.packs[0].n = 0;
        inv.packs[0].size = 1;

        let myEnt = inventory.getEnt(ent.pos.x, ent.pos.y);
        myEnt.power = 100;
    }


    update(map, ent){
        if (c.game.tick%100 == 0) {
            let tile = map[ent.pos.x][ent.pos.y];
            let inv = inventory.getInv(ent.pos.x, ent.pos.y);

            if (tile[c.layers.res] && tile[c.layers.res].n && inv.packs[0].n == 0) {
                if (inv.packs[0].id == undefined) inv.packs[0].id = c.resName[tile[c.layers.res].id].becomes.id;
                tile[c.layers.res].n--;
                inv.packs[0].n++
            }

            let targetInv = inventory.getInv(ent.pos.x, ent.pos.y-1);
            if (inv.packs[0].n && targetInv.addItem({id: inv.packs[0].id, n:1})) inv.packs[0].n=0;

            let myEnt = inventory.getEnt(ent.pos.x, ent.pos.y);
            if(inv.packs[0].n == 0) {
                myEnt.power = 100;
            } else myEnt.power = 0;
        }
    }

    draw(ctx, ent) {
        let db = c.resDB.burner_miner;
        context.save();
        ctx.drawImage(db.anim1, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize);
        ctx.fillRect(tileSize/2,0,tileSize/4,tileSize/4);
        ctx.translate(tileSize, tileSize);

        if (ent && ent.pos && ent.pos.x) {
            let myEnt = inventory.getEnt(ent.pos.x, ent.pos.y);
            if (myEnt.power) ctx.rotate((c.game.tick/100)% (2*Math.PI));
        }
        ctx.translate(-tileSize, -tileSize);
        ctx.drawImage(db.anim2, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize);
        context.restore();

        if (ent && ent.pos && ent.pos.x) {
            let inv = inventory.getInv(ent.pos.x, ent.pos.y);
            if (inv && inv.packs[0] && inv.packs[0].id !=undefined && inv.packs[0].n) {
                context.save();
                ctx.translate(tileSize/2, -tileSize/2);
                context.scale(0.5, 0.5);
                context.drawImage(resName[inv.packs[0].id].img, 0, 0)
                context.scale(2, 2);
                context.restore();
            }
        }
    }
}

if (exports == undefined) var exports = {};
exports.BurnerMiner = BurnerMiner;