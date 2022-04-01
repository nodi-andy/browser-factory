if (typeof window === "undefined") {
  c = require("../../common");
  inventory = require("../../core/inventory");
}

class Belt extends Inventory{
  constructor(pos, data) {
    super(pos, data);
    this.setup(undefined, data);
  }

  setup(map, ent) {
    this.stacksize = 8;
    this.packsize = {};
    this.packsize.INV = 1;
    this.packsize.LD = 1;
    this.packsize.RD = 1;
    this.packsize.L = 1;
    this.packsize.R = 1;

    if (this.stack.LA == undefined) this.stack.LA = {n: 1};
    if (this.stack.LB == undefined) this.stack.LB = {n: 1};
    if (this.stack.LC == undefined) this.stack.LC = {n: 1};
    if (this.stack.LD == undefined) this.stack.LD = {n: 1};
    if (this.stack.RA == undefined) this.stack.RA = {n: 1};
    if (this.stack.RB == undefined) this.stack.RB = {n: 1};
    if (this.stack.RC == undefined) this.stack.RC = {n: 1};
    if (this.stack.RD == undefined) this.stack.RD = {n: 1};
  }

  shift(from, itfrom, to, itto, deciding) {
    //if (from.stack[itfrom] == undefined) return;
    if (from.stack[itfrom]?.id == undefined) {
      if (from.stack[itfrom]) {
        from.stack[itfrom].moving = false;
        from.stack[itfrom].reserved = false;
      }
      return;
    }
    if ( to.stack[itto]?.reserved == false || to.stack[itto]?.reserved == undefined || deciding == false)
    {
      if (deciding) {
        from.stack[itfrom].moving = true;
        to.stack[itto].reserved = true;
      } else {
        if (from.stack[itfrom].moving) {
          to.stack[itto] = from.stack[itfrom];
          to.stack[itto].moving = false;
          from.stack[itfrom] = {};
        }
      }
    } else {
      from.stack[itfrom].moving = false;
      from.stack[itfrom].reserved = true;
    }
  }

  update(map, ent, first = false) {
    ent.done = true;

    let movingParts = c.game.tick % 8 == 0;
    let decidingMoving = (c.game.tick - 1) % 8 == 0;


    if (movingParts || decidingMoving) {
      if (this.stack.L == undefined) this.stack.L = {n: 1};
      if (this.stack.R == undefined) this.stack.R = {n: 1};
      if (this.stack.LA == undefined) this.stack.LA = {n: 1};
      if (this.stack.LB == undefined) this.stack.LB = {n: 1};
      if (this.stack.LC == undefined) this.stack.LC = {n: 1};
      if (this.stack.LD == undefined) this.stack.LD = {n: 1};
      if (this.stack.RA == undefined) this.stack.RA = {n: 1};
      if (this.stack.RB == undefined) this.stack.RB = {n: 1};
      if (this.stack.RC == undefined) this.stack.RC = {n: 1};
      if (this.stack.RD == undefined) this.stack.RD = {n: 1};
      this.stack.LA.n = 1;
      this.stack.LB.n = 1;
      this.stack.LC.n = 1;
      this.stack.LD.n = 1;
      this.stack.RA.n = 1;
      this.stack.RB.n = 1;
      this.stack.RC.n = 1;
      this.stack.RD.n = 1;
      if (decidingMoving) {
        this.stack.LA.reserved = false;
        this.stack.LB.reserved = false;
        this.stack.LC.reserved = false;
        this.stack.LD.reserved = false;
        this.stack.RA.reserved = false;
        this.stack.RB.reserved = false;
        this.stack.RC.reserved = false;
        this.stack.RD.reserved = false;

        this.stack.LA.moving = false;
        this.stack.LB.moving = false;
        this.stack.LC.moving = false;
        this.stack.LD.moving = false;
        this.stack.RA.moving = false;
        this.stack.RB.moving = false;
        this.stack.RC.moving = false;
        this.stack.RD.moving = false;
      }


      let nbPos = c.dirToVec[ent.dir];
      let beltFrom = inventory.getInv(ent.pos.x - nbPos.x, ent.pos.y - nbPos.y);
      if (beltFrom && Math.abs(this.dir - beltFrom.dir) == 2)
        beltFrom = undefined;
      if (beltFrom == undefined) {
        // LEFT
        let nbLeft = c.dirToVec[(ent.dir + 1) % 4];
        let beltFromLeft = inventory.getInv(
          ent.pos.x - nbLeft.x,
          ent.pos.y - nbLeft.y
        );
        if (beltFromLeft && (beltFromLeft.dir - ent.dir + 4) % 4 != 1) {
          beltFromLeft = undefined;
        }

        // RIGHT
        let nbRight = c.dirToVec[(ent.dir + 3) % 4];
        let beltFromRight = inventory.getInv(
          ent.pos.x - nbRight.x,
          ent.pos.y - nbRight.y
        );
        if (beltFromRight && (beltFromRight.dir - ent.dir + 4) % 4 != 3) {
          beltFromRight = undefined;
        }

        if (beltFromLeft && beltFromRight) beltFrom = undefined;
        else {
          if (beltFromLeft) beltFrom = beltFromLeft;
          if (beltFromRight) beltFrom = beltFromRight;
        }
      }

      let beltTo = inventory.getInv(ent.pos.x + nbPos.x, ent.pos.y + nbPos.y);
      let invTo = inventory.getInv(ent.pos.x + nbPos.x, ent.pos.y + nbPos.y);
      if (this.stack.INV?.length && this.stack.L?.length == 0) {
        this.stack.LA = {id: this.stack.INV.id};
      }
      if (this.stack.L?.id) {
          if(this.stack.LA?.id == undefined && this.stack.LA.reserved == false) {
              this.stack.LA.id = this.stack.L.id;
          } else if (this.stack.LB?.id == undefined && this.stack.LB.reserved == false) {
              this.stack.LB.id = this.stack.L.id;
          } else if (this.stack.LC?.id == undefined && this.stack.LC.reserved == false) {
              this.stack.LC.id = this.stack.L.id;
          } else if (this.stack.LD?.id == undefined && this.stack.LD.reserved == false) {
              this.stack.LD.id = this.stack.L.id;
          }
          delete this.stack.L.id;
      }

      if (this.stack.R) {
          if(this.stack.RA?.id == undefined && this.stack.RA.reserved == false) {
              this.stack.RA.id = this.stack.R.id;
          }
          if (this.stack.RB?.id == undefined && this.stack.RB.reserved == false) {
              this.stack.RB.id = this.stack.R.id;
          }
          if (this.stack.RC?.id == undefined && this.stack.RC.reserved == false) {
              this.stack.RC.id = this.stack.R.id;
          }
          if (this.stack.RD?.id == undefined && this.stack.RD.reserved == false) {
              this.stack.RD.id = this.stack.R.id;
          }
          delete this.stack.R.id;
      }

      //SHIFT INTO NEXT BELT
      if (beltTo && beltTo.type != c.resDB.belt1.id) beltTo = undefined;
      if (beltTo) {
        let dAng = c.dirToAng[beltTo.dir] - c.dirToAng[this.dir];
        if (first == false) dAng = 0;
        if (dAng == 0) {
          this.shift(this, "LA", invTo, "LD", decidingMoving);
          this.shift(this, "RA", invTo, "RD", decidingMoving);
        } else if (dAng == -270 || dAng == 90) {
          this.shift(this, "LA", invTo, "RB", decidingMoving);
          this.shift(this, "RA", invTo, "RA", decidingMoving);
        } else if (dAng == 270 || dAng == -90) {
          this.shift(this, "LA", invTo, "LA", decidingMoving);
          this.shift(this, "RA", invTo, "LB", decidingMoving);
        }
      } else { // No next belt
        if (this.stack.LA) {
          if (this.stack.LA?.id) this.stack.LA.reserved = true; else this.stack.LA.reserved = false
        }
        if (this.stack.RA) {
          if (this.stack.RA?.id) this.stack.RA.reserved = true; else this.stack.RA.reserved = false
        }
      }
      // SHIFT ON THE BELT
      this.shift(this, "LB", this, "LA", decidingMoving);
      this.shift(this, "LC", this, "LB", decidingMoving);
      this.shift(this, "LD", this, "LC", decidingMoving);
      this.shift(this, "RB", this, "RA", decidingMoving);
      this.shift(this, "RC", this, "RB", decidingMoving);
      this.shift(this, "RD", this, "RC", decidingMoving);

      this.stack.L.full = !!((this.stack.LA.id || this.stack.LA.reserved) && (this.stack.LB.id || this.stack.LB.reserved)  && (this.stack.LC.id || this.stack.LC.reserved)  && (this.stack.LD.id || this.stack.LD.reserved));

      if (beltFrom && beltFrom.type != c.resDB.belt1.id) beltFrom = undefined;
      if (beltFrom && beltFrom.done == false) beltFrom.update(map, beltFrom);
    }
  }

  draw(ctx, ent) {
    let beltPos = Math.round(c.game.tick / 1) % 16;
    //console.log("B:", beltPos);
    ctx.drawImage(c.resDB.belt1.anim, 0, beltPos * 64, 64, 64, 0, 0, 64, 64);
  }

  drawItems(ctx, ent) {
    let beltPos = Math.round(c.game.tick / 1) % 8;
    if (ent.pos) {
      if (this.stack == undefined) return;
      let pos = 0;
      let xpos = 0.6;
      let dx = -0.25;
      if (this.stack.LA?.id) {
        if (this.stack.LA.moving) pos = beltPos;
        else pos = 0;
        ctx.drawImage(
          resName[this.stack.LA.id].img,
          0,
          0,
          64,
          64,
          pos * 2 + xpos * tileSize,
          0.1 * tileSize,
          32,
          32
        );
      }

      if (this.stack.RA?.id) {
        if (this.stack.RA.moving) pos = beltPos;
        else pos = 0;
        ctx.drawImage(
          resName[this.stack.RA.id].img,
          0,
          0,
          64,
          64,
          pos * 2 + xpos * tileSize,
          0.4 * tileSize,
          32,
          32
        );
      }
      xpos += dx;
      if (this.stack.LB?.id) {
        if (this.stack.LB.moving) pos = beltPos;
        else pos = 0;
        ctx.drawImage(
          resName[this.stack.LB.id].img,
          0,
          0,
          64,
          64,
          pos * 2 + xpos * tileSize,
          0.1 * tileSize,
          32,
          32
        );
      }

      if (this.stack.RB?.id) {
        if (this.stack.RB.moving) pos = beltPos;
        else pos = 0;
        ctx.drawImage(
          resName[this.stack.RB.id].img,
          0,
          0,
          64,
          64,
          pos * 2 + xpos * tileSize,
          0.4 * tileSize,
          32,
          32
        );
      }

      xpos += dx;
      if (this.stack.LC?.id) {
        if (this.stack.LC.moving) pos = beltPos;
        else pos = 0;
        ctx.drawImage(
          resName[this.stack.LC.id].img,
          0,
          0,
          64,
          64,
          pos * 2 + xpos * tileSize,
          0.1 * tileSize,
          32,
          32
        );
      }

      if (this.stack.RC?.id) {
        if (this.stack.RC.moving) pos = beltPos;
        else pos = 0;
        ctx.drawImage(
          resName[this.stack.RC.id].img,
          0,
          0,
          64,
          64,
          pos * 2 + xpos * tileSize,
          0.4 * tileSize,
          32,
          32
        );
      }

      xpos += dx;
      if (this.stack.LD?.id) {
        if (this.stack.LD.moving) pos = beltPos;
        else pos = 0;
        ctx.drawImage(
          resName[this.stack.LD.id].img,
          0,
          0,
          64,
          64,
          pos * 2 + xpos * tileSize,
          0.1 * tileSize,
          32,
          32
        );
      }

      if (this.stack.RD?.id) {
        if (this.stack.RD.moving) pos = beltPos;
        else pos = 0;
        ctx.drawImage(
          resName[this.stack.RD.id].img,
          0,
          0,
          64,
          64,
          pos * 2 + xpos * tileSize,
          0.4 * tileSize,
          32,
          32
        );
      }
    }
  }
}

db = c.resDB.belt1;
db.playerCanWalkOn = true;
db.size = [1, 1];
db.cost = [
  { id: c.resDB.iron_plate.id, n: 1 },
  { id: c.resDB.gear.id, n: 1 },
];
if (typeof Image !== "undefined") {
  const image = new Image(512, 32);
  image.src = "./src/" + c.resDB.belt1.type + "/belt1/belt1_anim.png";
  c.resDB.belt1.anim = image;
}
db.mach = Belt;
if (exports == undefined) var exports = {};
exports.Belt = Belt;
