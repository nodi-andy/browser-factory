import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

export class Boiler extends Inventory {
  constructor (pos, data) {
    super(pos, data)
    this.setup(undefined, data)
  }

  setup (map, ent) {
    this.stacksize = 8
    this.packsize = {}
    this.packsize.INV = 1
    this.packsize.FUEL = 1
    this.packsize.OUTPUT = 1
    this.energy = 0

    if (this.stack.FUEL == null) this.stack.FUEL = []
    if (this.stack.INV == null) this.stack.INV = [{ id: classDB.water.id, n: 0 }]
    if (this.stack.OUTPUT == null) this.stack.OUTPUT = [{ id: classDB.steam.id, n: 0 }]

    this.nbInputs = []
    this.nbOutputs = []
  }

  update (map, ent) {
    if (game.tick % 100) return

    if (this.stack.INV[0].n === 0) return

    if (this.stack.FUEL[0]?.n > 0 && this.energy <= 1) {
      this.energy += classDBi[this.stack.FUEL[0].id].E // add time factor
      this.stack.FUEL[0].n--
    }

    // INPUT
    let total = 0
    let nSameType = 1
    for (const nbID of this.nbInputs) {
      const n = game.allInvs[nbID]
      if (n == null) continue
      if (n.stack.INV[0].id == null) n.stack.INV[0].id = this.stack.INV[0].id
      if (n.stack.INV[0].id === this.stack.INV[0].id) {
        total += n.stack.INV[0].n
        nSameType++
      }
    }

    total += this.stack.INV[0].n
    let medVal = Math.floor(total / nSameType)

    for (const nbID of this.nbInputs) {
      const n = game.allInvs[nbID]
      if (n == null) continue
      if (n.stack.INV[0].id === this.stack.INV[0].id) {
        n.stack.INV[0].n = medVal
      }
    }
    let rest = total - (medVal * nSameType)
    this.stack.INV[0].n = medVal
    this.stack.INV[0].n += rest

    // PROCESS
    if (this.stack.INV[0].n > 0 && this.energy > 0 && this.stack.OUTPUT[0].n < 100) {
      this.energy--
      this.stack.INV[0].n--
      this.stack.OUTPUT[0].n++
    }

    // OUTPUT
    total = 0
    nSameType = 0
    for (const nbID of this.nbOutputs) {
      const n = game.allInvs[nbID]
      if (n == null) continue
      if (n.stack.INV[0].id == null) n.stack.INV[0].id = this.stack.OUTPUT[0].id
      if (n.stack.INV[0].id === this.stack.OUTPUT[0].id) {
        total += n.stack.INV[0].n
        nSameType++
      }
    }

    nSameType++
    total += this.stack.OUTPUT[0].n
    medVal = Math.floor(total / nSameType)

    for (const nbID of this.nbOutputs) {
      const n = game.allInvs[nbID]
      if (n == null) continue
      if (n.stack.INV[0].id === this.stack.OUTPUT[0].id) {
        n.stack.INV[0].n = medVal
      }
    }
    rest = total - (medVal * nSameType)
    this.stack.OUTPUT[0].n = medVal
    this.stack.OUTPUT[0].n += rest
  }

  updateNB () {
    this.nbInputs = []
    this.nbOutputs = []

    let nbPos = Settings.dirToVec[this.dir]
    let nb = game.entityLayer.getInv(this.pos.x - nbPos.x, this.pos.y - nbPos.y)
    if (nb?.type === classDB.pipe.id || nb?.type === classDB.generator.id) this.nbOutputs.push(nb.id)

    nb = game.entityLayer.getInv(this.pos.x + nbPos.x, this.pos.y + nbPos.y)
    if (nb?.type === classDB.pipe.id || nb?.type === classDB.generator.id) this.nbOutputs.push(nb.id)

    nbPos = Settings.dirToVec[(this.dir + 1) % 4]
    nb = game.entityLayer.getInv(this.pos.x - nbPos.x, this.pos.y - nbPos.y)
    if (nb?.type === classDB.pipe.id || nb?.type === classDB.boiler.id) this.nbInputs.push(nb.id)

    nb = game.entityLayer.getInv(this.pos.x + nbPos.x, this.pos.y + nbPos.y)
    if (nb?.type === classDB.pipe.id || nb?.type === classDB.boiler.id) this.nbInputs.push(nb.id)
  }

  draw (ctx, ent) {
    ctx.drawImage(classDB.boiler.img, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize)
  }

  drawItems (ctx) {
    if (this.pos && this.stack) {
      ctx.save()
      ctx.translate((this.pos.x + 0.5) * Settings.tileSize, (this.pos.y + 0.5) * Settings.tileSize)
      ctx.rotate(this.dir * Math.PI / 2)
      ctx.translate(-Settings.tileSize / 2, -Settings.tileSize / 2)
      ctx.restore()
    }
  }
}

const db = Boiler
db.playerCanWalkOn = false
db.type = 'entity'
db.size = [1, 1]
db.cost = [
  { id: "IronPlate", n: 1 }
]

if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './' + Boiler.type + '/boiler/boiler.png'
  Boiler.img = image
}
