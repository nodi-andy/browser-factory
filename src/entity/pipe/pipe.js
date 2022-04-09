if (typeof window === "undefined") {
  c = require("../../common");
  inventory = require("../../core/inventory");
}

class Pipe extends Inventory{
  constructor(pos, data) {
    super(pos, data);
    this.setup(undefined, data);
  }

  setup(map, ent) {
    this.stacksize = 8;
    this.packsize = {};
    this.packsize.INV = 1;
    
    if (this.stack.INV == undefined) this.stack.INV = [{n: 0}];

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
  }

  updateNB() {
    this.nbPipes = [];
    let nbs = [
      inventory.getInv(this.pos.x + 1, this.pos.y - 1),
      inventory.getInv(this.pos.x + 1, this.pos.y + 0),
      inventory.getInv(this.pos.x + 1, this.pos.y + 1),
      inventory.getInv(this.pos.x + 0, this.pos.y + 1),
      inventory.getInv(this.pos.x - 1, this.pos.y + 1),
      inventory.getInv(this.pos.x - 1, this.pos.y + 0),
      inventory.getInv(this.pos.x - 1, this.pos.y - 1),
      inventory.getInv(this.pos.x - 0, this.pos.y - 1)
    ];
    for (let n of nbs) {
      if (n?.type == c.resDB.pipe.id) this.nbPipes.push(n.id);
    }
  }

  draw(ctx, ent) {
    ctx.drawImage(c.resDB.pipe.img, 0, 0, 64, 64, 0, 0, 64, 64);
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

db = c.resDB.pipe;
db.playerCanWalkOn = false;
db.size = [1, 1];
db.cost = [
  { id: c.resDB.iron_plate.id, n: 1 }
];

if (typeof Image !== "undefined") {
  const image = new Image(512, 32);
  image.src = "./src/" + c.resDB.pipe.type + "/pipe/pipe-straight-horizontal.png";
  c.resDB.pipe.img = image;
}

db.mach = Pipe;
if (exports == undefined) var exports = {};
exports.Pipe = Pipe;
