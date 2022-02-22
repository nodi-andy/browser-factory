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
        inv.stack["FUEL"] = [c.item(undefined, 0)];
        inv.stack["OUTPUT"] = [c.item(undefined, 0)];

        let myEnt = inventory.getEnt(ent.pos.x, ent.pos.y);
        inventory.setInv(ent.pos.x + 1, ent.pos. y, inv.id);
        inventory.setInv(ent.pos.x + 1, ent.pos. y + 1, inv.id);
        inventory.setInv(ent.pos.x, ent.pos. y + 1, inv.id);

        inventory.setEnt(ent.pos.x + 1, ent.pos. y, myEnt.id);
        inventory.setEnt(ent.pos.x + 1, ent.pos. y + 1, myEnt.id);
        inventory.setEnt(ent.pos.x, ent.pos. y + 1, myEnt.id);
        myEnt.power = 0;
    }


    update(map, ent){
        if (c.game.tick%100 == 0) {
            let tile = map[ent.pos.x][ent.pos.y];
            if (tile[c.layers.res]?.n == 0) tile = map[ent.pos.x + 1][ent.pos.y];

            let inv = inventory.getInv(ent.pos.x, ent.pos.y);
            let myEnt = inventory.getEnt(ent.pos.x, ent.pos.y);
            myEnt.power = 0;

            if (tile[c.layers.res]?.n && inv.stack["OUTPUT"][0].n == 0 && inv.stack["FUEL"][0].n > 0) {
                if (inv.stack["OUTPUT"][0].id == undefined) inv.stack["OUTPUT"][0].id = c.resName[tile[c.layers.res].id].becomes.id;
                myEnt.power = 100;
                tile[c.layers.res].n--;
                inv.stack["OUTPUT"][0].n++
            }

            // Shift output on next tile
            let targetInv = inventory.getInv(ent.pos.x, ent.pos.y-1);
            if (inv.stack["OUTPUT"][0].n && targetInv.addStackItem({id: inv.stack["OUTPUT"][0].id, n:1})) inv.stack["OUTPUT"][0].n=0;

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
            if (inv && inv.stack["OUTPUT"][0] && inv.stack["OUTPUT"][0].id !=undefined && inv.stack["OUTPUT"][0].n) {
                context.save();
                ctx.translate(tileSize/2, -tileSize/2);
                context.scale(0.5, 0.5);
                context.drawImage(resName[inv.stack["OUTPUT"][0].id].img, 0, 0)
                context.scale(2, 2);
                context.restore();
            }
        }
    }
}

if (exports == undefined) var exports = {};
exports.BurnerMiner = BurnerMiner;