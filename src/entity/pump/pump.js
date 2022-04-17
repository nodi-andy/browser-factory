if (typeof window === 'undefined') {
    c = require("../../common");
    inventory = require("../../core/inventory");
} 

class Pump extends Inventory {
    constructor(pos, data) {
        super(pos, data)
        data.pos = pos;
        this.pos = pos;
        this.stack = data.stack;
        this.setup(undefined, data);
        this.nbPipes = [];
    }

    setup(map, ent) {
        if (this.stack == undefined) this.stack = {};
        this.packsize = {};
        this.packsize.OUTPUT = 1;
        this.mapsize = {x: c.resDB.generator.size[0], y: c.resDB.generator.size[1]};
        if (this.dir == 1 || this.dir == 3) this.mapsize = {x: c.resDB.generator.size[1], y: c.resDB.generator.size[0]};
        for(let i = 0; i < this.mapsize.x; i++) {
            for(let j = 0; j < this.mapsize.y; j++) {
                inventory.setInv(this.pos.x + i, this.pos. y + j, this.id);
            }
        }
    }


    update(map, ent){
        let output;
        if (this.stack.OUTPUT == undefined) this.stack.OUTPUT = [{id: c.resDB.water.id, n: 0}];
        output = this.stack.OUTPUT[0];
        if (c.game.tick%10 == 0 && output?.n < 100) {
            output.n += 1;
        }

        if (this.nbPipes.length == 0) return;
        if (this.nbPipes[0].stack.INV[0].id == undefined) this.nbPipes[0].stack.INV[0].id = output.id;
        if (this.nbPipes[0].stack.INV[0].id == output.id) {
            let total = output.n + this.nbPipes[0].stack.INV[0].n;
            let medVal = Math.floor(total / 2);
            this.nbPipes[0].stack.INV[0].n = medVal;
            this.stack.OUTPUT[0].n = total - medVal;
        }
    }

    updateNB() {
        let nbPos = c.dirToVec[(this.dir + 1) % 4];
        let nbPipe = inventory.getInv(this.pos.x - nbPos.x, this.pos.y - nbPos.y);
        this.nbPipes = [];
        if (nbPipe) this.nbPipes.push(nbPipe);
    }

    draw(ctx, ent) {
        let mapSize = c.resDB.pump.size;
        let viewSize = c.resDB.pump.viewsize;
        ctx.drawImage(c.resDB.pump.img, 0, 0, tileSize, tileSize, 0, -(viewSize[1] - mapSize[1]) * tileSize, viewSize[0] * tileSize, viewSize[1] * tileSize);
  
    }
}

db = c.resDB.pump;
db.mach = Pump;
db.type = "entity";
db.cost = [{id: c.resDB.iron_plate.id, n: 3}]
if (typeof Image !== 'undefined') {
  const image = new Image(512, 32);
  image.src =  "./src/" + db.type + "/pump/pump.png";
  db.anim1 = image;
}
db.size = [1, 2];
db.viewsize = [1, 2];
exports.Pump = Pump;