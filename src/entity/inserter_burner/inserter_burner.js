import { Settings } from '../../common.js'
import { Inventory, invfuncs } from '../../core/inventory.js'

class InserterBurner extends Inventory {
  constructor (pos, data) {
    super(pos, data)
    data.pos = pos
    this.setup(undefined, data)
  }

  setup (map, ent) {
    if (ent.stack == null) ent.stack = {}
    ent.stacksize = 3
    if (ent.stack.FUEL == null) ent.stack.FUEL = []
    if (ent.stack.INPUT == null) ent.stack.INPUT = []
    if (ent.stack.INV == null) ent.stack.INV = []

    if (ent.packsize == null) ent.packsize = {}
    ent.packsize.INV = 1
    ent.packsize.INPUT = 1
    ent.packsize.FUEL = 1
    if (ent.armPos == null) ent.armPos = 0
    if (ent.energy == null) ent.energy = 10 // TBD: electricity
    if (ent.isHandFull == null) ent.isHandFull = false
  }

  update (map, ent) {
    this.setup(map, ent)
    ent.done = true
    if (ent.pos) {
      if (ent.stack.FUEL[0]?.n > 0 && ent.energy <= 2) {
        // TBD: don't use coal until electricity is developed
        // ent.energy += Settings.resName[ent.stack.FUEL[0].id].E // add time factor
        // ent.stack.FUEL[0].n--
        ent.energy = 10
      }
      ent.isHandFull = false
      if (ent.stack?.INV && ent.stack?.INV[0]?.n > 0) ent.isHandFull = true

      const myDir = Settings.dirToVec[ent.dir]

      if ((ent.isHandFull || ent.armPos > 0) && ent.state === 1) ent.armPos = (ent.armPos + 1) % 64

      const invFrom = invfuncs.getInv(ent.pos.x - myDir.x, ent.pos.y - myDir.y, true)
      const invTo = invfuncs.getInv(ent.pos.x + myDir.x, ent.pos.y + myDir.y, true)

      // LOAD COAL
      /* if (ent.armPos === 0 && !ent.isHandFull && ent.energy <= 0 && invFrom.hasItem(Settings.resDB.coal)) {
        invFrom.moveItemTo({ id: Settings.resDB.coal.id, n: 1 }, ent, 'FUEL')
      } else */
      // PICK
      if (ent.armPos === 0 && !ent.isHandFull && ent.energy > 0) {
        let item
        if (invFrom.stack.OUTPUT) {
          item = invFrom.getFirstPack('OUTPUT')
        } else if (invTo?.need?.length) {
          for (let ineed = 0; ineed < invTo.need.length; ineed++) {
            if (invFrom.hasItem(invTo.need[ineed])) {
              item = invTo.need[ineed]
              break
            }
          }
        } else item = invFrom.getFirstPack()

        if (item?.n && invFrom.moveItemTo({ id: item.id, n: 1 }, ent)) {
          ent.energy--
          ent.state = 1
        } else ent.state = 0
      // PLACE
      } else if (ent.armPos === 32 && ent.isHandFull) {
        if (invTo === undefined) {
          ent.state = 0
          return
        }
        let stackName

        // place onto belt
        if (invTo?.type === Settings.resDB.belt1.id) {
          const relDir = (invTo.dir - ent.dir + 3) % 4
          const dirPref = ['R', 'L', 'R', 'L']
          stackName = dirPref[relDir]
        // place into burner miner
        } else if (invTo?.type === Settings.resDB.burner_miner.id) {
          stackName = 'FUEL'

        // place into assembling machine
        } else {
          stackName = invTo.getStackName(ent.stack.INV[0].id)
        }

        if (invTo.hasPlaceFor(ent.stack.INV[0], stackName)) {
          ent.moveItemTo(ent.stack.INV[0], invTo, stackName)
          ent.state = 1
        } else { ent.state = 0 }
      // GO TO INITIAL POS
      } else if (ent.armPos !== 0 && !ent.isHandFull) {
        ent.state = 1
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
      if (this.isHandFull && this.stack?.INV[0]?.id) {
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
db.type = 'entity'
if (typeof Image !== 'undefined') {
  let image = new Image(64, 64)
  image.src = './src/' + Settings.resDB.inserter_burner.type + '/inserter_burner/inserter_platform.png'
  Settings.resDB.inserter_burner.platform = image
  image = new Image(64, 64)
  image.src = './src/' + Settings.resDB.inserter_burner.type + '/inserter_burner/inserter_burner_hand.png'
  Settings.resDB.inserter_burner.hand = image
}
db.mach = InserterBurner
db.cost = [{ id: Settings.resDB.iron_plate.id, n: 1 }, { id: Settings.resDB.gear.id, n: 1 }, { id: Settings.resDB.hydraulic_piston.id, n: 1 }]

export { InserterBurner }
