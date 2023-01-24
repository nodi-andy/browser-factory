import { Settings } from '../../common.js'
import { Inventory, invfuncs } from '../../core/inventory.js'

class StoneFurnace extends Inventory {
  constructor (pos, data) {
    if (data === undefined) {
      data = {
        tilePos: { x: Settings.gridSize.x / 2, y: Settings.gridSize.y / 2 },
        pos,
        stack: {}
      }
    }
    super(pos, data)
    this.setup(undefined, this)
  }

  setup (map, inv) {
    invfuncs.setInv(this.pos.x + 1, this.pos.y + 0, this.id)
    invfuncs.setInv(this.pos.x + 1, this.pos.y + 1, this.id)
    invfuncs.setInv(this.pos.x + 0, this.pos.y + 1, this.id)

    this.packsize = 1
    this.itemsize = 50
    if (this.stack.FUEL === undefined) this.stack.FUEL = []
    if (this.stack.INPUT === undefined) this.stack.INPUT = []
    if (this.stack.OUTPUT === undefined) this.stack.OUTPUT = []
    this.stacksize = 4
    this.packsize = {}
    this.packsize.FUEL = 1
    this.packsize.INPUT = 1
    this.packsize.OUTPUT = 1
    this.packsize.INV = 8
    this.state = 0
    this.lastTime = performance.now()
    this.img = Settings.resDB.stone_furnace.img
  }

  update (map, ent) {
    this.need = []
    this.preneed = []

    if (this.stack.OUTPUT[0]?.id !== undefined) {
      const outputItem = this.stack.OUTPUT[0].id
      this.preneed = JSON.parse(JSON.stringify(Settings.resName[outputItem].cost))
    } else {
      if (this.stack.INPUT === undefined || this.stack.INPUT[0] === undefined || this.stack.INPUT[0].n === 0) {
        this.preneed.push({ id: Settings.resDB.copper.id, n: 1 })
        this.preneed.push({ id: Settings.resDB.stone.id, n: 1 })
        this.preneed.push({ id: Settings.resDB.iron.id, n: 1 })
      }
      if (this.stack.FUEL === undefined || this.stack.FUEL[0] === undefined || this.stack.FUEL[0].n === 0) {
        this.preneed.push({ id: Settings.resDB.coal.id, n: 1 })
        this.preneed.push({ id: Settings.resDB.wood.id, n: 1 })
      }
    }

    for (let costItemID = 0; costItemID < this.preneed.length; costItemID++) {
      const costItem = this.preneed[costItemID]
      const existing = invfuncs.getNumberOfItems(Settings.allInvs[this.id], costItem.id)
      if (existing >= costItem.n) {
        this.need.push(costItem)
      } else {
        this.need.unshift(costItem)
      }
    }

    if (this.stack.INV) {
      if (this.stack.INPUT === undefined) this.stack.INPUT = this.stack.INV[0]
      else {
        const inItem = this.stack.INV[0]
        let targetSlot = 'INPUT'
        if (Settings.resName[inItem.id].E) targetSlot = 'FUEL'
        this.addItem(inItem, targetSlot)
        delete this.stack.INV
      }
    }
    const inv = invfuncs.getInv(ent.pos.x, ent.pos.y)
    if (inv?.stack?.FUEL === undefined ||
            inv.stack.INPUT === undefined ||
            inv.stack.INPUT[0] === undefined ||
            inv.stack.INPUT[0].id === undefined ||
            Settings.resName[inv.stack.INPUT[0].id].smeltedInto === undefined) {
      inv.state = 0
      return
    }

    if (inv?.stack?.FUEL.length && inv.stack.FUEL[0].n && inv.stack.INPUT.length && inv.stack.INPUT[0].n) {
      if (inv.state === 0) { this.lastTime = performance.now(); inv.state = 1 };
      if (inv.state === 1) {
        const deltaT = performance.now() - this.lastTime
        const becomesThat = Settings.resName[inv.stack.INPUT[0].id].smeltedInto
        if (becomesThat && deltaT > 5000) {
          // if (inv.stack.OUTPUT === undefined || inv.stack.OUTPUT.length === 0) inv.stack.OUTPUT = [Settings.item(undefined, 0)];
          if (inv.stack.OUTPUT[0] === undefined) inv.stack.OUTPUT[0] = Settings.item(undefined, 0)
          if (inv.stack.OUTPUT[0].n === undefined) inv.stack.OUTPUT[0].n = 0
          inv.stack.INPUT[0].n--
          inv.stack.FUEL[0].n--
          inv.stack.OUTPUT[0].id = becomesThat
          inv.stack.OUTPUT[0].n++
          this.lastTime = performance.now()
        }
      }
    }
  }

  draw (ctx, ent) {
    let img = this.img
    if (ent) img = Settings.resDB.stone_furnace.img
    ctx.drawImage(img, 0, 0, db.size[0] * Settings.tileSize / 2, db.size[1] * Settings.tileSize / 2, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize)
  }

  drawItems (ctx) {
    const mapSize = Settings.resDB.stone_furnace.size
    const viewSize = Settings.resDB.stone_furnace.viewsize
    if (this.img) {
      ctx.drawImage(this.img, 0, 0, Settings.tileSize, Settings.tileSize, 0, -(viewSize[1] - mapSize[1]) * Settings.tileSize, viewSize[0] * Settings.tileSize, viewSize[1] * Settings.tileSize)
    }
  }

  getStackName (type) {
    if (type === Settings.resDB.coal.id) return 'FUEL'
  }
}

const db = Settings.resDB.stone_furnace
db.name = 'stone furnace'
db.type = 'entity'
if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './src/' + db.type + '/stone_furnace/stone_furnace_64.png'
  db.img = image
}
db.size = [2, 2]
db.viewsize = [2, 2.5]
db.cost = [{ id: Settings.resDB.stone.id, n: 5 }]
db.rotatable = false
db.mach = StoneFurnace

export { StoneFurnace }
