import { Settings } from '../../common.js'
import { Inventory, invfuncs } from '../../core/inventory.js'

export class AssemblingMachine1 extends Inventory {
  static type = 'entity'
  static cost = [
    { id: 'Circuit', n: 3 },
    { id: 'Gear', n: 5 },
    { id: 'IronPlate', n: 9 }
  ]
  static size = [3, 3]
  static output = ['WoodenStick', 'SharpStone', 'IronStick']
  static imgName = 'assembling_machine_1'

  constructor (pos, data) {
    super(data.pos, data)
    data.pos = pos
    this.setup(undefined, data)
  }

  setup (map, inv) {
    this.prod = inv.prod
    if (this.prod == null) this.prod = Settings.resDB.gear.id

    invfuncs.setInv(inv.pos.x + 0, inv.pos.y + 1, inv.id)
    invfuncs.setInv(inv.pos.x + 0, inv.pos.y + 2, inv.id)
    invfuncs.setInv(inv.pos.x + 1, inv.pos.y + 0, inv.id)
    invfuncs.setInv(inv.pos.x + 1, inv.pos.y + 1, inv.id)
    invfuncs.setInv(inv.pos.x + 1, inv.pos.y + 2, inv.id)
    invfuncs.setInv(inv.pos.x + 2, inv.pos.y + 0, inv.id)
    invfuncs.setInv(inv.pos.x + 2, inv.pos.y + 1, inv.id)
    invfuncs.setInv(inv.pos.x + 2, inv.pos.y + 2, inv.id)

    this.packsize = 1
    this.itemsize = 50
    this.stacksize = 4
    this.packsize = {}
    this.state = 0
    this.lastTime = performance.now()
    this.inv = inv
    this.setOutput(this.prod, false)
  }

  setOutput (out, transferInputToPlayer = true) {
    this.prod = out
    if (this.stack && transferInputToPlayer) {
      for (const s of Object.keys(this.stack)) {
        if (s.id === 'PROD') continue
        if (this.stack[s]?.id) window.player?.addItem(this.stack[s])
        if (this.stack[s][0]?.id) window.player?.addItems(this.stack[s])
        delete this.stack[s]
      }
    }

    const cost = Settings.resName[this.prod].cost
    if (this.stack == null && this.inv.stack) this.stack = this.inv.stack
    if (this.stack == null) this.stack = {}
    this.packsize = {}
    if (this.stack.OUTPUT == null) this.stack.OUTPUT = []
    this.stack.OUTPUT.itemsize = 50
    this.packsize.OUTPUT = 1
    for (let icost = 0; icost < cost.length; icost++) {
      const item = cost[icost]
      const name = Settings.resName[item.id].name
      if (this.stack[name] == null) this.stack[name] = []
      this.packsize[name] = 1
    }
  }

  update (map, invThis) {
    this.preneed = JSON.parse(JSON.stringify(Settings.resName[this.prod].cost))
    delete this.preneed.OUTPUT
    delete this.preneed.PROD

    this.need = []
    for (let costItemID = 0; costItemID < this.preneed.length; costItemID++) {
      const costItem = this.preneed[costItemID]
      const existing = invfuncs.getNumberOfItems(window.game.allInvs[this.id], costItem.id)
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
        if (invThis.prod) {
          if (!invThis.stack.OUTPUT?.length) invThis.stack.OUTPUT = [Settings.item(invThis.prod, 0)]
          if (invThis.stack.OUTPUT[0] == null) invThis.stack.OUTPUT[0] = Settings.item(invThis.prod, 0)
          if (invThis.stack.OUTPUT[0].n == null) invThis.stack.OUTPUT[0].n = 0
          if (this.stack.OUTPUT[0].n < this.itemsize) {
            invThis.stack.OUTPUT[0].n++
            invThis.remItems(Settings.resName[invThis.prod].cost)
          }
        }
      }
    }
  }

  draw (ctx, ent) {
    const db = Settings.resDB.assembling_machine_1
    ctx.drawImage(db.anim, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize)
  }

  getStackName (type) {
    return Settings.resName[type].name
  }
}

if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './' + AssemblingMachine1.type + '/assembling_machine_1/platform.png'
  AssemblingMachine1.anim = image
}
