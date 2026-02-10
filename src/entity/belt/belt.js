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

    this.isBelt = true

    const slotDefaults = { maxlen: 1, packsize: 1 }
    this.stack.INV = Inventory.normalizeStack(this.stack.INV, slotDefaults)
    this.stack.L = Inventory.normalizeStack(this.stack.L, slotDefaults)
    this.stack.R = Inventory.normalizeStack(this.stack.R, slotDefaults)
    this.stack.LA = Inventory.normalizeStack(this.stack.LA, slotDefaults)
    this.stack.LB = Inventory.normalizeStack(this.stack.LB, slotDefaults)
    this.stack.LC = Inventory.normalizeStack(this.stack.LC, slotDefaults)
    this.stack.LD = Inventory.normalizeStack(this.stack.LD, slotDefaults)
    this.stack.RA = Inventory.normalizeStack(this.stack.RA, slotDefaults)
    this.stack.RB = Inventory.normalizeStack(this.stack.RB, slotDefaults)
    this.stack.RC = Inventory.normalizeStack(this.stack.RC, slotDefaults)
    this.stack.RD = Inventory.normalizeStack(this.stack.RD, slotDefaults)
    this.setupDone = true
    this.decidingMoving = false
    this.movingParts = false
  }

  shift (from, itfrom, to, itto, deciding) {

    const fromSlot = from.stack[itfrom]
    const fromPack = fromSlot?.packs?.[0]
    if (fromPack?.id == null) {
      if (fromSlot) {
        fromSlot.moving = false
        fromSlot.reserved = false
      }
      return
    }
    let toSlot = to.stack[itto]
    if (toSlot == null) {
      toSlot = Inventory.createStack({ maxlen: 1, packsize: 1 })
      to.stack[itto] = toSlot
    }

    if (deciding) {
      if (toSlot?.reserved === true) {
        fromSlot.moving = false
        fromSlot.reserved = true
      } else {
        fromSlot.moving = true
        toSlot.reserved = true
      }
    } else {
      const toPack = toSlot.packs?.[0]
      if (fromSlot.moving && (toPack == null || toPack.id == null)) {
        toSlot.packs = [{ id: fromPack.id, n: fromPack.n }]
        toSlot.moving = false
        toSlot.reserved = false
        fromSlot.packs = []
        fromSlot.moving = false
        fromSlot.reserved = false
      }
    }
  }

  update (map, ent) {
    // sanity
    if (!this.setupDone) this.setup()

    // ITEM LAID ON BELT
    const invPack = this.stack.INV.packs[0]
    if (invPack?.id != null) {
      const targetSlot = this.stack.L.full ? this.stack.R : this.stack.L
      if (targetSlot) targetSlot.packs = [{ id: invPack.id, n: invPack.n ?? 1 }]
      this.stack.INV.packs = []
    }

    const leftPack = this.stack.L.packs[0]
    if (leftPack?.id != null) {
      if (this.stack.LA?.packs[0]?.id == null && this.stack.LA?.reserved === false) {
        this.stack.LA.packs = [{ id: leftPack.id, n: leftPack.n ?? 1 }]
      } else if (this.stack.LB?.packs[0]?.id == null && this.stack.LB?.reserved === false) {
        this.stack.LB.packs = [{ id: leftPack.id, n: leftPack.n ?? 1 }]
      } else if (this.stack.LC?.packs[0]?.id == null && this.stack.LC?.reserved === false) {
        this.stack.LC.packs = [{ id: leftPack.id, n: leftPack.n ?? 1 }]
      } else if (this.stack.LD?.packs[0]?.id == null && this.stack.LD?.reserved === false) {
        this.stack.LD.packs = [{ id: leftPack.id, n: leftPack.n ?? 1 }]
      }
      this.stack.L.packs = []
    }

    const rightPack = this.stack.R.packs[0]
    if (rightPack?.id != null) {
      if (this.stack.RA?.packs[0]?.id == null && this.stack.RA?.reserved === false) {
        this.stack.RA.packs = [{ id: rightPack.id, n: rightPack.n ?? 1 }]
      } else if (this.stack.RB?.packs[0]?.id == null && this.stack.RB?.reserved === false) {
        this.stack.RB.packs = [{ id: rightPack.id, n: rightPack.n ?? 1 }]
      } else if (this.stack.RC?.packs[0]?.id == null && this.stack.RC?.reserved === false) {
        this.stack.RC.packs = [{ id: rightPack.id, n: rightPack.n ?? 1 }]
      } else if (this.stack.RD?.packs[0]?.id == null && this.stack.RD?.reserved === false) {
        this.stack.RD.packs = [{ id: rightPack.id, n: rightPack.n ?? 1 }]
      }
      this.stack.R.packs = []
    }

    // BELTS SYSTEM
    this.movingParts = ((game.tick) % (16 / window.classDB[this.name].speed) === 0)

    // Do not update twice
    ent.done = true

    // DIRECT
    const nbPos = Settings.dirToVec[ent.dir]
    let beltFrom = game.entityLayer.getInv(ent.pos.x - nbPos.x, ent.pos.y - nbPos.y)
    if (beltFrom && (Math.abs(this.dir - beltFrom.dir) === 2 || beltFrom.isBelt === false)) beltFrom = undefined
    if (beltFrom) this.beltFromID = beltFrom.id

    // LEFT
    const nbLeft = Settings.dirToVec[(ent.dir + 1) % 4]
    let beltFromLeft = game.entityLayer.getInv(ent.pos.x - nbLeft.x, ent.pos.y - nbLeft.y)
    if (beltFromLeft && ((beltFromLeft.dir - ent.dir + 4) % 4 !== 1 || beltFromLeft.isBelt === false)) {
      beltFromLeft = undefined
    }
    if (beltFromLeft) this.beltFromLeftID = beltFromLeft.id

    // RIGHT
    const nbRight = Settings.dirToVec[(ent.dir + 3) % 4]
    let beltFromRight = game.entityLayer.getInv(ent.pos.x - nbRight.x, ent.pos.y - nbRight.y)
    if (beltFromRight && ((beltFromRight.dir - ent.dir + 4) % 4 !== 3 || beltFromRight.isBelt === false)) {
      beltFromRight = undefined
    }
    if (beltFromRight) this.beltFromRightID = beltFromRight.id
    
    for (let round = 0; round < 2; round++) {
      this.decidingMoving = (round == 1) // after shifted slot, decide where to move
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
        let beltTo = game.entityLayer.getInv(ent.pos.x + nbPos.x, ent.pos.y + nbPos.y)
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
            if (this.stack.LA?.packs[0]?.id) this.stack.LA.reserved = true; else this.stack.LA.reserved = false
          }
          if (this.stack.RA) {
            if (this.stack.RA?.packs[0]?.id) this.stack.RA.reserved = true; else this.stack.RA.reserved = false
          }
        }
        // SHIFT ON THE BELT
        this.shift(this, 'LB', this, 'LA', this.decidingMoving)
        this.shift(this, 'LC', this, 'LB', this.decidingMoving)
        this.shift(this, 'LD', this, 'LC', this.decidingMoving)
        this.shift(this, 'RB', this, 'RA', this.decidingMoving)
        this.shift(this, 'RC', this, 'RB', this.decidingMoving)
        this.shift(this, 'RD', this, 'RC', this.decidingMoving)

        if (this.stack.L == null) this.stack.L = Inventory.createStack({ maxlen: 1, packsize: 1 })
        if (this.stack.R == null) this.stack.R = Inventory.createStack({ maxlen: 1, packsize: 1 })
    
        this.stack.L.full = !!((this.stack.LA?.packs[0]?.id || this.stack.LA?.reserved) && (this.stack.LB?.packs[0]?.id || this.stack.LB?.reserved) && (this.stack.LC?.packs[0]?.id || this.stack.LC?.reserved) && (this.stack.LD?.packs[0]?.id || this.stack.LD?.reserved))
        this.stack.R.full = !!((this.stack.RA?.packs[0]?.id || this.stack.RA?.reserved) && (this.stack.RB?.packs[0]?.id || this.stack.RB?.reserved) && (this.stack.RC?.packs[0]?.id || this.stack.RC?.reserved) && (this.stack.RD?.packs[0]?.id || this.stack.RD?.reserved))
        this.stack.INV.full = (this.stack.L.full && this.stack.R.full)
      }
    }
    if (beltFrom && beltFrom.done === false) beltFrom.update(map, beltFrom)
    if (beltFromLeft && beltFromLeft.done === false) beltFromLeft.update(map, beltFromLeft)
    if (beltFromRight && beltFromRight.done === false) beltFromRight.update(map, beltFromRight)
  }

  drawItems (ctx) {
    const beltPos = (Math.round(game.tick) * window.classDB[this.name].speed / 2) % 8
    if (this.pos == null && this.stack == null) return
    ctx.save()
    ctx.translate((this.pos.x + 0.5) * Settings.tileSize, (this.pos.y + 0.5) * Settings.tileSize)
    ctx.rotate(this.dir * Math.PI / 2)
    ctx.translate(-Settings.tileSize / 2, -Settings.tileSize / 2)

    let pos = 0
    let xpos = 0.6
    const dx = -0.25
    const laPack = this.stack.LA.packs[0]
    if (laPack?.id) {
      if (this.stack.LA.moving) pos = beltPos
      else pos = 0
      ctx.drawImage(
        classDBi[laPack.id].img,
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

    const raPack = this.stack.RA.packs[0]
    if (raPack?.id) {
      if (this.stack.RA.moving) pos = beltPos
      else pos = 0
      ctx.drawImage(
        classDBi[raPack.id].img,
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
    const lbPack = this.stack.LB.packs[0]
    if (lbPack?.id) {
      if (this.stack.LB.moving) pos = beltPos
      else pos = 0
      ctx.drawImage(
        classDBi[lbPack.id].img,
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

    const rbPack = this.stack.RB.packs[0]
    if (rbPack?.id) {
      if (this.stack.RB.moving) pos = beltPos
      else pos = 0
      ctx.drawImage(
        classDBi[rbPack.id].img,
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
    const lcPack = this.stack.LC.packs[0]
    if (lcPack?.id) {
      if (this.stack.LC.moving) pos = beltPos
      else pos = 0
      ctx.drawImage(
        classDBi[lcPack.id].img,
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

    const rcPack = this.stack.RC.packs[0]
    if (rcPack?.id) {
      if (this.stack.RC.moving) pos = beltPos
      else pos = 0
      ctx.drawImage(
        classDBi[rcPack.id].img,
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
    const ldPack = this.stack.LD.packs[0]
    if (ldPack?.id) {
      if (this.stack.LD.moving) pos = beltPos
      else pos = 0
      ctx.drawImage(
        classDBi[ldPack.id].img,
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

    const rdPack = this.stack.RD.packs[0]
    if (rdPack?.id) {
      if (this.stack.RD.moving) pos = beltPos
      else pos = 0
      ctx.drawImage(
        classDBi[rdPack.id].img,
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
    const beltFrom = game.allInvs[this.beltFromID]
    const beltFromLeft = game.allInvs[this.beltFromLeftID]
    const beltFromRight = game.allInvs[this.beltFromRightID]
    if (beltFrom && beltFrom.drawItems && beltFrom.drawn < 2) beltFrom.drawItems(ctx)
    if (beltFromLeft && beltFromLeft.drawItems && beltFromLeft.drawn < 2) beltFromLeft.drawItems(ctx)
    if (beltFromRight && beltFromRight.drawItems && beltFromRight.drawn < 2) beltFromRight.drawItems(ctx)
  }
}
