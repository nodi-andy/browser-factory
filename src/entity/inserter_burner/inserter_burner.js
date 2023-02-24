import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

export class InserterBurner extends Inventory {
  static size = [1, 1]
  static type = 'entity'
  static cost = [{ id: "IronPlate", n: 1 }, { id: "Gear", n: 1 }, { id: "HydraulicPiston", n: 1 }]
  static rotatable = true
  static imgName = 'inserter_burner'

  constructor (pos, data) {
    super(pos, data)
    data.pos = pos
    this.setup(undefined, data)
    this.name = "InserterBurner"
  }

  setup (map, ent) {
    if (this.stack == null) this.stack = {}
    this.stacksize = 3
    if (this.stack.FUEL == null) this.stack.FUEL = []
    if (this.stack.INPUT == null) this.stack.INPUT = []
    if (this.stack.INV == null) this.stack.INV = []

    if (this.packsize == null) this.packsize = {}
    this.packsize.INV = 1
    this.packsize.INPUT = 1
    this.packsize.FUEL = 1
    if (this.armPos == null) this.armPos = 0
    this.energy = 10 // TBD: electricity
    if (this.isHandFull == null) this.isHandFull = false
  }

  update (map, ent) {
    this.done = true
    if (this.pos) {
      if (this.stack.FUEL[0]?.n > 0 && this.energy <= 2) {
        // TBD: don't use coal until electricity is developed
        // this.energy += Settings.resName[this.stack.FUEL[0].id].E // add time factor
        // this.stack.FUEL[0].n--
        this.energy = 10
      }
      this.isHandFull = false
      if (this.stack?.INV && this.stack?.INV[0]?.n > 0) this.isHandFull = true

      const myDir = Settings.dirToVec[this.dir]

      if ((this.isHandFull || this.armPos > 0) && this.state === 1) this.armPos = (this.armPos + 1) % 64

      const invFrom = Inventory.getInv(this.pos.x - myDir.x, this.pos.y - myDir.y, true)
      const invTo = Inventory.getInv(this.pos.x + myDir.x, this.pos.y + myDir.y, true)

      // LOAD COAL
      /* if (this.armPos === 0 && !this.isHandFull && this.energy <= 0 && invFrom.hasItem(Settings.resDB.coal)) {
        invFrom.moveItemTo({ id: classDB.Coal.id, n: 1 }, ent, 'FUEL')
      } else */
      // PICK
      if (this.armPos === 0 && !this.isHandFull && this.energy > 0) {
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
          //this.energy--
          this.state = 1
        } else this.state = 0
      // PLACE
      } else if (this.armPos === 32 && this.isHandFull) {
        if (invTo == null) {
          this.state = 0
          return
        }
        let stackName

        // place onto belt
        if (invTo?.type === classDB.Belt1.id) {
          const relDir = (invTo.dir - this.dir + 3) % 4
          const dirPref = ['R', 'L', 'R', 'L']
          stackName = dirPref[relDir]
        // place into burner miner
        } else if (invTo?.type === classDB.InserterBurner.id) {
          stackName = 'FUEL'

        // place into assembling machine
        } else {
          stackName = invTo.getStackName(this.stack.INV[0].id)
        }

        if (invTo.hasPlaceFor(this.stack.INV[0], stackName)) {
          this.moveItemTo(this.stack.INV[0], invTo, stackName)
          this.state = 1
        } else { this.state = 0 }
      // GO TO INITIAL POS
      } else if (this.armPos !== 0 && !this.isHandFull) {
        this.state = 1
      }
    }
  }

  draw (ctx, ent) {
    ctx.drawImage(InserterBurner.platform, 0, 0, InserterBurner.size[0] * Settings.tileSize, InserterBurner.size[1] * Settings.tileSize, 0, 0, InserterBurner.size[0] * Settings.tileSize, InserterBurner.size[1] * Settings.tileSize)
  }

  drawItems (ctx) {
    ctx.save()

    if (this.pos) {
      ctx.translate(Settings.tileSize * 0.5, Settings.tileSize * 0.5)
      ctx.rotate(this.armPos * Math.PI / 32)
      ctx.drawImage(InserterBurner.hand, 0, 0, 64, 64, -48, -15, 64, 64)
      if (this.isHandFull && this.stack?.INV[0]?.id) {
        ctx.scale(0.5, 0.5)
        ctx.drawImage(Settings.resName[this.stack.INV[0].id].img, -96, -24)
        ctx.scale(2, 2)
      }
    }
    ctx.restore()
  }
}

if (typeof Image !== 'undefined') {
  let image = new Image(64, 64)
  image.src = './' + InserterBurner.type + '/inserter_burner/inserter_platform.png'
  InserterBurner.platform = image
  image = new Image(64, 64)
  image.src = './' + InserterBurner.type + '/inserter_burner/inserter_burner_hand.png'
  InserterBurner.hand = image
}
