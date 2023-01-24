import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

class Rail extends Inventory {
  constructor (pos, data) {
    super(pos, data)
    data.pos = pos
    this.setup(undefined, data)
  }

  update (map, ent) {

  }

  setup (map, ent) {
    if (this.stack === undefined) this.stack = {}
    if (this.stack.INV === undefined) this.stack.INV = []
    this.stack.INV.size = 6
    this.itemsize = 50
  }

  draw (ctx, ent) {
    const db = Settings.resDB.rail
    ctx.drawImage(db.img, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize)
  }
}

const db = Settings.resDB.rail
db.name = 'rail'
db.type = 'entity'
db.lock = 1
db.size = [1, 1]
db.mach = Rail
db.rotatable = false
db.cost = [{ id: Settings.resDB.wood.id, n: 4 }]

if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './src/' + db.type + '/rail/rail.png'
  db.img = image
}
