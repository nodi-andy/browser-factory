if (typeof window === 'undefined') {
    c = require("../../common");
    inventory = require("../../core/inventory");
} 

class BurnerMiner {
    constructor() {
       let db = c.resDB.burner_miner;
       db.mach = this;
       db.type = "entity";
       db.cost = [{id: c.resDB.stone_furnace.id, n: 1}, {id: c.resDB.iron_plate.id, n: 3}, {id: c.resDB.gear.id, n: 2}]
       if (typeof Image !== 'undefined') {
         const image = new Image(512, 32);
         image.src =  "./src/" + db.type + "/burner_miner/platform.png";
         db.anim1 = image;
       }
       if (typeof Image !== 'undefined') {
        const image = new Image(512, 32);
        image.src =  "./src/" + db.type + "/burner_miner/drill.png";
        db.anim2 = image;
      }
      db.size = [2, 2];

    }

    setup(map, ent) {
        let inv = inventory.getInv(ent.pos.x, ent.pos.y, true);
        inv.stack.FUEL = [];
        inv.packsize = {};
        inv.packsize.FUEL = 1;

        inventory.setInv(ent.pos.x + 1, ent.pos. y, inv.id);
        inventory.setInv(ent.pos.x + 1, ent.pos. y + 1, inv.id);
        inventory.setInv(ent.pos.x, ent.pos. y + 1, inv.id);
        inv.power = 0;
    }


    update(map, ent){
        let inv = inventory.getInv(ent.pos.x, ent.pos.y);
        if (inv.stack.FUEL == undefined) inv.stack.FUEL = [];
        inv.stack.FUEL.size = 1;
        if (c.game.tick%100 == 0) {
            if (inv.stack["FUEL"] == undefined || inv.stack["FUEL"].length == 0) inv.stack["FUEL"] = [c.item(undefined, 0)];
            let output;
            let tile = map[ent.pos.x][ent.pos.y];
            if (tile[c.layers.res]?.n == 0) tile = map[ent.pos.x + 1][ent.pos.y];

            inv.power = 0;

            let targetInv;
            if (inv.dir == 0) targetInv = inventory.getInv(ent.pos.x + 2, ent.pos.y, true);
            if (inv.dir == 1) targetInv = inventory.getInv(ent.pos.x + 1, ent.pos.y + 2, true);
            if (inv.dir == 2) targetInv = inventory.getInv(ent.pos.x - 1, ent.pos.y + 1, true);
            if (inv.dir == 3) targetInv = inventory.getInv(ent.pos.x, ent.pos.y - 1, true);
            let hasPlace = targetInv.hasPlaceFor({id: c.resDB.coal.id, n: 1});

            if (tile[c.layers.res]?.n && inv.stack["FUEL"][0] && inv.stack["FUEL"][0].n > 0 && hasPlace) {
                output = c.resName[tile[c.layers.res].id].becomes;
                inv.power = 100;
                tile[c.layers.res].n--;
            }

            // Shift output on next tile

            if (output && hasPlace) targetInv.addItem({id: output, n:1});

        }
    }

    draw(ctx, ent) {
        let db = c.resDB.burner_miner;
        context.save();
        ctx.drawImage(db.anim1, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize);
        ctx.fillRect(tileSize * 1.75, tileSize * 0.5, tileSize/4,tileSize/4);
        ctx.translate(tileSize, tileSize);

        if (ent && ent.pos && ent.pos.x) {
            let inv = inventory.getInv(ent.pos.x, ent.pos.y);
            if (inv.power) ctx.rotate((c.game.tick/100)% (2*Math.PI));
        }
        ctx.translate(-tileSize, -tileSize);
        ctx.drawImage(db.anim2, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize);
        context.restore();
    }
}

if (exports == undefined) var exports = {};
exports.BurnerMiner = BurnerMiner;