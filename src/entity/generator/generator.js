import { Settings } from '../../common.js'
import { Inventory, invfuncs } from '../../core/inventory.js'

class Generator extends Inventory {
  constructor (pos, data) {
    super(pos, data)
    this.setup(undefined, data)
  }

  setup (map, ent) {
    this.stacksize = 8
    this.packsize = {}
    this.packsize.INV = 1
    this.packsize.OUTPUT = 1

    if (this.stack.INV === undefined) this.stack.INV = [{ id: Settings.resDB.steam.id, n: 0 }]
    if (this.stack.OUTPUT === undefined) this.stack.OUTPUT = [{ id: Settings.resDB.coulomb.id, n: 0 }]
    this.mapsize = { x: Settings.resDB.generator.size[0], y: Settings.resDB.generator.size[1] }
    if (this.dir === 1 || this.dir === 3) this.mapsize = { x: Settings.resDB.generator.size[1], y: Settings.resDB.generator.size[0] }
    for (let i = 0; i < this.mapsize.x; i++) {
      for (let j = 0; j < this.mapsize.y; j++) {
        invfuncs.setInv(ent.pos.x + i, ent.pos.y + j, this.id)
      }
    }
  }

  update (map, ent) {
    if (Settings.game.tick % 100) return

    // INPUT
    let total = 0
    let nSameType = 1
    for (const nbID of this.nbInputs) {
      const n = Settings.allInvs[nbID]
      if (n === undefined) continue
      if (n.stack.INV[0].id === undefined) n.stack.INV[0].id = this.stack.INV[0].id
      if (n.stack.INV[0].id === this.stack.INV[0].id) {
        total += n.stack.INV[0].n
        nSameType++
      }
    }

    total += this.stack.INV[0].n
    let medVal = Math.floor(total / nSameType)

    for (const nbID of this.nbInputs) {
      const n = Settings.allInvs[nbID]
      if (n === undefined) continue
      if (n.stack.INV[0].id === this.stack.INV[0].id) {
        n.stack.INV[0].n = medVal
      }
    }
    let rest = total - (medVal * nSameType)
    this.stack.INV[0].n = medVal
    this.stack.INV[0].n += rest

    // PROCESS
    if (this.stack.INV[0].n > 0 && this.stack.OUTPUT[0].n < 100) {
      this.stack.INV[0].n--
      this.stack.OUTPUT[0].n++
    }

    // OUTPUT
    total = 0
    nSameType = 0
    for (const nbID of this.nbOutputs) {
      const n = Settings.allInvs[nbID]
      if (n === undefined) continue
      if (n.stack.INV[0].id === undefined) n.stack.INV[0].id = this.stack.OUTPUT[0].id
      if (n.stack.INV[0].id === this.stack.OUTPUT[0].id) {
        total += n.stack.INV[0].n
        nSameType++
      }
    }

    nSameType++
    total += this.stack.OUTPUT[0].n
    medVal = Math.floor(total / nSameType)

    for (const nbID of this.nbOutputs) {
      const n = Settings.allInvs[nbID]
      if (n === undefined) continue
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

    const scanArea = { x: this.pos.x - 1, y: this.pos.y - 1, x2: this.pos.x + this.mapsize.x + 2, y2: this.pos.y + this.mapsize.y + 2 }
    for (let x = scanArea.x; x < scanArea.x2; x++) {
      for (let y = scanArea.y; y < scanArea.y2; y++) {
        const nb = invfuncs.getInv(x, y)
        if (nb?.id === this.id) continue
        if (nb?.type === Settings.resDB.boiler.id && this.nbInputs.includes(nb.id) === false) this.nbInputs.push(nb.id)
        if (nb?.type === Settings.resDB.pole.id && this.nbOutputs.includes(nb.id) === false) this.nbOutputs.push(nb.id)
      }
    }
  }

  draw (ctx, ent) {
    const mapSize = Settings.resDB.generator.size
    const viewSize = Settings.resDB.generator.viewsize
    ctx.drawImage(Settings.resDB.generator.img, 0, 0, mapSize[0] * Settings.tileSize / 2, mapSize[1] * Settings.tileSize / 2, 0, 0, viewSize[0] * Settings.tileSize, (mapSize[1] - viewSize[1]) * Settings.tileSize)
  }
}

const db = Settings.resDB.generator
db.name = 'generator'
db.type = 'entity'
db.lock = 1
db.playerCanWalkOn = false
db.size = [3, 1]
db.viewsize = [3, 2]
db.cost = [
  { id: Settings.resDB.iron_plate.id, n: 1 }
]

if (typeof Image !== 'undefined') {
  const image = new Image(960, 1120)
  image.src = './src/' + Settings.resDB.generator.type + '/generator/steam_generator_horizontal.png'
  Settings.resDB.generator.img = image
}

db.mach = Generator

export { Generator }
