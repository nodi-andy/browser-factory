import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

export class Belt extends Inventory {
  static rotatable = true
  static speed = 2
  constructor (pos, data) {
    super(pos, data)
    this.setup(undefined, data)
  }

  setup (map, ent) {
    this.stacksize = 8
    this.packsize = {}
    this.packsize.INV = 1
    this.packsize.LD = 1
    this.packsize.RD = 1
    this.packsize.L = 1
    this.packsize.R = 1

    this.isBelt = true

    if (this.stack.INV == null) this.stack.INV = { n: 1 }
    if (this.stack.L == null) this.stack.L = { n: 1 }
    if (this.stack.R == null) this.stack.R = { n: 1 }
    if (this.stack.LA == null) this.stack.LA = { n: 1 }
    if (this.stack.LB == null) this.stack.LB = { n: 1 }
    if (this.stack.LC == null) this.stack.LC = { n: 1 }
    if (this.stack.LD == null) this.stack.LD = { n: 1 }
    if (this.stack.RA == null) this.stack.RA = { n: 1 }
    if (this.stack.RB == null) this.stack.RB = { n: 1 }
    if (this.stack.RC == null) this.stack.RC = { n: 1 }
    if (this.stack.RD == null) this.stack.RD = { n: 1 }
    this.setupDone = true
    this.decidingMoving = false
    this.movingParts = false
  }

  shift (from, itfrom, to, itto, deciding) {

    if (from.stack[itfrom]?.id == null) {
      if (from.stack[itfrom]) {
        from.stack[itfrom].moving = false
        from.stack[itfrom].reserved = false
      }
      return
    }
    let toPos = to.stack[itto]
    if (toPos == null) toPos = {n: 1}

    if ( deciding ) {
      if ( toPos?.reserved === true) {
        from.stack[itfrom].moving = false
        from.stack[itfrom].reserved = true
      } else {
        from.stack[itfrom].moving = true
        toPos.reserved = true
      }
    }
    else {
      
      if (from.stack[itfrom].moving && toPos.id == null) {
        to.stack[itto] = from.stack[itfrom]
        to.stack[itto].moving = false
        to.stack[itto].reserved = false
        from.stack[itfrom] = {n: 1}
      }
      
    } 
  }

  update (map, ent) {
    // sanity
    if (!this.setupDone) this.setup()

    // ITEM LAID ON BELT
    if (this.stack.INV?.id) {
      if (this.stack.L.full) this.stack.R = { id: this.stack.INV.id, n: 1 }
      else this.stack.L = { id: this.stack.INV.id, n:1 }
      delete this.stack.INV.id
    }

    if (this.stack.L?.id) {
      if (this.stack.LA?.id == null && this.stack.LA?.reserved === false) {
        this.stack.LA.id = this.stack.L.id
      } else if (this.stack.LB?.id == null && this.stack.LB?.reserved === false) {
        this.stack.LB.id = this.stack.L.id
      } else if (this.stack.LC?.id == null && this.stack.LC?.reserved === false) {
        this.stack.LC.id = this.stack.L.id
      } else if (this.stack.LD?.id == null && this.stack.LD?.reserved === false) {
        this.stack.LD.id = this.stack.L.id
      }
      delete this.stack.L.id
    }

    if (this.stack.R?.id) {
      if (this.stack.RA?.id == null && this.stack.RA?.reserved === false) {
        this.stack.RA.id = this.stack.R.id
      } else if (this.stack.RB?.id == null && this.stack.RB?.reserved === false) {
        this.stack.RB.id = this.stack.R.id
      } else if (this.stack.RC?.id == null && this.stack.RC?.reserved === false) {
        this.stack.RC.id = this.stack.R.id
      } else if (this.stack.RD?.id == null && this.stack.RD?.reserved === false) {
        this.stack.RD.id = this.stack.R.id
      }
      delete this.stack.R.id
    }

    // BELTS SYSTEM
    this.decidingMoving = ((window.game.tick + 0) % (16 / window.classDB[this.name].speed) === 0)
    this.movingParts = ((window.game.tick + 1) % (16 / window.classDB[this.name].speed) === 0)

    // Do not update twice
    ent.done = true

    // DIRECT
    const nbPos = Settings.dirToVec[ent.dir]
    let beltFrom = window.game.entityLayer.getInv(ent.pos.x - nbPos.x, ent.pos.y - nbPos.y)
    if (beltFrom && (Math.abs(this.dir - beltFrom.dir) === 2 || beltFrom.isBelt === false)) beltFrom = undefined
    if (beltFrom) this.beltFromID = beltFrom.id

    // LEFT
    const nbLeft = Settings.dirToVec[(ent.dir + 1) % 4]
    let beltFromLeft = window.game.entityLayer.getInv(ent.pos.x - nbLeft.x, ent.pos.y - nbLeft.y)
    if (beltFromLeft && ((beltFromLeft.dir - ent.dir + 4) % 4 !== 1 || beltFromLeft.isBelt === false)) {
      beltFromLeft = undefined
    }
    if (beltFromLeft) this.beltFromLeftID = beltFromLeft.id

    // RIGHT
    const nbRight = Settings.dirToVec[(ent.dir + 3) % 4]
    let beltFromRight = window.game.entityLayer.getInv(ent.pos.x - nbRight.x, ent.pos.y - nbRight.y)
    if (beltFromRight && ((beltFromRight.dir - ent.dir + 4) % 4 !== 3 || beltFromRight.isBelt === false)) {
      beltFromRight = undefined
    }
    if (beltFromRight) this.beltFromRightID = beltFromRight.id
    
    // Only update if necessary
    if (this.decidingMoving || this.movingParts ) {

      if (this.decidingMoving) {
        const keys = Object.keys(this.stack)
        for (let iStack = 0; iStack < keys.length; iStack++) {
          const key = keys[iStack]
          this.stack[key].reserved = false
          this.stack[key].moving = false
        }
      }

      // TO
      let beltTo = window.game.entityLayer.getInv(ent.pos.x + nbPos.x, ent.pos.y + nbPos.y)
      if (beltTo && beltTo.isBelt === false) beltTo = undefined
      if (beltTo) this.beltToID = beltTo.id


      // SET BELT TYPE
      this.direct = true
      if ((beltFromLeft || beltFromRight) && !(beltFromLeft && beltFromRight)) this.direct = false
      if (beltFrom) this.direct = true


      // SHIFT INTO NEXT BELT
      if (beltTo) {
        let dAng = Settings.dirToAng[beltTo.dir] - Settings.dirToAng[this.dir]
        if (beltTo.direct === false) dAng = 0
        if (dAng === 0) {
          this.shift(this, 'LA', beltTo, 'LD', this.decidingMoving)
          this.shift(this, 'RA', beltTo, 'RD', this.decidingMoving)
        } else if (dAng === -270 || dAng === 90) {
          this.shift(this, 'LA', beltTo, 'RB', this.decidingMoving)
          this.shift(this, 'RA', beltTo, 'RA', this.decidingMoving)
        } else if (dAng === 270 || dAng === -90) {
          this.shift(this, 'LA', beltTo, 'LA', this.decidingMoving)
          this.shift(this, 'RA', beltTo, 'LB', this.decidingMoving)
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
      this.shift(this, 'LB', this, 'LA', this.decidingMoving)
      this.shift(this, 'LC', this, 'LB', this.decidingMoving)
      this.shift(this, 'LD', this, 'LC', this.decidingMoving)
      this.shift(this, 'RB', this, 'RA', this.decidingMoving)
      this.shift(this, 'RC', this, 'RB', this.decidingMoving)
      this.shift(this, 'RD', this, 'RC', this.decidingMoving)

      if (this.stack.L == null) this.stack.L = { n: 1 }
      if (this.stack.R == null) this.stack.R = { n: 1 }
  
      this.stack.L.full = !!((this.stack.LA?.id || this.stack.LA?.reserved) && (this.stack.LB?.id || this.stack.LB?.reserved) && (this.stack.LC?.id || this.stack.LC?.reserved) && (this.stack.LD?.id || this.stack.LD?.reserved))
      this.stack.R.full = !!((this.stack.RA?.id || this.stack.RA?.reserved) && (this.stack.RB?.id || this.stack.RB?.reserved) && (this.stack.RC?.id || this.stack.RC?.reserved) && (this.stack.RD?.id || this.stack.RD?.reserved))
      this.stack.INV.full = (this.stack.L.full && this.stack.R.full)
    }
    if (beltFrom && beltFrom.done === false) beltFrom.update(map, beltFrom)
    if (beltFromLeft && beltFromLeft.done === false) beltFromLeft.update(map, beltFromLeft)
    if (beltFromRight && beltFromRight.done === false) beltFromRight.update(map, beltFromRight)
  }

  drawItems (ctx) {
    const beltPos = (Math.round(window.game.tick) * window.classDB[this.name].speed / 2) % 8
    if (this.pos == null && this.stack == null) return
    ctx.save()
    ctx.translate((this.pos.x + 0.5) * Settings.tileSize, (this.pos.y + 0.5) * Settings.tileSize)
    ctx.rotate(this.dir * Math.PI / 2)
    ctx.translate(-Settings.tileSize / 2, -Settings.tileSize / 2)

    let pos = 0
    let xpos = 0.6
    const dx = -0.25
    if (this.stack.LA?.id) {
      if (this.stack.LA.moving) pos = beltPos
      else pos = 0
      ctx.drawImage(
        Settings.resName[this.stack.LA.id].img,
        0,
        0,
        64,
        64,
        pos * 2 + xpos * Settings.tileSize,
        0.1 * Settings.tileSize,
        32,
        32
      )
    }

    if (this.stack.RA?.id) {
      if (this.stack.RA.moving) pos = beltPos
      else pos = 0
      ctx.drawImage(
        Settings.resName[this.stack.RA.id].img,
        0,
        0,
        64,
        64,
        pos * 2 + xpos * Settings.tileSize,
        0.4 * Settings.tileSize,
        32,
        32
      )
    }

    xpos += dx
    if (this.stack.LB?.id) {
      if (this.stack.LB.moving) pos = beltPos
      else pos = 0
      ctx.drawImage(
        Settings.resName[this.stack.LB.id].img,
        0,
        0,
        64,
        64,
        pos * 2 + xpos * Settings.tileSize,
        0.1 * Settings.tileSize,
        32,
        32
      )
    }

    if (this.stack.RB?.id) {
      if (this.stack.RB.moving) pos = beltPos
      else pos = 0
      ctx.drawImage(
        Settings.resName[this.stack.RB.id].img,
        0,
        0,
        64,
        64,
        pos * 2 + xpos * Settings.tileSize,
        0.4 * Settings.tileSize,
        32,
        32
      )
    }

    xpos += dx
    if (this.stack.LC?.id) {
      if (this.stack.LC.moving) pos = beltPos
      else pos = 0
      ctx.drawImage(
        Settings.resName[this.stack.LC.id].img,
        0,
        0,
        64,
        64,
        pos * 2 + xpos * Settings.tileSize,
        0.1 * Settings.tileSize,
        32,
        32
      )
    }

    if (this.stack.RC?.id) {
      if (this.stack.RC.moving) pos = beltPos
      else pos = 0
      ctx.drawImage(
        Settings.resName[this.stack.RC.id].img,
        0,
        0,
        64,
        64,
        pos * 2 + xpos * Settings.tileSize,
        0.4 * Settings.tileSize,
        32,
        32
      )
    }

    xpos += dx
    if (this.stack.LD?.id) {
      if (this.stack.LD.moving) pos = beltPos
      else pos = 0
      ctx.drawImage(
        Settings.resName[this.stack.LD.id].img,
        0,
        0,
        64,
        64,
        pos * 2 + xpos * Settings.tileSize,
        0.1 * Settings.tileSize,
        32,
        32
      )
    }

    if (this.stack.RD?.id) {
      if (this.stack.RD.moving) pos = beltPos
      else pos = 0
      ctx.drawImage(
        Settings.resName[this.stack.RD.id].img,
        0,
        0,
        64,
        64,
        pos * 2 + xpos * Settings.tileSize,
        0.4 * Settings.tileSize,
        32,
        32
      )
    }
    ctx.restore()
    this.drawn = 2 // set draw layer
    const beltFrom = window.game.allInvs[this.beltFromID]
    const beltFromLeft = window.game.allInvs[this.beltFromLeftID]
    const beltFromRight = window.game.allInvs[this.beltFromRightID]
    if (beltFrom && beltFrom.drawItems && beltFrom.drawn < 2) beltFrom.drawItems(ctx)
    if (beltFromLeft && beltFromLeft.drawItems && beltFromLeft.drawn < 2) beltFromLeft.drawItems(ctx)
    if (beltFromRight && beltFromRight.drawItems && beltFromRight.drawn < 2) beltFromRight.drawItems(ctx)
  }
}
