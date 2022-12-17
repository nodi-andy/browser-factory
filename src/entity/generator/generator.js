if (typeof window === 'undefined') {
  c = require('../../common')
  inventory = require('../../core/inventory')
}

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

    if (this.stack.INV === undefined) this.stack.INV = [{ id: c.resDB.steam.id, n: 0 }]
    if (this.stack.OUTPUT === undefined) this.stack.OUTPUT = [{ id: c.resDB.coulomb.id, n: 0 }]
    this.mapsize = { x: c.resDB.generator.size[0], y: c.resDB.generator.size[1] }
    if (this.dir === 1 || this.dir === 3) this.mapsize = { x: c.resDB.generator.size[1], y: c.resDB.generator.size[0] }
    for (let i = 0; i < this.mapsize.x; i++) {
      for (let j = 0; j < this.mapsize.y; j++) {
        inventory.setInv(ent.pos.x + i, ent.pos.y + j, this.id)
      }
    }
  }

  update (map, ent) {
    if (c.game.tick % 100) return

    // INPUT
    let total = 0
    let nSameType = 1
    for (const nbID of this.nbInputs) {
      const n = c.allInvs[nbID]
      if (n == undefined) continue
      if (n.stack.INV[0].id == undefined) n.stack.INV[0].id = this.stack.INV[0].id
      if (n.stack.INV[0].id == this.stack.INV[0].id) {
        total += n.stack.INV[0].n
        nSameType++
      }
    }

    total += this.stack.INV[0].n
    let medVal = Math.floor(total / nSameType)

    for (const nbID of this.nbInputs) {
      const n = c.allInvs[nbID]
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
      const n = c.allInvs[nbID]
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
      const n = c.allInvs[nbID]
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
        const nb = inventory.getInv(x, y)
        if (nb?.id === this.id) continue
        if (nb?.type === c.resDB.boiler.id && this.nbInputs.includes(nb.id) === false) this.nbInputs.push(nb.id)
        if (nb?.type === c.resDB.pole.id && this.nbOutputs.includes(nb.id) === false) this.nbOutputs.push(nb.id)
      }
    }
  }

  draw (ctx, ent) {
    let generatorPos = Math.round(c.game.tick / 1) % 16;
    let db = c.resDB.generator;
    const mapSize = c.resDB.generator.size;
    const viewSize = c.resDB.generator.viewsize;
    ctx.drawImage(c.resDB.generator.img, 0, 0, mapSize[0] * tileSize / 2, mapSize[1] * tileSize / 2, 0, 0, viewSize[0] * tileSize, (mapSize[1] - viewSize[1]) * tileSize);
  }
}

db = c.resDB.generator
db.playerCanWalkOn = false
db.size = [3, 1]
db.viewsize = [3, 2]
db.cost = [
  { id: c.resDB.iron_plate.id, n: 1 }
]

if (typeof Image !== 'undefined') {
  let image = new Image(960, 1120)
  image.src = './src/' + c.resDB.generator.type + '/generator/steam_generator_horizontal.png'
  c.resDB.generator.img = image
}

db.mach = Generator
exports.Generator = Generator
