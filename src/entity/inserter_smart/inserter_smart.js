import { Settings } from "../../common.js"
import { Inserter } from "../inserter/inserter.js"

export class InserterSmart extends Inserter {
  static size = [1, 1]
  static type = 'entity'
  static cost = [{ id: "Inserter", n: 2 }, { id: "Gear", n: 1 }, { id: "HydraulicPiston", n: 1 }]
  static imgName = 'inserter_smart'

  constructor (pos, data) {
    super(pos, data)
    data.pos = pos
    this.setup(undefined, data)
    this.name = 'InserterSmart'
  }

  draw (ctx, ent) {
    ctx.drawImage(InserterSmart.platform, 0, 0, InserterSmart.size[0] * Settings.tileSize, InserterSmart.size[1] * Settings.tileSize, 0, 0, InserterSmart.size[0] * Settings.tileSize, InserterSmart.size[1] * Settings.tileSize)
  }

  drawItems (ctx) {
    ctx.save()

    if (this.pos) {
      ctx.translate(Settings.tileSize * 0.5, Settings.tileSize * 0.5)
      ctx.rotate(this.armPos * Math.PI / 32)
      ctx.drawImage(InserterSmart.hand, 0, 0, 64, 64, -48, -15, 64, 64)
      if (this.isHandFull && this.stack?.INV[0]?.id) {
        ctx.scale(0.5, 0.5)
        ctx.drawImage(classDBi[this.stack.INV[0].id].img, -96, -24)
        ctx.scale(2, 2)
      }
    }
    ctx.restore()
  }
}

InserterSmart.platform = new Image(64, 64)
InserterSmart.platform.src = './' + InserterSmart.type + '/inserter_smart/inserter_platform.png'
InserterSmart.hand = new Image(64, 64)
InserterSmart.hand.src = './' + InserterSmart.type + '/inserter_smart/inserter_smart_hand.png'
