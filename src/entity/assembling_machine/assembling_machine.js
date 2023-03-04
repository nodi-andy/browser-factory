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

    this.packsize = 1
    this.stacksize = 4
    this.packsize = {}
    this.state = 0
    this.lastTime = performance.now()
    this.energy = 0
    this.setOutput(data.selectedItem)
    if (this.selectedItem == null) this.selectedItem = classDB['Empty'].id
  }

  setOutput (out, transferInputToPlayer = true) {
    this.selectedItem = out
    if (this.stack && transferInputToPlayer) {
      for (const s of Object.keys(this.stack)) {
        if (s.id === 'PROD') continue
        if (this.stack[s]?.id) window.player?.addItem(this.stack[s])
        if (this.stack[s][0]?.id) window.player?.addItems(this.stack[s])
        delete this.stack[s]
      }
    }
    if (this.selectedItem == null) return
    const cost = classDBi[this.selectedItem].cost
    if (this.stack == null && this.inv.stack) this.stack = this.inv.stack
    if (this.stack == null) this.stack = {}
    if (this.stack.OUTPUT == null) this.stack.OUTPUT = []
    this.stack.OUTPUT.packsize = 1
    this.stack.OUTPUT.allow = this.selectedItem

    for (let icost = 0; icost < cost.length; icost++) {
      const item = cost[icost]
      const name = classDBi[item.id].name
      if (this.stack[name] == null) this.stack[name] = []
      this.stack[name].packsize = 1
      this.stack[name].allow = item.id
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
        if (invThis.stack.OUTPUT[0]?.n == null) invThis.stack.OUTPUT[0] = {id: invThis.selectedItem, n: 0}
        if (this.stack.OUTPUT[0].n < 100) {
          if (deltaT * AssemblingMachine.P > classDBi[invThis.selectedItem].E) {
            this.energy -= classDBi[invThis.selectedItem].E
            invThis.stack.OUTPUT[0].n++
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
