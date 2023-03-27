import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

export class StoneFurnace extends Inventory {
  static type = 'entity'
  static size = [2, 2]
  static viewsize = [2, 2.5]
  static cost = [{ id: "Stone", n: 5 }]
  static rotatable = false
  static imgName = 'stone_furnace'
  static P = 0.02
  static name = "StoneFurnace"
  static label = "Stone Furnace"

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

  setup (map, ent) {
    const size = StoneFurnace.size
    for (let i = 0; i < size[0]; i++) {
      for (let j = 0; j < size[1]; j++) { 
        game.entityLayer.setInv(ent.pos.x + i, ent.pos.y + j, this.id)
      }
    }

    this.energy = 0
    if (this.stack.FUEL == null) this.stack.FUEL = {maxlen: 1, packsize : 50, packs:[]}
    if (this.stack.INPUT == null) this.stack.INPUT = {maxlen: 1, packsize : 50, packs:[]}
    this.state = 0
    this.lastTime = performance.now()
    this.stack.INV.visible = false;
  }

  update (map, ent) {
    if (ent == null) return
    this.need = []
    this.shallNeed = []
    let becomesThat = null

    if (this.stack.FUEL.packs.length == 0) {
      this.stack.FUEL = {maxlen: 1, packsize : 50, packs:[]}
      this.stack.FUEL.allow = {}
      this.stack.FUEL.allow[window.classDB.Coal.id] = 50
      this.stack.FUEL.allow[window.classDB.Wood.id] = 50
    } else {
     this.stack.FUEL.allow = {}
     this.stack.FUEL.allow[this.stack.FUEL.packs[0].id] = 50
   }

    if (this.stack.INPUT?.packs.length == 0) {
      if (this.stack.INPUT == null) this.stack.INPUT = {maxlen: 1, packsize : 50, packs:[]}
      this.stack.INPUT.allow = {}
      this.stack.INPUT.allow[window.classDB.Iron.id] = 50
      this.stack.INPUT.allow[window.classDB.Copper.id] = 50
      this.stack.INPUT.allow[window.classDB.Stone.id] = 50
      this.stack.INPUT.allow[window.classDB.Coal.id] = 50
    } else {
      this.stack.INPUT.allow = {}
      this.stack.INPUT.allow[this.stack.INPUT.packs[0].id] = 50
    }
    if (this.stack.OUTPUT == null) this.stack.OUTPUT = {maxlen: 1, packsize : 50, packs:[]}

    if (this.stack.OUTPUT[0]?.id) {
      becomesThat = this.stack.OUTPUT[0]?.id
      let filter = {}
      for (let inputPossible of Object.keys(this.stack.INPUT.allow)) {
        let inputPossibleInt = parseInt(inputPossible)
        if (classDB[classDBi[inputPossibleInt].smeltedInto]?.id === this.stack.OUTPUT[0]?.id) {
          filter[inputPossibleInt] = this.stack.INPUT.allow[inputPossible]
        }
      }
      this.stack.INPUT.allow = filter
    }

    if (becomesThat == null && this.stack.INPUT.packs[0]?.id) { 
      let out = classDBi[this.stack.INPUT.packs[0].id].smeltedInto;
      if (out) {
        becomesThat = classDB[out].id
      }
    }

    if (becomesThat) {
      this.canNeed = {}
      let cost = classDBi[becomesThat].cost
      for (let costItem of Object.keys(cost)) {
        this.canNeed[cost[costItem].id] = cost[costItem].n
      }
    } else {
      this.canNeed = {...this.stack.INPUT.allow, ...this.stack.FUEL.allow}
    }

    this.canHave = {...this.stack.INPUT.allow, ...this.stack.FUEL.allow}

    for (let costItem of Object.keys(this.canNeed)) {
      let costItemInt = parseInt(costItem)
      const existing = this.getNumberOfItems(costItemInt)
      if (existing < this.canNeed[costItemInt] ) this.need.push(costItemInt)
    }

    for (let costItem of Object.keys(this.canHave)) {
      let costItemInt = parseInt(costItem)
      const existing = this.getNumberOfItems(parseInt(costItemInt))
      if (existing < this.canHave[costItemInt] ) this.shallNeed.push(costItemInt)
    }

    if (this.stack.INV.packs[0]) {
      if (this.stack.INPUT == null) this.stack.INPUT = this.stack.INV.packs[0]
      else {
        const inItem = this.stack.INV.packs[0]
        let targetSlot = 'INPUT'
        if (classDBi[inItem.id].E) targetSlot = 'FUEL'
        this.addItem(inItem, targetSlot)
        delete this.stack.INV
      }
    }
    const stack = ent?.stack
    if (stack?.FUEL == null || stack.INPUT.packs[0]?.id == null ||
            classDBi[stack.INPUT.packs[0].id].smeltedInto == null) {
      ent.state = 0
      return
    }
    if (stack.FUEL.packs[0]?.n >= 1 && this.energy <= 0) {
      this.energy += classDBi[stack.FUEL.packs[0].id].E
      stack.FUEL.packs[0].n--
    }

    if (this.energy && stack.INPUT.packs[0]?.n) {
      if (ent.state === 0) { this.lastTime = performance.now(); ent.state = 1 };
      if (ent.state === 1) {
        const deltaT = performance.now() - this.lastTime
        const becomesThat = classDB[classDBi[stack.INPUT.packs[0].id].smeltedInto].id
        if (becomesThat && (deltaT * StoneFurnace.P > classDBi[becomesThat].E)) {
          this.energy -= classDBi[becomesThat].E
          if (stack.OUTPUT.packs[0] == null) stack.OUTPUT.packs[0] = {id: undefined, n: 0}
          if (stack.OUTPUT.packs[0].n == null) stack.OUTPUT.packs[0].n = 0
          this.remItem({id: stack.INPUT.packs[0].id, n:1}, "INPUT", 0)
          stack.OUTPUT.packs[0].id = becomesThat
          stack.OUTPUT.packs[0].n++
          if (window.selEntity == this) game.updateEntityMenu(window.selEntity, true)
          this.lastTime = performance.now()
        }
      }
    }
  }

  draw (ctx, ent) {
    const mapSize = StoneFurnace.size
    const viewSize = StoneFurnace.viewsize
    ctx.drawImage(StoneFurnace.img, 0, 0, Settings.tileSize, Settings.tileSize, 0, -(viewSize[1] - mapSize[1]) * Settings.tileSize, viewSize[0] * Settings.tileSize, viewSize[1] * Settings.tileSize)
  }

  getStackName (type) {
    if (type === classDB.Coal.id) return 'FUEL'
  }
}
