if (typeof window === 'undefined') {
    c = require("../../common");
    inventory = require("../../core/inventory");
} 

class BurnerMiner extends Inventory {
    constructor(pos, data) {
        super(pos, data)
        data.pos = pos;
        this.pos = pos;
        this.stack = data.stack;
        this.setup(undefined, data);
    }

    setup(map, ent) {
        if (this.stack == undefined) this.stack = {};
        if (this.stack.FUEL == undefined) this.stack.FUEL = [];
        this.packsize = {};
        this.packsize.FUEL = 1;
        let size = c.resDB.burner_miner.size;
        for(let i = 0; i < size[0]; i++) {
            for(let j = 0; j < size[1]; j++) {
                inventory.setInv(ent.pos.x + i, ent.pos. y + j, this.id);
            }
        }
        this.energy = 0;
        this.power = 0;
    }


    update(map, ent){
        if (this.stack.FUEL == undefined) this.stack.FUEL = [];

        if (c.game.tick%100 == 0) {
            this.power = 0;
            if (this.stack["FUEL"] == undefined || this.stack["FUEL"].length == 0) this.stack["FUEL"] = [c.item(undefined, 0)];
            let output;
            let tile = map[ent.pos.x][ent.pos.y];
            if (tile[c.layers.res]?.n == 0) tile = map[ent.pos.x + 1][ent.pos.y];

            let invTo;
            if (this.dir == 0) invTo = inventory.getInv(ent.pos.x + 2, ent.pos.y, true);
            if (this.dir == 1) invTo = inventory.getInv(ent.pos.x + 1, ent.pos.y + 2, true);
            if (this.dir == 2) invTo = inventory.getInv(ent.pos.x - 1, ent.pos.y + 1, true);
            if (this.dir == 3) invTo = inventory.getInv(ent.pos.x, ent.pos.y - 1, true);
            if (tile[c.layers.res]?.n) output = c.resName[c.resName[tile[c.layers.res].id].becomes];
            // Shift output on next tile
            let stackName;
            // place into assembling machine
            if (invTo.type == c.resDB.assembling_machine_1.id) stackName = resName[this.stack.INV[0].id].name;
            //place onto belt
            else if (invTo.type == c.resDB.belt1.id) {
                let relDir = (invTo.dir - this.dir + 3) % 4;
                let dirPref = ["L", "R", "L", "R"];
                stackName = dirPref[relDir];
            }

            let hasPlace = invTo.hasPlaceFor({id: output, n: 1}, stackName);
            let neededEnergy = c.resName[tile[c.layers.res].id].W;
            if (this.stack["FUEL"][0]?.n > 0 && hasPlace && this.energy <= neededEnergy) {
                this.energy += c.resName[this.stack["FUEL"][0].id].E; // add time factor
                this.power = 100;
                this.stack["FUEL"][0].n--;
                tile[c.layers.res].n--;
            }

            if (output && hasPlace && this.energy > neededEnergy) {
                this.power = 100;
                this.energy -= neededEnergy; // add time factor
                invTo.addItem({id: output.id, n:1}, stackName);
            } 

        }
    }

    draw(ctx, ent) {
        let db = c.resDB.burner_miner;
        context.save();
        ctx.drawImage(db.anim1, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize);
        ctx.fillStyle = "black";
        ctx.fillRect(tileSize * 1.75, tileSize * 0.5, tileSize/4,tileSize/4);
        ctx.translate(tileSize, tileSize);

        if (this.pos?.x) {
            if (this.power) ctx.rotate((c.game.tick/100)% (2*Math.PI));
        }
        ctx.translate(-tileSize, -tileSize);
        ctx.drawImage(db.anim2, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize);
        context.restore();
    }
}

db = c.resDB.burner_miner;
db.mach = BurnerMiner;
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
exports.BurnerMiner = BurnerMiner;