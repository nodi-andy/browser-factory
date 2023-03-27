import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

export class Empty extends Inventory {
  static type = 'entity'
  static size = [1, 1]
  static rotatable = false
  static playerCanWalkOn = true
  static cost = []
  static img = new Image(512, 32)
  
  constructor (pos, data) {
    super(pos, data)
    this.setup(undefined)
    this.name = "Empty"
  }
  
  update (map, ent) {

  }

  setup (map, ent) {
    this.stack.INV = {maxlen: 4, packsize : 1, packs:[]}
  }
  
  draw (ctx, ent) {
    ctx.drawImage(Empty.img, 0, 0, Empty.size[0] * Settings.tileSize, Empty.size[1] * Settings.tileSize, 0, 0, Empty.size[0] * Settings.tileSize, Empty.size[1] * Settings.tileSize)
    // ITEMS ON GROUND
    const packs = this.stack.INV.packs
    if (packs) {
      ctx.scale(0.5, 0.5)

      for (let iitem = 0; iitem < packs.length; iitem++) {
        const item = packs[iitem]
        if (item.id !== undefined) {
          ctx.drawImage(classDBi[item.id].img, 0, 0)
          if (iitem !== 1) {
            ctx.translate(1.0 * Settings.tileSize, 0.0 * Settings.tileSize)
          } else {
            ctx.translate(-1.0 * Settings.tileSize, 1 * Settings.tileSize)
          }
        }
      }
      ctx.scale(2, 2)
    }
  }
}

Empty.img.src = './' + Empty.type + '/empty/empty.png'
