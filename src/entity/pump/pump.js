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
            let medVal = Math.ceil(total / 2);
            this.nbPipes[0].stack.INV[0].n = medVal;
            this.stack.OUTPUT[0].n = total - medVal;
        }
    }

    updateNB() {
        let nbPos = c.dirToVec[(this.dir + 3) % 4];
        let nbPipe = inventory.getInv(this.pos.x - nbPos.x, this.pos.y - nbPos.y);
        this.nbPipes = [];
        if (nbPipe) this.nbPipes.push(nbPipe);
    }

    draw(ctx, ent) {
        let db = c.resDB.pump;
        context.save();
        ctx.drawImage(db.img, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize);
        context.restore();
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
db.size = [1, 1];
if (exports == undefined) var exports = {};
exports.Pump = Pump;