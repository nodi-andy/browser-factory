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
    this.mapsize = {x: c.resDB.pipe.size[0], y: c.resDB.pipe.size[1]};
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
      if (n.stack.INV[0].id == undefined) n.stack.INV[0].id = this.stack.INV[0].id;
      if (n.stack.INV[0].id ==  this.stack.INV[0].id) {
        total += n.stack.INV[0].n;
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
      if (n.stack.INV[0].id ==  this.stack.INV[0].id) {
        n.stack.INV[0].n = medVal;
      }
    }
    this.stack.INV[0].n = medVal;
    let rest = total - (medVal * nSameType);
    this.stack.INV[0].n += rest;
  }

  updateNB() {
    this.nbInputs = [];
    let nbr = inventory.getInv(this.pos.x + 1, this.pos.y + 0);
    let nbl = inventory.getInv(this.pos.x - 1, this.pos.y + 0);
    let nbu = inventory.getInv(this.pos.x + 0, this.pos.y - 1);
    let nbd = inventory.getInv(this.pos.x + 0, this.pos.y + 1);
    if (!(nbr?.type == c.resDB.pipe.id || nbr?.type == c.resDB.boiler.id)) nbr = undefined;
    if (!(nbl?.type == c.resDB.pipe.id || nbl?.type == c.resDB.boiler.id)) nbl = undefined;
    if (!(nbu?.type == c.resDB.pipe.id || nbu?.type == c.resDB.boiler.id)) nbu = undefined;
    if (!(nbd?.type == c.resDB.pipe.id || nbd?.type == c.resDB.boiler.id)) nbd = undefined;

    let nbs = [nbr, nbl, nbu, nbd];
    for (let nb of nbs) {
      if ((nb?.type == c.resDB.pipe.id || nb?.type == c.resDB.boiler.id) && this.nbInputs.includes(nb.id) == false) this.nbInputs.push(nb.id);
    }

    this.img = c.resDB.pipe.sh;
    this.imgMirror = false;
    switch (this.nbInputs.length) {
      case 1:
        if (nbd) this.img = c.resDB.pipe.enddown;
        else if (nbu) this.img = c.resDB.pipe.endup;
        else if (nbl) this.img = c.resDB.pipe.endright;
        else if (nbr) this.img = c.resDB.pipe.endleft;
      case 2:
        if (nbl && nbr) this.img = c.resDB.pipe.sh;
        else if (nbd && nbu) this.img = c.resDB.pipe.sv;
        else if (nbl && nbu) this.img = c.resDB.pipe.crd;
        else if (nbr && nbu) this.img = c.resDB.pipe.cld;
        else if (nbl && nbd) this.img = c.resDB.pipe.cru;
        else if (nbr && nbd) this.img = c.resDB.pipe.clu;

        break;
      case 3:
        if (nbd == undefined) this.img = c.resDB.pipe.tup;
        else if (nbu == undefined) this.img = c.resDB.pipe.tdown;
        else if (nbl == undefined) this.img = c.resDB.pipe.tright;
        else if (nbr == undefined) this.img = c.resDB.pipe.tleft;
        break;
      case 4: this.img = c.resDB.pipe.cross;
        break;
    }
  }

  draw(ctx, ent) {
    let img = this.img;
    if (ent) img = c.resDB.pipe.sh
    ctx.drawImage(img, 0, 0, db.size[0]*tileSize/2, db.size[1]*tileSize/2, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize);
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
db.rotatable = false;
db.size = [1, 1];
db.cost = [
  { id: c.resDB.iron_plate.id, n: 1 }
];

if (typeof Image !== "undefined") {
  let image = new Image(32, 32);
  image.src = "./src/" + c.resDB.pipe.type + "/pipe/pipe-straight-horizontal.png";
  c.resDB.pipe.sh = image;

  image = new Image(32, 32);
  image.src = "./src/" + c.resDB.pipe.type + "/pipe/pipe-straight-vertical.png";
  c.resDB.pipe.sv = image;

  image = new Image(32, 32);
  image.src = "./src/" + c.resDB.pipe.type + "/pipe/pipe-cross.png";
  c.resDB.pipe.cross = image;

  image = new Image(32, 32);
  image.src = "./src/" + c.resDB.pipe.type + "/pipe/pipe-ending-up.png";
  c.resDB.pipe.endup = image;

  image = new Image(32, 32);
  image.src = "./src/" + c.resDB.pipe.type + "/pipe/pipe-ending-down.png";
  c.resDB.pipe.enddown = image;

  image = new Image(32, 32);
  image.src = "./src/" + c.resDB.pipe.type + "/pipe/pipe-ending-left.png";
  c.resDB.pipe.endleft = image;

  image = new Image(32, 32);
  image.src = "./src/" + c.resDB.pipe.type + "/pipe/pipe-ending-right.png";
  c.resDB.pipe.endright = image;

  image = new Image(32, 32);
  image.src = "./src/" + c.resDB.pipe.type + "/pipe/pipe-t-right.png";
  c.resDB.pipe.tright = image;

  image = new Image(32, 32);
  image.src = "./src/" + c.resDB.pipe.type + "/pipe/pipe-t-left.png";
  c.resDB.pipe.tleft = image;

  image = new Image(32, 32);
  image.src = "./src/" + c.resDB.pipe.type + "/pipe/pipe-t-up.png";
  c.resDB.pipe.tup = image;

  image = new Image(32, 32);
  image.src = "./src/" + c.resDB.pipe.type + "/pipe/pipe-t-down.png";
  c.resDB.pipe.tdown = image;

  image = new Image(32, 32);
  image.src = "./src/" + c.resDB.pipe.type + "/pipe/pipe-corner-left-down.png";
  c.resDB.pipe.cld = image;

  image = new Image(32, 32);
  image.src = "./src/" + c.resDB.pipe.type + "/pipe/pipe-corner-left-up.png";
  c.resDB.pipe.clu = image;

  image = new Image(32, 32);
  image.src = "./src/" + c.resDB.pipe.type + "/pipe/pipe-corner-right-down.png";
  c.resDB.pipe.crd = image;

  image = new Image(32, 32);
  image.src = "./src/" + c.resDB.pipe.type + "/pipe/pipe-corner-right-up.png";
  c.resDB.pipe.cru = image;
}

db.mach = Pipe;
exports.Pipe = Pipe;
