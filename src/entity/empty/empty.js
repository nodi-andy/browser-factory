import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

export class Empty extends Inventory {
  static type = 'entity'
  static size = [1, 1]
  static rotatable = false
  static playerCanWalkOn = true
  static cost = []

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
    const db = Settings.resDB.Empty
    ctx.drawImage(db.img, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize)
  }
}



if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './' + Empty.type + '/empty/empty.png'
  Empty.img = image
}
