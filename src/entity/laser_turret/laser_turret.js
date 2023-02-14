import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

class LaserTurret extends Inventory {
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
    this.stack.INV.size = 6
    this.itemsize = 50
  }

  draw (ctx, ent) {
    const db = Settings.resDB.laser_turret
    ctx.drawImage(db.img, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize)
  }
}

const db = Settings.resDB.laser_turret
db.type = 'entity'
db.name = 'laser turret'
db.size = [1, 1]
db.lock = 1
db.mach = LaserTurret
db.rotatable = false
db.cost = [{ id: Settings.resDB.wood.id, n: 4 }]

if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './src/' + db.type + '/laser_turret/laser_turret.png'
  db.img = image
}
