import { Settings } from '../common.js'
import { Inventory } from '../core/inventory.js'

export class WorkshopBench extends Inventory {
  static type = 'entity'
  static size = [1, 1]
  static rotatable = false
  static playerCanWalkOn = false
  static cost = []

  constructor (pos, data = {}) {
    super(pos, data)
    this.name = 'WorkshopBench'
    this.setup(undefined, data || {})
  }

  setup (map, data = {}) {
    if (this.stack == null) this.stack = {}
    this.stack.INPUT = Inventory.normalizeStack(this.stack.INPUT, { maxlen: 8, packsize: 100 })
    this.stack.OUTPUT = Inventory.normalizeStack(this.stack.OUTPUT, { maxlen: 4, packsize: 100 })
    if (!Number.isFinite(this.progress)) this.progress = 0
    if (!Number.isFinite(this.progressMax)) this.progressMax = 24
  }

  getStackName (itemId) {
    const gearId = classDB?.Gear?.id
    if (itemId != null && gearId != null && itemId === gearId) return 'OUTPUT'
    return 'INPUT'
  }

  update () {
    const woodId = classDB?.Wood?.id
    const ironId = classDB?.IronPlate?.id
    const gearId = classDB?.Gear?.id
    if (woodId == null || ironId == null || gearId == null) return

    const hasWood = this.hasItem({ id: woodId, n: 1 })
    const hasIron = this.hasItem({ id: ironId, n: 1 })
    const hasOutput = this.hasPlaceFor({ id: gearId, n: 1 }, 'OUTPUT')
    if (!hasWood || !hasIron || !hasOutput) {
      this.progress = 0
      return
    }

    this.progress++
    if (this.progress < this.progressMax) return
    this.progress = 0
    this.remItem({ id: woodId, n: 1 }, 'INPUT')
    this.remItem({ id: ironId, n: 1 }, 'INPUT')
    this.addItem({ id: gearId, n: 1 }, 'OUTPUT')
  }

  draw (ctx) {
    ctx.fillStyle = '#202933'
    ctx.fillRect(2, 2, Settings.tileSize - 4, Settings.tileSize - 4)

    ctx.fillStyle = '#4d6a82'
    ctx.fillRect(8, 8, Settings.tileSize - 16, Settings.tileSize - 16)

    ctx.fillStyle = '#dbe4ef'
    ctx.fillRect(12, 14, Settings.tileSize - 24, 9)

    const pct = Math.max(0, Math.min(1, this.progress / this.progressMax))
    ctx.fillStyle = '#73c5ff'
    ctx.fillRect(12, Settings.tileSize - 14, Math.floor((Settings.tileSize - 24) * pct), 6)
  }

  drawItems (ctx) {
    const output = this.stack?.OUTPUT?.packs?.[0]
    if (!output || output.id == null || !classDBi?.[output.id]?.img) return
    ctx.drawImage(classDBi[output.id].img, 0, 0, 64, 64, Settings.tileSize * 0.3, Settings.tileSize * 0.3, 26, 26)
  }
}
