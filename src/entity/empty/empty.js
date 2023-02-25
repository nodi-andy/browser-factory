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
    this.setup(undefined)
    this.name = "Empty"
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
    ctx.drawImage(Empty.img, 0, 0, Empty.size[0] * Settings.tileSize, Empty.size[1] * Settings.tileSize, 0, 0, Empty.size[0] * Settings.tileSize, Empty.size[1] * Settings.tileSize)
  }
}

Empty.img = new Image(512, 32)
Empty.img.src = './' + Empty.type + '/empty/empty.png'
