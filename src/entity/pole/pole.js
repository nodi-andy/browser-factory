import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

export class Pole extends Inventory {
  constructor (pos, data) {
    super(pos, data)
    this.setup(undefined, data)
  }

  setup (map, ent) {
    this.stacksize = 8
    this.stack.INV = Inventory.normalizeStack(this.stack.INV, { maxlen: 1, packsize: 1 })
    if (this.stack.INV.packs.length === 0) this.stack.INV.packs.push({ id: undefined, n: 0 })
    this.mapsize = { x: classDB.pole.size[0], y: classDB.pole.size[1] }
    this.nbInputs = []
  }

  update (map, ent) {
    if (game.tick % 100) return

    if (this.nbInputs.length === 0 || this.stack.INV.packs[0].n === 0) return

    // INPUT
    let total = 0
    let nSameType = 0
    for (const nbID of this.nbInputs) {
      const n = game.allInvs[nbID]
      if (n == null) continue
      let target = n.stack.INV || n.stack.FUEL
      if (!target?.packs?.length) target.packs = [{ id: undefined, n: 0 }]
      const targetPack = target.packs[0]
      if (targetPack.id == null) targetPack.id = this.stack.INV.packs[0].id
      if (targetPack.id === this.stack.INV.packs[0].id) {
        total += targetPack.n
        nSameType++
      }
    }
    nSameType++
    total += this.stack.INV.packs[0].n

    // PROCESS
    const medVal = Math.floor(total / nSameType)

    // OUTPUT
    for (const nbID of this.nbInputs) {
      const n = game.allInvs[nbID]
      if (n == null) continue
      let target = n.stack.INV || n.stack.FUEL
      if (!target?.packs?.length) target.packs = [{ id: undefined, n: 0 }]
      target.packs[0].n = medVal
    }
    this.stack.INV.packs[0].n = medVal
    const rest = total - (medVal * nSameType)
    this.stack.INV.packs[0].n += rest
  }

  updateNB () {
    this.nbInputs = []
    const radius = 3
    const scanArea = { x: this.pos.x - radius, y: this.pos.y - radius, x2: this.pos.x + this.mapsize.x + 2 * radius, y2: this.pos.y + this.mapsize.y + 2 * radius }
    for (let x = scanArea.x; x < scanArea.x2; x++) {
      for (let y = scanArea.y; y < scanArea.y2; y++) {
        const nb = game.entityLayer.getInv(x, y)
        if (nb?.id === this.id) continue
        if ((nb?.type === classDB.pole.id || nb?.type === classDB.generator.id || nb?.type === classDB.e_miner.id) && this.nbInputs.includes(nb.id) === false) this.nbInputs.push(nb.id)
      }
    }
  }

  drawItems (ctx) {
    const mapSize = classDB.pole.size
    const viewSize = classDB.pole.viewsize
    ctx.drawImage(classDB.pole.img, 0, 0, Settings.tileSize, Settings.tileSize, 0, -(viewSize[1] - mapSize[1]) * Settings.tileSize, viewSize[0] * Settings.tileSize, viewSize[1] * Settings.tileSize)
  }
}

const db = Pole
db.size = [1, 1]
db.type = 'entity'
db.viewsize = [1, 3]
db.cost = [
  { id: "IronPlate", n: 1 }
]

if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './' + db.type + '/pole/pole.png'
  db.img = image
}

db.type = 'entity'
