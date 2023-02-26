import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

export class AssemblingMachine extends Inventory {
  static type = 'entity'
  static size = [3, 3]
  static imgName = 'assembling_machine'
  
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
    this.itemsize = 50
    this.stacksize = 4
    this.packsize = {}
    this.state = 0
    this.lastTime = performance.now()
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
    this.packsize = {}
    if (this.stack.OUTPUT == null) this.stack.OUTPUT = []
    this.stack.OUTPUT.itemsize = 50
    this.packsize.OUTPUT = 1
    for (let icost = 0; icost < cost.length; icost++) {
      const item = cost[icost]
      const name = classDBi[item.id].name
      if (this.stack[name] == null) this.stack[name] = []
      this.packsize[name] = 1
    }
  }

  update (map, invThis) {
    if (this.selectedItem == null) return
    this.preneed = JSON.parse(JSON.stringify(classDBi[this.selectedItem].cost))
    delete this.preneed.OUTPUT
    delete this.preneed.PROD

    this.need = []
    for (let costItemID = 0; costItemID < this.preneed.length; costItemID++) {
      const costItem = this.preneed[costItemID]
      const existing = Inventory.getNumberOfItems(game.allInvs[this.id], costItem.id)
      if (existing < costItem.n) {
        this.need.push(costItem)
      }
    }

    const tempInv = new Inventory()
    tempInv.stack = JSON.parse(JSON.stringify(this.stack))
    tempInv.packsize = JSON.parse(JSON.stringify(this.packsize))
    tempInv.PROD = []
    tempInv.OUTPUT = []
    if (invThis.need && tempInv.remItems(invThis.need)) {
      if (invThis.state === 0) { invThis.lastTime = performance.now(); invThis.state = 1 };
      if (invThis.state === 1) {
        if (invThis.selectedItem) {
          if (!invThis.stack.OUTPUT?.length) invThis.stack.OUTPUT = [ {id: invThis.selectedItem, n: 0} ]
          if (invThis.stack.OUTPUT[0] == null) invThis.stack.OUTPUT[0] = {id: invThis.selectedItem, n: 0}
          if (invThis.stack.OUTPUT[0].n == null) invThis.stack.OUTPUT[0].n = 0
          if (this.stack.OUTPUT[0].n < this.itemsize) {
            invThis.stack.OUTPUT[0].n++
            invThis.remItems(classDBi[invThis.selectedItem].cost)
          }
        }
      }
    }
  }

  getStackName (type) {
    return classDBi[type].name
  }
}