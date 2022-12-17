import { Settings, worldToTile, toUnitV } from '../../common.js'
import { Inventory, invfuncs } from '../../core/inventory.js'

class Player extends Inventory {
  constructor (pos, data) {
    if (data === undefined) {
      data = {
        tilePos: { x: Settings.gridSize.x / 2, y: Settings.gridSize.y / 2 },
        pos,
        stack: {}
      }
    }

    super(pos, data)
    this.tilePos = data.tilePos
    this.pos = data.pos
    this.stack = data.stack
    this.setup()
  }

  setup (map, inv) {
    window.view.updateCraftingMenu()
    if (this.tilePos === undefined) this.tilePos = { x: Settings.gridSize.x / 2, y: Settings.gridSize.y / 2 }
    this.pos = { x: this.tilePos.x * Settings.tileSize, y: this.tilePos.y * Settings.tileSize }
    this.dir = { x: 0, y: 0 }
    this.live = 100
    this.nextPos = { x: 0, y: 0 }
    this.type = Settings.resID.player
    this.movable = true

    this.ss = { x: 0, y: 0 }
    if (this.stack?.INV === undefined) this.stack.INV = []
    this.stacksize = 1
    this.packsize = {}
    this.packsize.INV = 64
    this.itemsize = 1000
    this.workInterval = undefined
    this.workProgress = 0
    this.miningProgress = 0

    if (this.stack.INV.length === 0 && Settings.DEV) this.addResources()
    window.view.updateInventoryMenu(this)
  }

  update (map, ent) {
    ent.tilePos = worldToTile({ x: ent.pos.x, y: ent.pos.y })
    while (this.checkCollision(ent.tilePos)) {
      ent.tilePos.x++
      ent.pos = { x: ent.tilePos.x * Settings.tileSize, y: ent.tilePos.y * Settings.tileSize }
    }

    if (Settings.game.map === undefined) return
    ent.unitdir = toUnitV(ent.dir)
    const entTile = worldToTile({ x: ent.pos.x, y: ent.pos.y })

    const entMap = invfuncs.getInv(entTile.x, entTile.y)
    if (entMap?.type === Settings.resDB.belt1.id) {
      ent.pos.x += Settings.dirToVec[entMap.dir].x * 2
      ent.pos.y += Settings.dirToVec[entMap.dir].y * 2
    }

    ent.nextPos.x = ent.pos.x + 5 * ent.unitdir.x
    const nextXTile = worldToTile({ x: ent.nextPos.x, y: ent.pos.y })
    if (nextXTile.x > 0 && nextXTile.x < Settings.gridSize.x - 1 && this.checkCollision({ x: nextXTile.x, y: entTile.y }) === false) ent.pos.x = ent.nextPos.x

    ent.nextPos.y = ent.pos.y + 5 * ent.unitdir.y
    const nextYTile = worldToTile({ x: ent.pos.x, y: ent.nextPos.y })
    if (nextYTile.y > 0 && nextYTile.y < Settings.gridSize.y - 1 && this.checkCollision({ x: entTile.x, y: nextYTile.y }) === false) ent.pos.y = ent.nextPos.y

    if (ent.dir.x < 0) ent.ss.x--; else ent.ss.x++

    if (ent.dir.y === -1 && ent.dir.x === -1) ent.ss.y = 5
    if (ent.dir.y === -1 && ent.dir.x === 0) ent.ss.y = 0
    if (ent.dir.y === -1 && ent.dir.x === 1) ent.ss.y = 1
    if (ent.dir.y === 0 && ent.dir.x === -1) ent.ss.y = 6
    if (ent.dir.y === 0 && ent.dir.x === 1) ent.ss.y = 2
    if (ent.dir.y === 1 && ent.dir.x === -1) ent.ss.y = 7
    if (ent.dir.y === 1 && ent.dir.x === 0) ent.ss.y = 4
    if (ent.dir.y === 1 && ent.dir.x === 1) ent.ss.y = 3

    ent.ss.x += 30
    ent.ss.x %= 30
    if (ent.dir.x === 0 && ent.dir.y === 0) ent.ss.x = 5

    if (ent.pos && ent.id === Settings.playerID) {
      const myMid = {}
      myMid.x = ent.pos.x
      myMid.y = ent.pos.y - 66
      window.view.setCamOn(myMid)
      if (ent.dir.x !== 0 || ent.dir.y !== 0) {
        ent.needUpdate = true
      } else {
        // wssend(JSON.stringify({ cmd: 'updateEntity', data: { id: Settings.playerID, ent: Settings.allInvs[Settings.playerID] } }))
        ent.needUpdate = false
      }
      // if (ent.needUpdate) wssend(JSON.stringify({ cmd: 'updateEntity', data: { id: Settings.playerID, ent: Settings.allInvs[Settings.playerID] } }))
    }

    // console.log(ent.pos, entTile);
  }

  draw (ctx, ent) {
    ctx.save()
    ctx.translate(ent.pos.x, ent.pos.y)
    ctx.drawImage(Settings.resDB.player.img, ent.ss.x * 96, ent.ss.y * 132, 96, 132, -48, -100, 96, 132)
    ctx.beginPath()
    ctx.fillStyle = 'red'
    ctx.fillRect(-25, -120, 50, 10)
    ctx.fillStyle = 'green'
    ctx.fillRect(-25, -120, (ent.live / 100) * 50, 10)
    ctx.fillStyle = 'yellow'
    ctx.fillRect(-25, -130, (ent.workProgress / 100) * 50, 10)
    ctx.restore()
  }

  fetch () {
    if (this.tilePos !== undefined) {
      this.fetchTile(this.tilePos.x - 1, this.tilePos.y - 1)
      this.fetchTile(this.tilePos.x + 0, this.tilePos.y - 1)
      this.fetchTile(this.tilePos.x + 1, this.tilePos.y - 1)
      this.fetchTile(this.tilePos.x - 1, this.tilePos.y)
      this.fetchTile(this.tilePos.x + 0, this.tilePos.y)
      this.fetchTile(this.tilePos.x + 1, this.tilePos.y)
      this.fetchTile(this.tilePos.x - 1, this.tilePos.y + 1)
      this.fetchTile(this.tilePos.x + 0, this.tilePos.y + 1)
      this.fetchTile(this.tilePos.x + 1, this.tilePos.y + 1)
    }
  }

  fetchTile (x, y) {
    const e = invfuncs.getInv(x, y)
    if (e?.type === Settings.resDB.empty.type || e?.type === Settings.resDB.belt1.id) {
      const pickedItem = e.getFirstItem()
      e.moveItemTo(pickedItem, this)
      if (pickedItem?.reserved === true) pickedItem.reserved = false
    }
  }

  setDir (dir) {
    if (dir.y) Settings.allInvs[Settings.playerID].dir.y = dir.y
  }

  checkCollision (pos) {
    if (Settings.game.map === undefined) return
    const terrain = Settings.game.map[pos.x][pos.y][Settings.layers.terrain][0]
    const building = Settings.game.map[pos.x][pos.y][Settings.layers.inv]
    let canWalkOn = true
    if (building) {
      canWalkOn = false
      if (Settings.resName[Settings.allInvs[building]?.type]) canWalkOn = Settings.resName[Settings.allInvs[building].type].playerCanWalkOn
    }

    return (terrain === Settings.resID.deepsea || terrain === Settings.resID.sea || terrain === Settings.resID.hills || !canWalkOn)
  }

  startMining (tileCoordinate, ent) {
    this.workInterval = setInterval(function () {
      const res = Settings.game.map[tileCoordinate.x][tileCoordinate.y][Settings.layers.res]
      invfuncs.mineToInv({ source: tileCoordinate, id: res.id, n: 1 })
    }, 1000)
    this.miningProgress = setInterval(function () { ent.workProgress += 10; ent.workProgress %= 100 }, 100)
  }

  stopMining (ent) {
    clearInterval(this.workInterval)
    clearInterval(this.miningProgress)
    ent.workProgress = 0
  }

  setInventory (newInv, newID) {
    Settings.allInvs[this.invID].stack = JSON.parse(JSON.stringify(newInv.stack))
    Settings.allInvs[this.invID].packsize = newInv.packsize
    Settings.allInvs[this.invID].itemsize = newInv.itemsize

    const currentID = Settings.allInvs[this.invID].id
    if (newInv.id !== undefined) {
      this.invID = newInv.id; Settings.allInvs[this.invID].id = newID
    } else if (newID !== undefined) { this.invID = newID; Settings.allInvs[this.invID].id = newID }

    if (Settings.allInvs[this.invID].id === undefined) Settings.allInvs[this.invID].id = currentID
    this.inv = Settings.allInvs[this.invID]
    window.view.updateInventoryMenu(this.inv)
  }

  setInventoryID (newID) {
    this.invID = newID
    this.inv = Settings.allInvs[this.invID]
    window.view.updateInventoryMenu(this.inv)
  }

  addResources () {
    this.stack.INV.push({ id: Settings.resDB.stone.id, n: 100 })
    this.stack.INV.push({ id: Settings.resDB.iron.id, n: 100 })
    this.stack.INV.push({ id: Settings.resDB.copper.id, n: 100 })
    this.stack.INV.push({ id: Settings.resDB.raw_wood.id, n: 100 })
    this.stack.INV.push({ id: Settings.resDB.coal.id, n: 50 })
    this.stack.INV.push({ id: Settings.resDB.chest.id, n: 50 })
    this.stack.INV.push({ id: Settings.resDB.assembling_machine_1.id, n: 50 })
    this.stack.INV.push({ id: Settings.resDB.inserter_burner.id, n: 50 })
    this.stack.INV.push({ id: Settings.resDB.iron_plate.id, n: 1000 })
    this.stack.INV.push({ id: Settings.resDB.belt1.id, n: 1000 })
  }
}

const db = Settings.resDB.player
db.mach = Player
db.output = [
  Settings.resDB.wood,
  Settings.resDB.wooden_stick,
  Settings.resDB.sharp_stone,
  Settings.resDB.iron_stick,
  Settings.resDB.gear,
  Settings.resDB.hydraulic_piston,
  Settings.resDB.copper_cable,
  Settings.resDB.circuit,
  Settings.resDB.stone_axe,
  Settings.resDB.iron_axe,
  Settings.resDB.gun,
  Settings.resDB.rocket_launcher,
  Settings.resDB.bullet,
  Settings.resDB.rocket,
  Settings.resDB.weak_armor,
  Settings.resDB.strong_armor,
  Settings.resDB.chest,
  Settings.resDB.iron_chest,
  Settings.resDB.stone_furnace,
  Settings.resDB.burner_miner,
  Settings.resDB.e_miner,
  Settings.resDB.belt1,
  Settings.resDB.belt2,
  Settings.resDB.belt3,
  Settings.resDB.inserter_burner,
  Settings.resDB.inserter_short,
  Settings.resDB.inserter,
  Settings.resDB.inserter_long,
  Settings.resDB.inserter_smart,
  Settings.resDB.assembling_machine_1,
  Settings.resDB.assembling_machine_2,
  Settings.resDB.assembling_machine_3,
  Settings.resDB.assembling_machine_4,
  Settings.resDB.pump,
  Settings.resDB.pipe,
  Settings.resDB.boiler,
  Settings.resDB.generator,
  Settings.resDB.pole,
  Settings.resDB.locomotive,
  Settings.resDB.rail,
  Settings.resDB.rail_curved,
  Settings.resDB.turret,
  Settings.resDB.laser_turret,
  Settings.resDB.car
]
export { Player }
