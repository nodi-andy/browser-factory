import { Settings } from '../../common.js'
import { Inventory, invfuncs } from '../../core/inventory.js'

export class StoneFurnace extends Inventory {
  constructor (pos, data) {
    if (data == null) {
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
    if (this.stack.FUEL == null) this.stack.FUEL = []
    if (this.stack.INPUT == null) this.stack.INPUT = []
    if (this.stack.OUTPUT == null) this.stack.OUTPUT = []
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
    if (ent == null) return
    this.need = []
    this.preneed = []

    if (this.stack.INPUT[0] == null || this.stack.INPUT[0]?.n === 0) this.stack.INPUT = []
    if (this.stack.FUEL[0] == null || this.stack.FUEL[0]?.n === 0) this.stack.FUEL = []

    if (this.stack.OUTPUT[0]?.id == null) {
      this.preneed.push({ id: Settings.resDB.iron.id, n: 1 })
      this.preneed.push({ id: Settings.resDB.copper.id, n: 1 })
      this.preneed.push({ id: Settings.resDB.stone.id, n: 1 })
      this.preneed.push({ id: Settings.resDB.coal.id, n: 1 })
      // this.preneed.push({ id: Settings.resDB.wood.id, n: 1 }) TBD: no wood burning
    } else {
      const outputItem = this.stack.OUTPUT[0].id
      this.preneed = JSON.parse(JSON.stringify(Settings.resName[outputItem].cost))
    }

    for (let costItemID = 0; costItemID < this.preneed.length; costItemID++) {
      const costItem = this.preneed[costItemID]
      const existing = invfuncs.getNumberOfItems(window.game.allInvs[this.id], costItem.id)
      if (existing >= costItem.n) {
        this.need.push(costItem)
      } else {
        this.need.unshift(costItem)
      }
    }

    if (this.stack.INV) {
      if (this.stack.INPUT == null) this.stack.INPUT = this.stack.INV[0]
      else {
        const inItem = this.stack.INV[0]
        let targetSlot = 'INPUT'
        if (Settings.resName[inItem.id].E) targetSlot = 'FUEL'
        this.addItem(inItem, targetSlot)
        delete this.stack.INV
      }
    }
    const stack = ent?.stack
    if (stack?.FUEL == null ||
            stack.INPUT == null ||
            stack.INPUT[0] == null ||
            stack.INPUT[0].id == null ||
            Settings.resName[stack.INPUT[0].id].smeltedInto == null) {
      ent.state = 0
      return
    }

    if (stack?.FUEL.length && stack.FUEL[0].n && stack.INPUT.length && stack.INPUT[0].n) {
      if (ent.state === 0) { this.lastTime = performance.now(); ent.state = 1 };
      if (ent.state === 1) {
        const deltaT = performance.now() - this.lastTime
        const becomesThat = Settings.resName[stack.INPUT[0].id].smeltedInto
        if (becomesThat && deltaT > 5000) {
          // if (inv.stack.OUTPUT == null || inv.stack.OUTPUT.length === 0) inv.stack.OUTPUT = [Settings.item(undefined, 0)];
          if (stack.OUTPUT[0] == null) stack.OUTPUT[0] = Settings.item(undefined, 0)
          if (stack.OUTPUT[0].n == null) stack.OUTPUT[0].n = 0
          stack.INPUT[0].n--
          stack.FUEL[0].n--
          stack.OUTPUT[0].id = becomesThat
          stack.OUTPUT[0].n++
          this.lastTime = performance.now()
        }
      }
    }
  }

  draw (ctx, ent) {
    const mapSize = Settings.resDB.stone_furnace.size
    const viewSize = Settings.resDB.stone_furnace.viewsize
    const img = Settings.resDB.stone_furnace.img
    ctx.drawImage(img, 0, 0, Settings.tileSize, Settings.tileSize, 0, -(viewSize[1] - mapSize[1]) * Settings.tileSize, viewSize[0] * Settings.tileSize, viewSize[1] * Settings.tileSize)
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
  image.src = './' + db.type + '/stone_furnace/stone_furnace_64.png'
  db.img = image
}
db.size = [2, 2]
db.viewsize = [2, 2.5]
db.cost = [{ id: Settings.resDB.stone.id, n: 5 }]
db.rotatable = false
db.mach = StoneFurnace
