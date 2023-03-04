import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

export class Chest extends Inventory {
  static type = 'entity'
  static size = [1, 1]
  static viewsize = [2, 2.5]
  static cost = [{ id: "Wood", n: 4 }]
  static rotatable = false
  static imgName = 'chest'

  constructor (pos, data) {
    super(pos, data)
    this.name = "Chest"
    data.pos = pos
    this.setup(undefined, data)
  }

  setup (map, ent) {
    if (this.stack == null) this.stack = {}
    if (this.stack.INV == null) this.stack.INV = []
    this.stack.INV.packsize = 4
  }

  draw (ctx, ent) {
    ctx.drawImage(Chest.img, 0, 0, Chest.size[0] * Settings.tileSize, Chest.size[1] * Settings.tileSize, 0, 0, Chest.size[0] * Settings.tileSize, Chest.size[1] * Settings.tileSize)
  }
}

if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './' + Chest.type + '/chest/chest.png'
  Chest.img = image
}
