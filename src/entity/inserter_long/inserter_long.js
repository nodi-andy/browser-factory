import { Settings } from "../../common.js"
import { Inserter } from "../inserter/inserter.js"

export class InserterLong extends Inserter {
  static size = [1, 1]
  static type = 'entity'
  static cost = [{ id: "IronPlate", n: 1 }, { id: "Gear", n: 1 }, { id: "HydraulicPiston", n: 1 }]
  static imgName = "inserter_long"
  static armLen = 2

  constructor (pos, data) {
    super(pos, data)
    data.pos = pos
    this.setup(undefined, data)
    this.name = 'InserterLong'
  }
  draw (ctx, ent) {
    ctx.drawImage(InserterLong.platform, 0, 0, InserterLong.size[0] * Settings.tileSize, InserterLong.size[1] * Settings.tileSize, 0, 0, InserterLong.size[0] * Settings.tileSize, InserterLong.size[1] * Settings.tileSize)
  }

  drawItems (ctx) {
    ctx.save()

    if (this.pos) {
      ctx.translate(Settings.tileSize * 0.5, Settings.tileSize * 0.5)
      ctx.rotate(this.armPos * Math.PI / 32)
      ctx.drawImage(InserterLong.hand, 0, 0, 120, 64, -110, -15, 120, 64)
      if (this.isHandFull && this.stack?.INV[0]?.id) {
        ctx.scale(0.5, 0.5)
        ctx.drawImage(classDBi[this.stack.INV[0].id].img, -192, -24)
        ctx.scale(2, 2)
      }
    }
    ctx.restore()
  }
}

InserterLong.platform = new Image(64, 64)
InserterLong.platform.src = './' + InserterLong.type + '/inserter_long/inserter_platform.png'
InserterLong.hand = new Image(64, 64)
InserterLong.hand.src = './' + InserterLong.type + '/inserter_long/inserter_long_hand.png'
