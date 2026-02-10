import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

export class RailCurved extends Inventory {
  constructor (pos, data) {
    super(pos, data)
    data.pos = pos
    this.setup(undefined, data)
  }

  update (map, ent) {

  }

  setup (map, ent) {
    if (this.stack == null) this.stack = {}
    this.stack.INV = Inventory.normalizeStack(this.stack.INV, { maxlen: 6 })
  }

  draw (ctx, ent) {
    const db = classDB.rail_curved
    ctx.drawImage(db.img, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize)
  }
}

const db = RailCurved
db.type = 'entity'
db.imgName = 'rail_curved'
db.size = [1, 1]
db.rotatable = false
db.cost = [{ id: "Wood", n: 4 }]
