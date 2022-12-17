import { Settings } from '../../common.js'
import { Inventory, invfuncs } from '../../core/inventory.js'

class InserterBurner extends Inventory {
  constructor (pos, data) {
    super(pos, data)
    data.pos = pos
    this.setup(undefined, data)
  }

  setup (map, ent) {
    this.stack = {}
    this.stack.INV = []
    this.stack.FUEL = []
    this.stacksize = 3
    this.packsize = {}
    this.packsize.INV = 1
    this.packsize.FUEL = 1
    this.armPos = 0
    this.energy = 0
  }

  update (map, ent) {
    if (this.stack.FUEL === undefined) this.stack.FUEL = []
    this.done = true
    if (this.pos) {
      if (this.stack.FUEL[0]?.n > 0 && this.energy <= 2) {
        this.energy += Settings.resName[this.stack.FUEL[0].id].E // add time factor
        this.stack.FUEL[0].n--
      }
      const isHandFull = this.stack?.INV[0]?.n > 0

      const myDir = Settings.dirToVec[this.dir]

      if ((isHandFull || this.armPos > 0) && this.state === 1) this.armPos = (this.armPos + 1) % 64

      const invFrom = invfuncs.getInv(ent.pos.x - myDir.x, ent.pos.y - myDir.y, true)
      const invTo = invfuncs.getInv(ent.pos.x + myDir.x, ent.pos.y + myDir.y, true)

      if (this.armPos === 0 && !isHandFull && this.energy <= 0 && invFrom.hasItem(Settings.resDB.coal.id)) { // LOAD COAL
        invFrom.moveItemTo({ id: Settings.resDB.coal.id, n: 1 }, this, 'FUEL')
      } else if (this.armPos === 0 && !isHandFull && this.energy > 0) { // PICK
        let item
        if (invFrom.stack.OUTPUT) { item = invFrom.getFirstPack('OUTPUT') } else if (invTo?.need?.length) {
          for (let ineed = 0; ineed < invTo.need.length; ineed++) {
            if (invFrom.hasItem(invTo.need[ineed])) {
              item = invTo.need[ineed]
              break
            }
          }
        } else item = invFrom.getFirstPack()

        if (item?.n && invFrom.moveItemTo({ id: item.id, n: 1 }, this)) {
          this.energy--
          this.state = 1
        } else this.state = 0
      } else if (this.armPos === 32 && isHandFull) { // PLACE
        if (invTo === undefined) return
        let stackName

        // place onto belt
        if (invTo.type === Settings.resDB.belt1.id) {
          const relDir = (invTo.dir - this.dir + 3) % 4
          const dirPref = ['R', 'L', 'R', 'L']
          stackName = dirPref[relDir]
        } else if (invTo.type === Settings.resDB.burner_miner.id) { // place into burner miner
          stackName = 'FUEL'
        } else { // place into assembling machine
          stackName = invTo.getStackName(this.stack.INV[0].id)
        }

        if (invTo.hasPlaceFor(this.stack.INV[0], stackName)) {
          this.moveItemTo(this.stack.INV[0], invTo, stackName)
          this.state = 1
        } else { this.state = 0 }
      }
    }
  }

  draw (ctx, ent) {
    const db = Settings.resDB.burner_miner
    ctx.drawImage(Settings.resDB.inserter_burner.platform, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize)
  }

  drawItems (ctx) {
    ctx.save()

    if (this.pos) {
      ctx.translate(Settings.tileSize * 0.5, Settings.tileSize * 0.5)
      ctx.rotate(this.armPos * Math.PI / 32)
      ctx.drawImage(Settings.resDB.inserter_burner.hand, 0, 0, 64, 64, -48, -15, 64, 64)
      if (this.stack?.INV[0]?.n && this.stack?.INV[0]?.id) {
        ctx.scale(0.5, 0.5)
        ctx.drawImage(Settings.resName[this.stack.INV[0].id].img, -96, -24)
        ctx.scale(2, 2)
      }
    }
    ctx.restore()
  }
}

const db = Settings.resDB.inserter_burner
db.size = [1, 1]
if (typeof Image !== 'undefined') {
  let image = new Image(64, 64)
  image.src = './src/' + Settings.resDB.inserter_burner.type + '/inserter_burner/inserter_platform.png'
  Settings.resDB.inserter_burner.platform = image
  image = new Image(64, 64)
  image.src = './src/' + Settings.resDB.inserter_burner.type + '/inserter_burner/inserter_burner_hand.png'
  Settings.resDB.inserter_burner.hand = image
}
db.Mach = InserterBurner
db.cost = [{ id: Settings.resDB.iron_plate.id, n: 1 }, { id: Settings.resDB.gear.id, n: 1 }, { id: Settings.resDB.hydraulic_piston.id, n: 1 }]

export { InserterBurner }
