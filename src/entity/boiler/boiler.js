if (typeof window === "undefined") {
  c = require("../../common");
  inventory = require("../../core/inventory");
}

class Boiler extends Inventory{
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
    this.energy = 0;
    
    if (this.stack.FUEL == undefined) this.stack.FUEL = [];
    if (this.stack.INV == undefined) this.stack.INV = [{id: c.resDB.water.id, n: 0}];
    if (this.stack.OUTPUT == undefined) this.stack.OUTPUT = [{id: c.resDB.steam.id, n: 0}];

    this.nbInputs = [];
    this.nbOutputs = [];
  }

  update(map, ent) {
    if (c.game.tick % 100) return;

    if (this.stack.INV[0].n == 0) return;
    
    if (this.stack["FUEL"][0]?.n > 0 && this.energy <= 1) {
      this.energy += c.resName[this.stack["FUEL"][0].id].E; // add time factor
      this.stack["FUEL"][0].n--;
    }

    // INPUT
    let total = 0;
    let nSameType = 1;
    for (let nbID of this.nbInputs) {
      let n = c.allInvs[nbID];
      if (n == undefined) continue;
      if (n.stack.INV[0].id == undefined) n.stack.INV[0].id = this.stack.INV[0].id;
      if (n.stack.INV[0].id == this.stack.INV[0].id) {
        total += n.stack.INV[0].n;
        nSameType++;
      }
    }

    total += this.stack.INV[0].n;
    let medVal = Math.floor(total / nSameType);

    for (let nbID of this.nbInputs) {
      let n = c.allInvs[nbID];
      if (n == undefined) continue;
      if (n.stack.INV[0].id == this.stack.INV[0].id) {
        n.stack.INV[0].n = medVal;
      }
    }
    let rest = total - (medVal * nSameType);
    this.stack.INV[0].n = medVal;
    this.stack.INV[0].n += rest;

    // PROCESS
    if (this.stack.INV[0].n > 0 && this.energy > 0 && this.stack.OUTPUT[0].n < 100) {
      this.energy--;
      this.stack.INV[0].n--;
      this.stack.OUTPUT[0].n++;
    }

    // OUTPUT
    total = 0;
    nSameType = 0;
    for (let nbID of this.nbOutputs) {
      let n = c.allInvs[nbID];
      if (n == undefined) continue;
      if (n.stack.INV[0].id == undefined) n.stack.INV[0].id = this.stack.OUTPUT[0].id;
      if (n.stack.INV[0].id == this.stack.OUTPUT[0].id) {
        total += n.stack.INV[0].n;
        nSameType++;
      }
    }

    nSameType++;
    total += this.stack.OUTPUT[0].n;
    medVal = Math.floor(total / nSameType);

    for (let nbID of this.nbOutputs) {
      let n = c.allInvs[nbID];
      if (n == undefined) continue;
      if (n.stack.INV[0].id == this.stack.OUTPUT[0].id) {
        n.stack.INV[0].n = medVal;
      }
    }
    rest = total - (medVal * nSameType);
    this.stack.OUTPUT[0].n = medVal;
    this.stack.OUTPUT[0].n += rest;
  }

  updateNB() {
    this.nbInputs = [];
    this.nbOutputs = [];

    let nbPos = c.dirToVec[this.dir];
    let nb = inventory.getInv(this.pos.x - nbPos.x, this.pos.y - nbPos.y);
    if (nb?.type == c.resDB.pipe.id || nb?.type == c.resDB.generator.id) this.nbOutputs.push(nb.id);

    nb = inventory.getInv(this.pos.x + nbPos.x, this.pos.y + nbPos.y);
    if (nb?.type == c.resDB.pipe.id || nb?.type == c.resDB.generator.id) this.nbOutputs.push(nb.id);


    nbPos = c.dirToVec[(this.dir + 1) % 4];
    nb = inventory.getInv(this.pos.x - nbPos.x, this.pos.y - nbPos.y);
    if (nb?.type == c.resDB.pipe.id || nb?.type == c.resDB.boiler.id) this.nbInputs.push(nb.id);

    nb = inventory.getInv(this.pos.x + nbPos.x, this.pos.y + nbPos.y);
    if (nb?.type == c.resDB.pipe.id || nb?.type == c.resDB.boiler.id) this.nbInputs.push(nb.id);

  }

  draw(ctx, ent) {
    ctx.drawImage(c.resDB.boiler.img, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize);
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

db = c.resDB.boiler;
db.playerCanWalkOn = false;
db.size = [1, 1];
db.cost = [
  { id: c.resDB.iron_plate.id, n: 1 }
];

if (typeof Image !== "undefined") {
  const image = new Image(512, 32);
  image.src = "./src/" + c.resDB.boiler.type + "/boiler/boiler.png";
  c.resDB.boiler.img = image;
}

db.mach = Boiler;
exports.Boiler = Boiler;
