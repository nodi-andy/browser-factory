import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

export class AssemblingMachine extends Inventory {
  static type = 'entity'
  static size = [3, 3]
  static imgName = 'assembling_machine'
  static P = 2
  
  constructor (pos, data) {
    super(data.pos, data)
    data.pos = pos
    this.name = "AssemblingMachine"

    for (let i = 0; i < this.constructor.size[0]; i++) {
      for (let j = 0; j < this.constructor.size[1]; j++) {
        game.entityLayer.setInv(pos.x + i, pos.y + j, this.id)
      }
    }

    this.stacksize = 4
    this.state = 0
    this.lastTime = performance.now()
    this.energy = 0
    this.setOutput(data.selectedItem)
    if (this.selectedItem == null) this.selectedItem = classDB['Empty'].id
  }

  setOutput (out, transferInputToPlayer = true) {
    this.selectedItem = out
    if (this.stack && transferInputToPlayer) {
      for (const key of Object.keys(this.stack)) {
        if (key === 'PROD') continue
        const stack = this.stack[key]
        if (stack?.packs?.length) {
          stack.packs.forEach(pack => {
            if (pack?.id != null && pack.n > 0) window.player?.addItem({ id: pack.id, n: pack.n })
          })
        }
        delete this.stack[key]
      }
    }
    if (this.selectedItem == null) return
    const cost = classDBi[this.selectedItem].cost
    if (this.stack == null && this.inv.stack) this.stack = this.inv.stack
    if (this.stack == null) this.stack = {}
    this.stack.OUTPUT = Inventory.normalizeStack(this.stack.OUTPUT, { maxlen: 1, packsize: 50 })
    this.stack.OUTPUT.allow = { [this.selectedItem]: 1 }

    for (let icost = 0; icost < cost.length; icost++) {
      const item = cost[icost]
      const name = classDBi[item.id].name
      this.stack[name] = Inventory.normalizeStack(this.stack[name], { maxlen: 1, packsize: 50 })
      this.stack[name].allow = { [item.id]: 1 }
    }
  }

  update (map, invThis) {
    if (this.selectedItem == null) return
    this.need = []
    this.shallNeed = []
    let cost = classDBi[this.selectedItem].cost
    this.preneed = JSON.parse(JSON.stringify(cost))

    if (this.energy <= 0) this.energy += 1000 // free energy

    for (let costItemID of Object.keys(this.preneed)) {
      const costItem = this.preneed[costItemID]
      const existing = this.getNumberOfItems(costItem.id)
      if (existing < costItem.n) {
        this.need.push(costItem.id)
      }
      if (existing < 50) {
        this.shallNeed.push(costItem.id)
      }
    }

    if (invThis.need.length == 0 && this.energy) {
      if (invThis.state === 0) { invThis.lastTime = performance.now(); invThis.state = 1 };
      if (invThis.state === 1 && invThis.selectedItem) {
        const deltaT = performance.now() - this.lastTime
        if (invThis.stack.OUTPUT.packs[0]?.n == null) invThis.stack.OUTPUT.packs[0] = {id: invThis.selectedItem, n: 0}
        if (this.stack.OUTPUT.packs[0].n < 100) {
          if (deltaT * AssemblingMachine.P > classDBi[invThis.selectedItem].E) {
            this.energy -= classDBi[invThis.selectedItem].E
            invThis.stack.OUTPUT.packs[0].n++
            invThis.remItems(cost)
            this.lastTime = performance.now()
          }
        }
      }
    }
  }

  getStackName (type) {
    return classDBi[type].name
  }
}
