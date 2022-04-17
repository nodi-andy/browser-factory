if (typeof window === "undefined") {
  c = require("../../common");
  inventory = require("../../core/inventory");
}

class Pole extends Inventory{
  constructor(pos, data) {
    super(pos, data);
    this.setup(undefined, data);
  }

  setup(map, ent) {
    this.stacksize = 8;
    this.packsize = {};
    this.packsize.INV = 1;
    
    if (this.stack.INV == undefined) this.stack.INV = [{n: 0}];
    this.mapsize = {x: c.resDB.pole.size[0], y: c.resDB.pole.size[1]};
    this.nbInputs = [];
  }

  update(map, ent) {
    if (c.game.tick % 100) return;

    if (this.nbInputs.length == 0 || this.stack.INV[0].n == 0) return;

    // INPUT
    let total = 0;
    let nSameType = 0;
    for (let nbID of this.nbInputs) {
      let n = c.allInvs[nbID];
      if (n == undefined) continue;
      let target;
      if (n.stack.INV) target = n.stack.INV;
      else if (n.stack.FUEL) target = n.stack.FUEL;
      if (target[0].id == undefined) target[0].id = this.stack.INV[0].id;
      if (target[0].id ==  this.stack.INV[0].id) {
        total += target[0].n;
        nSameType++;
      }
    }
    nSameType++;
    total += this.stack.INV[0].n;

    // PROCESS
    let medVal = Math.floor(total / nSameType);

    // OUTPUT
    for (let nbID of this.nbInputs) {
      let n = c.allInvs[nbID];
      if (n == undefined) continue;
      let target;
      if (n.stack.INV) target = n.stack.INV;
      else if (n.stack.FUEL) target = n.stack.FUEL;
      if (target[0].id ==  target[0].id) {
        target[0].n = medVal;
      }
    }
    this.stack.INV[0].n = medVal;
    let rest = total - (medVal * nSameType);
    this.stack.INV[0].n += rest;
  }

  updateNB() {
    this.nbInputs = [];
    let radius = 3;
    let scanArea = {x: this.pos.x - radius, y: this.pos.y - radius, x2: this.pos.x + this.mapsize.x + 2 * radius, y2: this.pos.y + this.mapsize.y + 2 * radius}
    for(let x = scanArea.x; x < scanArea.x2; x++) {
      for(let y = scanArea.y; y < scanArea.y2; y++) {
        let nb = inventory.getInv(x, y);
        if (nb?.id == this.id) continue;
        if ((nb?.type == c.resDB.pole.id || nb?.type == c.resDB.generator.id || nb?.type == c.resDB.e_miner.id) && this.nbInputs.includes(nb.id) == false) this.nbInputs.push(nb.id);
      }
    }
  }

  drawItems(ctx) {
    let mapSize = c.resDB.pole.size;
    let viewSize = c.resDB.pole.viewsize;
    ctx.drawImage(c.resDB.pole.img, 0, 0, tileSize, tileSize, 0, -(viewSize[1] - mapSize[1]) * tileSize, viewSize[0] * tileSize, viewSize[1] * tileSize);

  }
}

db = c.resDB.pole;
db.size = [1, 1];
db.viewsize = [1, 3]
db.cost = [
  { id: c.resDB.iron_plate.id, n: 1 }
];

if (typeof Image !== "undefined") {
  const image = new Image(512, 32);
  image.src = "./src/" + c.resDB.pole.type + "/pole/pole.png";
  c.resDB.pole.img = image;
}

db.mach = Pole;
exports.Pole = Pole;
