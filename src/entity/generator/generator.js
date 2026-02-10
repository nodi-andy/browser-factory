import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

export class Generator extends Inventory {
  constructor (pos, data) {
    super(pos, data)
    this.setup(undefined, data)
  }

  setup (map, ent) {
    this.stacksize = 8
    this.stack.INV = Inventory.normalizeStack(this.stack.INV, { maxlen: 1, packsize: 1 })
    this.stack.OUTPUT = Inventory.normalizeStack(this.stack.OUTPUT, { maxlen: 1, packsize: 1 })
    if (this.stack.INV.packs.length === 0) this.stack.INV.packs.push({ id: classDB.steam.id, n: 0 })
    if (this.stack.OUTPUT.packs.length === 0) this.stack.OUTPUT.packs.push({ id: classDB.coulomb.id, n: 0 })
    if (this.stack.INV.packs[0].id == null) this.stack.INV.packs[0].id = classDB.steam.id
    if (this.stack.OUTPUT.packs[0].id == null) this.stack.OUTPUT.packs[0].id = classDB.coulomb.id
    this.mapsize = { x: db.size[0], y: db.size[1] }
    if (this.dir === 1 || this.dir === 3) this.mapsize = { x: db.size[1], y: db.size[0] }
    for (let i = 0; i < this.mapsize.x; i++) {
      for (let j = 0; j < this.mapsize.y; j++) {
        game.entityLayer.getInv(ent.pos.x + i, ent.pos.y + j, this.id)
      }
    }
  }

  update (map, ent) {
    if (game.tick % 100) return

    // INPUT
    let total = 0
    let nSameType = 1
    for (const nbID of this.nbInputs) {
      const n = game.allInvs[nbID]
      if (n == null) continue
      if (n.stack.INV.packs[0].id == null) n.stack.INV.packs[0].id = this.stack.INV.packs[0].id
      if (n.stack.INV.packs[0].id === this.stack.INV.packs[0].id) {
        total += n.stack.INV.packs[0].n
        nSameType++
      }
    }

    total += this.stack.INV.packs[0].n
    let medVal = Math.floor(total / nSameType)

    for (const nbID of this.nbInputs) {
      const n = game.allInvs[nbID]
      if (n == null) continue
      if (n.stack.INV.packs[0].id === this.stack.INV.packs[0].id) {
        n.stack.INV.packs[0].n = medVal
      }
    }
    let rest = total - (medVal * nSameType)
    this.stack.INV.packs[0].n = medVal
    this.stack.INV.packs[0].n += rest

    // PROCESS
    if (this.stack.INV.packs[0].n > 0 && this.stack.OUTPUT.packs[0].n < 100) {
      this.stack.INV.packs[0].n--
      this.stack.OUTPUT.packs[0].n++
    }

    // OUTPUT
    total = 0
    nSameType = 0
    for (const nbID of this.nbOutputs) {
      const n = game.allInvs[nbID]
      if (n == null) continue
      if (n.stack.INV.packs[0].id == null) n.stack.INV.packs[0].id = this.stack.OUTPUT.packs[0].id
      if (n.stack.INV.packs[0].id === this.stack.OUTPUT.packs[0].id) {
        total += n.stack.INV.packs[0].n
        nSameType++
      }
    }

    nSameType++
    total += this.stack.OUTPUT.packs[0].n
    medVal = Math.floor(total / nSameType)

    for (const nbID of this.nbOutputs) {
      const n = game.allInvs[nbID]
      if (n == null) continue
      if (n.stack.INV.packs[0].id === this.stack.OUTPUT.packs[0].id) {
        n.stack.INV.packs[0].n = medVal
      }
    }
    rest = total - (medVal * nSameType)
    this.stack.OUTPUT.packs[0].n = medVal
    this.stack.OUTPUT.packs[0].n += rest
  }

  updateNB () {
    this.nbInputs = []
    this.nbOutputs = []

    const scanArea = { x: this.pos.x - 1, y: this.pos.y - 1, x2: this.pos.x + this.mapsize.x + 2, y2: this.pos.y + this.mapsize.y + 2 }
    for (let x = scanArea.x; x < scanArea.x2; x++) {
      for (let y = scanArea.y; y < scanArea.y2; y++) {
        const nb = game.entityLayer.getInv(x, y)
        if (nb?.id === this.id) continue
        if (nb?.type === classDB.boiler.id && this.nbInputs.includes(nb.id) === false) this.nbInputs.push(nb.id)
        if (nb?.type === classDB.pole.id && this.nbOutputs.includes(nb.id) === false) this.nbOutputs.push(nb.id)
      }
    }
  }

  draw (ctx, ent) {
    const mapSize = db.size
    const viewSize = db.viewsize
    ctx.drawImage(db.img, 0, 0, mapSize[0] * Settings.tileSize / 2, mapSize[1] * Settings.tileSize / 2, 0, 0, viewSize[0] * Settings.tileSize, (mapSize[1] - viewSize[1]) * Settings.tileSize)
  }
}

const db = Generator
db.type = 'entity'
db.playerCanWalkOn = false
db.size = [3, 1]
db.viewsize = [3, 2]
db.cost = [
  { id: "IronPlate", n: 1 }
]

if (typeof Image !== 'undefined') {
  const image = new Image(960, 1120)
  image.src = './' + Generator.type + '/generator/steam_generator_horizontal.png'
  Generator.img = image
}
