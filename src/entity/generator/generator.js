if (typeof window === "undefined") {
  c = require("../../common");
  inventory = require("../../core/inventory");
}

class Generator extends Inventory{
  constructor(pos, data) {
    super(pos, data);
    this.setup(undefined, data);
  }

  setup(map, ent) {
    this.stacksize = 8;
    this.packsize = {};
    this.packsize.INV = 1;
    this.packsize.FUEL = 1;
    this.packsize.OUTPUT = 1;
    
    if (this.stack.FUEL == undefined) this.stack.FUEL = [];
    if (this.stack.INV == undefined) this.stack.INV = [{id: c.resDB.steam.id, n: 0}];
    if (this.stack.OUTPUT == undefined) this.stack.OUTPUT = [{id: c.resDB.coulomb.id, n: 0}];

    this.nbPipes = [];
  }

  update(map, ent) {
    if (c.game.tick%100) return;

    if (this.nbPipes.length == 0 || this.stack.INV[0].n == 0) return;
    
    let total = 0;
    let nSameType = 0;
    for (let nbID of this.nbPipes) {
      let n = c.allInvs[nbID];
      if (n.stack.INV[0].id == undefined) n.stack.INV[0].id = this.stack.INV[0].id;
      if (n.stack.INV[0].id ==  this.stack.INV[0].id) {
        total += n.stack.INV[0].n;
        nSameType++;
      }
    }

    nSameType++;
    total += this.stack.INV[0].n;
    let medVal = Math.ceil(total / nSameType);

    for (let nbID of this.nbPipes) {
      let n = c.allInvs[nbID];
      if (n.stack.INV[0].id ==  this.stack.INV[0].id) {
        n.stack.INV[0].n = medVal;
      }
    }
    let rest = total - (medVal * nSameType);
    this.stack.INV[0].n += rest;

    if (this.stack.INV[0].n > 0 && this.stack.OUTPUT[0].n < 100) {
      this.stack.INV[0].n--;
      this.stack.OUTPUT[0].n++;
    }
  }

  updateNB() {
    this.nbPipes = [];
    let nbs = [
      inventory.getInv(this.pos.x + 1, this.pos.y + 0),
      inventory.getInv(this.pos.x + 0, this.pos.y + 1),
      inventory.getInv(this.pos.x - 1, this.pos.y + 0),
      inventory.getInv(this.pos.x - 0, this.pos.y - 1)
    ];
    for (let n of nbs) {
      if (n?.type == c.resDB.pipe.id) this.nbPipes.push(n.id);
    }
  }

  draw(ctx, ent) {
    ctx.drawImage(c.resDB.generator.img, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize);
  }

  drawItems(ctx) {
    if (this.pos && this.stack) {

      context.save();
      context.translate((this.pos.x + 0.5) * tileSize, (this.pos.y + 0.5) *tileSize);
      context.rotate(this.dir * Math.PI/2);
      context.translate(-tileSize / 2, -tileSize / 2);

      context.restore();
    }
  }
}

db = c.resDB.generator;
db.playerCanWalkOn = false;
db.size = [4, 1];
db.cost = [
  { id: c.resDB.iron_plate.id, n: 1 }
];

if (typeof Image !== "undefined") {
  const image = new Image(512, 32);
  image.src = "./src/" + c.resDB.generator.type + "/generator/generator.png";
  c.resDB.generator.img = image;
}

db.mach = Generator;
if (exports == undefined) var exports = {};
exports.Generator = Generator;
