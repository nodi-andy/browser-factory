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
    this.speed = 2;
    
    if (this.stack.INV == undefined) this.stack.INV = {n: 1};
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
    this.setupDone = true;
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
        if (to.stack[itto]) to.stack[itto].reserved = true;
      } else {
        if (from.stack[itfrom].moving) {
          to.stack[itto] = from.stack[itfrom];
          to.stack[itto].moving = false;
          from.stack[itfrom] = {n: 1};
        }
      }
    } else {
      from.stack[itfrom].moving = false;
      from.stack[itfrom].reserved = true;
    }
  }

  update(map, ent) {
    // sanity
    if (!this.setupDone) this.setup();

    // Do not update twice
    ent.done = true;

    // Only update if necessary
    if (c.decidingMoving == false && c.movingParts == false) return;

    if (c.decidingMoving) {
      let keys = Object.keys(this.stack);
      for(let iStack = 0; iStack < keys.length; iStack++) {
        let key = keys[iStack];
        this.stack[key].reserved = false;
        this.stack[key].moving = false;
        this.stack[key].n = 1;
      }
    }

    // DIRECT
    let nbPos = c.dirToVec[ent.dir];
    let beltFrom = inventory.getInv(ent.pos.x - nbPos.x, ent.pos.y - nbPos.y);
    if (beltFrom && (Math.abs(this.dir - beltFrom.dir) == 2 || beltFrom.type != c.resDB.belt1.id)) beltFrom = undefined;
    if (beltFrom) this.beltFromID = beltFrom.id;

    // LEFT
    let nbLeft = c.dirToVec[(ent.dir + 1) % 4];
    let beltFromLeft = inventory.getInv(
      ent.pos.x - nbLeft.x,
      ent.pos.y - nbLeft.y
    );
    if (beltFromLeft && ((beltFromLeft.dir - ent.dir + 4) % 4 != 1 || beltFromLeft.type != c.resDB.belt1.id)) {
      beltFromLeft = undefined;
    }
    if (beltFromLeft) this.beltFromLeftID = beltFromLeft.id;

    // RIGHT
    let nbRight = c.dirToVec[(ent.dir + 3) % 4];
    let beltFromRight = inventory.getInv(
      ent.pos.x - nbRight.x,
      ent.pos.y - nbRight.y
    );
    if (beltFromRight && ((beltFromRight.dir - ent.dir + 4) % 4 != 3 || beltFromRight.type != c.resDB.belt1.id)) {
      beltFromRight = undefined;
    }
    if (beltFromRight) this.beltFromRightID = beltFromRight.id;
    
    // TO
    let beltTo = inventory.getInv(ent.pos.x + nbPos.x, ent.pos.y + nbPos.y);
    if (beltTo) this.beltToID = beltTo.id;
    if (this.stack.INV?.id && this.stack.L?.id == undefined) {
      this.stack.L = {id: this.stack.INV.id};
      this.stack.INV.id = undefined;
    }

    // SET BELT TYPE
    this.direct = true;
    if ((beltFromLeft || beltFromRight) && !(beltFromLeft && beltFromRight)) this.direct = false;
    if (beltFrom) this.direct = true;
    
    // ITEM LAID ON BELT
    if (this.stack.INV[0]?.id && !this.stack.L?.id) {
      this.stack.L.id = this.stack.INV[0].id;
      this.stack.INV.shift();
    }
    if (this.stack.INV[0]?.id && !this.stack.R?.id) {
      this.stack.R.id = this.stack.INV[0].id;
      this.stack.INV.shift();
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

    if (this.stack.R?.id) {
        if(this.stack.RA?.id == undefined && this.stack.RA.reserved == false) {
            this.stack.RA.id = this.stack.R.id;
        } else if (this.stack.RB?.id == undefined && this.stack.RB.reserved == false) {
            this.stack.RB.id = this.stack.R.id;
        } else if (this.stack.RC?.id == undefined && this.stack.RC.reserved == false) {
            this.stack.RC.id = this.stack.R.id;
        } else if (this.stack.RD?.id == undefined && this.stack.RD.reserved == false) {
            this.stack.RD.id = this.stack.R.id;
        }
        delete this.stack.R.id;
    }

    //SHIFT INTO NEXT BELT
    if (beltTo && beltTo.type != c.resDB.belt1.id) beltTo = undefined;
    if (beltTo) {
      let dAng = c.dirToAng[beltTo.dir] - c.dirToAng[this.dir];
      if (beltTo.direct == false) dAng = 0;
      if (dAng == 0) {
        this.shift(this, "LA", beltTo, "LD", c.decidingMoving);
        this.shift(this, "RA", beltTo, "RD", c.decidingMoving);
      } else if (dAng == -270 || dAng == 90) {
        this.shift(this, "LA", beltTo, "RB", c.decidingMoving);
        this.shift(this, "RA", beltTo, "RA", c.decidingMoving);
      } else if (dAng == 270 || dAng == -90) {
        this.shift(this, "LA", beltTo, "LA", c.decidingMoving);
        this.shift(this, "RA", beltTo, "LB", c.decidingMoving);
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
    this.shift(this, "LB", this, "LA", c.decidingMoving);
    this.shift(this, "LC", this, "LB", c.decidingMoving);
    this.shift(this, "LD", this, "LC", c.decidingMoving);
    this.shift(this, "RB", this, "RA", c.decidingMoving);
    this.shift(this, "RC", this, "RB", c.decidingMoving);
    this.shift(this, "RD", this, "RC", c.decidingMoving);

    this.stack.L.full = !!((this.stack.LA?.id || this.stack.LA?.reserved) && (this.stack.LB?.id || this.stack.LB?.reserved)  && (this.stack.LC?.id || this.stack.LC?.reserved)  && (this.stack.LD?.id || this.stack.LD?.reserved));
    this.stack.R.full = !!((this.stack.RA?.id || this.stack.RA?.reserved) && (this.stack.RB?.id || this.stack.RB?.reserved)  && (this.stack.RC?.id || this.stack.RC?.reserved)  && (this.stack.RD?.id || this.stack.RD?.reserved));

    if (beltFrom && beltFrom.done == false) beltFrom.update(map, beltFrom);
    if (beltFromLeft && beltFromLeft.done == false) beltFromLeft.update(map, beltFromLeft);
    if (beltFromRight && beltFromRight.done == false) beltFromRight.update(map, beltFromRight);
  }

  draw(ctx, ent) {
    let beltPos = Math.round(c.game.tick / 1) % 16;
    ctx.drawImage(c.resDB.belt1.anim, 0, beltPos * 64, 64, 64, 0, 0, 64, 64);
  }

  drawItems(ctx) {
    let beltPos = Math.round(c.game.tick / 1) % 8;
    if (this.pos && this.stack) {

      context.save();
      context.translate((this.pos.x + 0.5) * tileSize, (this.pos.y + 0.5) *tileSize);
      context.rotate(this.dir * Math.PI/2);
      context.translate(-tileSize / 2, -tileSize / 2);

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
      context.restore();
      this.drawn = 2; // set draw layer
      let beltFrom = c.allInvs[this.beltFromID];
      let beltFromLeft = c.allInvs[this.beltFromLeftID];
      let beltFromRight = c.allInvs[this.beltFromRightID];
      if (beltFrom && beltFrom.drawn < 2) beltFrom.drawItems(ctx);
      if (beltFromLeft && beltFromLeft.drawn < 2) beltFromLeft.drawItems(ctx);
      if (beltFromRight && beltFromRight.drawn < 2) beltFromRight.drawItems(ctx);
    }
  }
}

exports.Belt = Belt;
