import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

export class Inserter extends Inventory {
  static size = [1, 1]
  static type = 'entity'
  static cost = [{ id: "IronPlate", n: 1 }, { id: "Gear", n: 1 }, { id: "HydraulicPiston", n: 1 }]
  static rotatable = true
  static imgName = 'inserter'
  static armLen = 1

  constructor (pos, data) {
    super(pos, data)
    data.pos = pos
    this.setup(undefined, data)
    this.name = "Inserter"
  }

  setup (map, ent) {
    if (this.stack == null) this.stack = {}
    this.stacksize = 3
    this.stack.FUEL = Inventory.normalizeStack(this.stack.FUEL, { maxlen: 1, packsize: 50 })
    this.stack.INV = Inventory.normalizeStack(this.stack.INV, { maxlen: 1, packsize: 1 })
    if (this.armPos == null) this.armPos = 0
    this.energy = 10 // TBD: electricity
    if (this.isHandFull == null) this.isHandFull = false
  }

  // Actuallly a filter
  setOutput(item) {
    this.selectedItem = item
  }
  update (map, ent) {
    this.done = true
    if (this.pos) {
      if (this.stack.FUEL.packs[0]?.n > 0 && this.energy <= 2) {
        // TBD: don't use coal until electricity is developed
        // this.energy += classDBi[this.stack.FUEL.packs[0].id].E // add time factor
        // this.stack.FUEL.packs[0].n--
        this.energy = 10
      }
      this.isHandFull = false
      if (this.stack?.INV && this.stack?.INV.packs[0]?.n > 0) this.isHandFull = true

      const myDir = Settings.dirToVec[this.dir]

      if ((this.isHandFull || this.armPos > 0) && this.state === 1) this.armPos = (this.armPos + 1) % 64

      const invFrom = game.entityLayer.getInv(this.pos.x - myDir.x * this.constructor.armLen, this.pos.y - myDir.y * this.constructor.armLen)
      const invTo = game.entityLayer.getInv(this.pos.x + myDir.x * this.constructor.armLen, this.pos.y + myDir.y * this.constructor.armLen, true)

      // LOAD COAL
      /* if (this.armPos === 0 && !this.isHandFull && this.energy <= 0 && invFrom.hasItem(classDB.coal)) {
        invFrom.moveItemTo({ id: classDB.Coal.id, n: 1 }, ent, 'FUEL')
      } else */

      // PICK
      if (this.armPos === 0 && !this.isHandFull && this.energy > 0 && invFrom) {
        let item
        const resolveStackName = (targetInv, itemId) => {
          if (!targetInv || itemId == null) return undefined
          if (typeof targetInv.getStackName === 'function') {
            const name = targetInv.getStackName(itemId)
            if (name != null) return name
          }
          if (targetInv.stack?.INPUT && targetInv.stack?.FUEL) {
            return classDBi[itemId]?.E ? 'FUEL' : 'INPUT'
          }
          return undefined
        }
        const pickForNeed = (needs) => {
          if (!Array.isArray(needs) || needs.length === 0) return null
          for (const needId of needs) {
            if (!invFrom.hasItem({ id: needId })) continue
            if (!invTo?.hasPlaceFor) return needId
            const stackName = resolveStackName(invTo, needId)
            if (invTo.hasPlaceFor({ id: needId, n: 1 }, stackName)) return needId
          }
          return null
        }
        // if picking for a producing machine, pick the needed part
        if (invTo?.need?.length) item = pickForNeed(invTo.need)
        // if picking for a producing machine, pick any usefull part
        if (item == null && invTo?.shallNeed?.length) item = pickForNeed(invTo.shallNeed)
        //If picking from a producing machine, pick the output
        if (item == null && invFrom.stack.OUTPUT) {
          item = invFrom.getItem('OUTPUT', this.selectedItem)
        }
        
        // Pick just a random item
        if (item == null && invFrom.stack.OUTPUT == null && invTo?.need == null && invTo?.preneed == null) item = invFrom.getItem(undefined, this.selectedItem)

        if (item && invFrom.moveItemTo({ id: item, n: 1 }, ent)) {
          //this.energy--
          this.state = 1
        } else {
          this.state = 0
        }
      // PLACE
      } else if (this.armPos === 32 && this.isHandFull) {
        if (invTo == null) {
          this.state = 0
          return
        }
        let stackName

        // place onto belt
        if (invTo?.isBelt) {
          const relDir = (invTo.dir - this.dir + 3) % 4
          const dirPref = ['L', 'L', 'R', 'L']
          stackName = dirPref[relDir]
        // place into burner miner
        } else if (invTo?.type === classDB.BurnerMiner.id) {
          stackName = 'FUEL'

        // place into assembling machine
        } else {
          stackName = invTo.getStackName(this.stack.INV.packs[0].id)
        }

        if (invTo.hasPlaceFor(this.stack.INV.packs[0], stackName)) {
          this.moveItemTo(this.stack.INV.packs[0], invTo, stackName)
          this.state = 1
        } else { this.state = 0 }
      // GO TO INITIAL POS
      } else if (this.armPos !== 0 && !this.isHandFull) {
        this.state = 1
      }
    }
  }

  draw (ctx, ent) {
    ctx.drawImage(Inserter.platform, 0, 0, Inserter.size[0] * Settings.tileSize, Inserter.size[1] * Settings.tileSize, 0, 0, Inserter.size[0] * Settings.tileSize, Inserter.size[1] * Settings.tileSize)
  }

  drawItems (ctx) {
    ctx.save()

    if (this.pos) {
      ctx.translate(Settings.tileSize * 0.5, Settings.tileSize * 0.5)
      ctx.rotate(this.armPos * Math.PI / 32)
      ctx.drawImage(Inserter.hand, 0, 0, 64, 64, -48, -15, 64, 64)
      if (this.isHandFull && this.stack?.INV.packs[0]?.id) {
        ctx.scale(0.5, 0.5)
        ctx.drawImage(classDBi[this.stack.INV.packs[0].id].img, -96, -24)
        ctx.scale(2, 2)
      }
    }
    ctx.restore()
  }
}

Inserter.platform = new Image(64, 64)
Inserter.platform.src = './' + Inserter.type + '/inserter/inserter_platform.png'
Inserter.hand = new Image(64, 64)
Inserter.hand.src = './' + Inserter.type + '/inserter/inserter_hand.png'
