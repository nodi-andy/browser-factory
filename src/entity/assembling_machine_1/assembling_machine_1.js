import { Settings } from '../../common.js'
import { Inventory, invfuncs } from '../../core/inventory.js'

Settings.resDB.assembling_machine_1.name = 'assembling machine 1'
Settings.resDB.assembling_machine_1.type = 'entity'
Settings.resDB.assembling_machine_1.cost = [
  { id: Settings.resDB.circuit.id, n: 3 },
  { id: Settings.resDB.gear.id, n: 5 },
  { id: Settings.resDB.iron_plate.id, n: 9 }
]

if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './src/' + Settings.resDB.assembling_machine_1.type + '/assembling_machine_1/platform.png'
  Settings.resDB.assembling_machine_1.anim = image
}

Settings.resDB.assembling_machine_1.size = [3, 3]
Settings.resDB.assembling_machine_1.output = [
  Settings.resDB.wooden_stick.id,
  Settings.resDB.sharp_stone.id,
  Settings.resDB.iron_stick.id,
  Settings.resDB.gear.id,
  Settings.resDB.hydraulic_piston.id,
  Settings.resDB.copper_cable.id,
  Settings.resDB.circuit.id,
  Settings.resDB.stone_axe.id,
  Settings.resDB.iron_axe.id,
  Settings.resDB.gun.id,
  Settings.resDB.rocket_launcher.id,
  Settings.resDB.bullet.id,
  Settings.resDB.rocket.id,
  Settings.resDB.weak_armor.id,
  Settings.resDB.strong_armor.id,
  Settings.resDB.chest.id,
  Settings.resDB.iron_chest.id,
  Settings.resDB.stone_furnace.id,
  Settings.resDB.burner_miner.id,
  Settings.resDB.e_miner.id,
  Settings.resDB.belt1.id,
  Settings.resDB.inserter_burner.id
]

export class AssemblingMachine1 extends Inventory {
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
        if (this.stack[s]?.id) Settings.player?.addItem(this.stack[s])
        if (this.stack[s][0]?.id) Settings.player?.addItems(this.stack[s])
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

Settings.resDB.assembling_machine_1.mach = AssemblingMachine1
