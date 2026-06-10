import { Settings } from '../common.js'
import { Inventory } from '../core/inventory.js'

function resolveSourceItem (value) {
  if (typeof value === 'number') return classDBi?.[value] || null
  if (typeof value === 'string') return classDB?.[value] || classDB?.[value.toLowerCase()] || null
  return null
}

export class InputUnit extends Inventory {
  static type = 'entity'
  static size = [1, 1]
  static rotatable = false
  static playerCanWalkOn = false
  static cost = []

  constructor (pos, data = {}) {
    super(pos, data)
    this.name = 'InputUnit'
    this.setup(undefined, data || {})
  }

  setup (map, data = {}) {
    if (this.stack == null) this.stack = {}

    const sourceClass = resolveSourceItem(data.sourceItem) || resolveSourceItem(this.sourceItem) || classDB?.Wood
    this.sourceItem = sourceClass?.name || 'Wood'
    this.sourceItemId = sourceClass?.id
    this.label = data.label || this.label || `${this.sourceItem} In`

    this.stack.OUTPUT = Inventory.normalizeStack(this.stack.OUTPUT, { maxlen: 1, packsize: 999999 })
    if (this.sourceItemId != null) {
      this.stack.OUTPUT.packs[0] = { id: this.sourceItemId, n: 999999 }
    }
  }

  hasPlaceFor () {
    return false
  }

  addItem () {
    return false
  }

  getItem (filterStack, filterItem) {
    const pack = this.stack?.OUTPUT?.packs?.[0]
    if (!pack || pack.id == null) return null
    if (filterItem != null && pack.id !== filterItem) return null
    return pack.id
  }

  remItem (removingItem, prefStackName, prefPackPos) {
    if (removingItem?.id == null) return false
    if (this.sourceItemId != null && removingItem.id === this.sourceItemId) return true
    return super.remItem(removingItem, prefStackName, prefPackPos)
  }

  draw (ctx) {
    const source = classDBi?.[this.sourceItemId]
    const isMetal = source?.name?.toLowerCase?.().includes('iron')
    const bodyColor = isMetal ? '#8a95a5' : '#a07a4f'
    const accentColor = isMetal ? '#d6dbe3' : '#dfc49a'

    ctx.fillStyle = '#1b1f24'
    ctx.fillRect(2, 2, Settings.tileSize - 4, Settings.tileSize - 4)

    ctx.fillStyle = bodyColor
    ctx.fillRect(8, 10, Settings.tileSize - 16, Settings.tileSize - 20)

    ctx.fillStyle = accentColor
    ctx.fillRect(12, 14, Settings.tileSize - 24, 9)

    ctx.fillStyle = '#11161d'
    ctx.fillRect(Settings.tileSize - 20, Settings.tileSize / 2 - 5, 10, 10)

    ctx.fillStyle = '#f2f5f9'
    ctx.font = 'bold 10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(source?.name?.slice(0, 1) || 'R', Settings.tileSize / 2, Settings.tileSize - 10)
  }
}
