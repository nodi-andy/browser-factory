import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

class Empty extends Inventory {
  constructor (pos, data) {
    super(pos, data)
    data.pos = pos
    this.setup(undefined, data)
  }

  update (map, ent) {

  }

  setup (map, ent) {
    if (this.stack == null) this.stack = {}
    if (this.stack.INV == null) this.stack.INV = []
    this.stack.INV.size = 4
    this.itemsize = 1
  }

  draw (ctx, ent) {
    const db = Settings.resDB.empty
    ctx.drawImage(db.img, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize)
  }
}

const db = Settings.resDB.empty
db.name = 'empty'
db.type = 'entity'
db.size = [1, 1]
db.mach = Empty
db.rotatable = false
db.playerCanWalkOn = true
db.cost = []

if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './' + db.type + '/empty/empty.png'
  db.img = image
}
