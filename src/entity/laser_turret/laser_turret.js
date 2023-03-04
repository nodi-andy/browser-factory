import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

export class LaserTurret extends Inventory {
  static imgName = 'laser_turret'

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
  }

  draw (ctx, ent) {
    const db = classDB.laser_turret
    ctx.drawImage(db.img, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize)
  }
}

const db = LaserTurret
db.type = 'entity'

db.rotatable = false
db.cost = [{ id: "Wood", n: 4 }]

const image = new Image(512, 32)
image.src = './' + db.type + '/laser_turret/laser_turret.png'
db.img = image
