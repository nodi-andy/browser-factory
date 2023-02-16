import { Settings, toUnitV } from '../../common.js'
import { Inventory, invfuncs } from '../../core/inventory.js'
import * as NC from 'nodicanvas'

class Player extends Inventory {
  constructor (pos, data) {
    if (data == null) {
      data = {
        tilePos: new NC.Vec2(window.entityLayer.gridSize.x / 2, window.entityLayer.gridSize.y / 2),
        stack: {}
      }
      data.pos = window.entityLayer.tileToWorld(data.tilePos)
    }

    super(data.tilePos, data)

    this.tilePos = data.tilePos
    this.pos = data.pos
    this.stack = data.stack
    this.setup()
  }

  setup (map, inv) {
    if (this.tilePos == null) {
      this.tilePos = new NC.Vec2(window.entityLayer.gridSize.x / 2, window.entityLayer.gridSize.y / 2)
    }
    if (this.pos?.x == null || this.pos?.y == null) {
      this.pos = window.entityLayer.tileToWorld(this.tilePos)
    }
    if (this.pos?.x == null || this.pos?.y == null) {
      this.pos = { x: 0, y: 0 }
    }

    this.dir = { x: 0, y: 0 }
    this.live = 100
    this.nextPos = { x: 0, y: 0 }
    this.type = Settings.resDB.player.id
    this.movable = true
    this.speed = 5

    this.ss = { x: 0, y: 0 }
    if (this.stack && this.stack?.INV == null) this.stack.INV = []
    this.stacksize = 1
    this.packsize = {}
    this.packsize.INV = 64
    this.itemsize = 1000
    this.workProgress = 0
    this.miningTimer = 0
    this.invID = 0
  }

  update (map, ent) {
    ent.tilePos = window.entityLayer.worldToTile(ent.pos)
    while (this.checkCollision(ent.tilePos)) {
      ent.tilePos.x++
      ent.pos = { x: ent.tilePos.x * Settings.tileSize, y: ent.tilePos.y * Settings.tileSize }
    }

    ent.unitdir = toUnitV(ent.dir)
    const entTile = window.entityLayer.worldToTile(ent.pos)

    const entMap = invfuncs.getInv(entTile.x, entTile.y)
    if (entMap?.type === Settings.resDB.belt1.id || entMap?.type === Settings.resDB.belt2.id || entMap?.type === Settings.resDB.belt3.id) {
      ent.pos.x += Settings.dirToVec[entMap.dir].x * entMap.speed
      ent.pos.y += Settings.dirToVec[entMap.dir].y * entMap.speed
    }

    ent.nextPos.x = ent.pos.x + this.speed * ent.unitdir.x
    const nextXTile = window.entityLayer.worldToTileXY(ent.nextPos.x, ent.pos.y)
    if (nextXTile.x > 0 && nextXTile.x < Settings.gridSize.x - 1 && this.checkCollision({ x: nextXTile.x, y: entTile.y }) === false) ent.pos.x = ent.nextPos.x

    ent.nextPos.y = ent.pos.y + this.speed * ent.unitdir.y
    const nextYTile = window.entityLayer.worldToTileXY(ent.pos.x, ent.nextPos.y)
    if (nextYTile.y > 0 && nextYTile.y < Settings.gridSize.y - 1 && this.checkCollision({ x: entTile.x, y: nextYTile.y }) === false) ent.pos.y = ent.nextPos.y

    if (ent.dir.x < 0) ent.ss.x--; else ent.ss.x++

    if (ent.dir.y < -0.25 && ent.dir.x < -0.25) ent.ss.y = 5
    if (ent.dir.y < -0.25 && Math.abs(ent.dir.x) < 0.25) ent.ss.y = 0
    if (ent.dir.y < -0.25 && ent.dir.x > 0.25) ent.ss.y = 1
    if (Math.abs(ent.dir.y) < 0.5 && ent.dir.x < 0) ent.ss.y = 6
    if (Math.abs(ent.dir.y) < 0.5 && ent.dir.x > 0) ent.ss.y = 2
    if (ent.dir.y > 0.25 && ent.dir.x < -0.25) ent.ss.y = 7
    if (ent.dir.y > 0.25 && Math.abs(ent.dir.x) < 0.25) ent.ss.y = 4
    if (ent.dir.y > 0.25 && ent.dir.x > 0.25) ent.ss.y = 3

    if (ent.dir.x !== 0) Settings.curResPos.x = 0
    if (ent.dir.y !== 0) Settings.curResPos.y = 0

    ent.ss.x += 30
    ent.ss.x %= 30
    if (ent.dir.x === 0 && ent.dir.y === 0) ent.ss.x = 5

    if (ent.pos && ent.id === window.game.playerID) {
      const myMid = {}
      myMid.x = ent.pos.x
      myMid.y = ent.pos.y - 66
      window.game.setCenter(myMid.x, myMid.y)
      window.game.focusOn()
      if (ent.dir.x !== 0 || ent.dir.y !== 0) {
        ent.needUpdate = true
      } else {
        // wssend(JSON.stringify({ cmd: 'updateEntity', data: { id: window.game.playerID, ent: window.game.allInvs[window.game.playerID] } }))
        ent.needUpdate = false
      }
      // if (ent.needUpdate) wssend(JSON.stringify({ cmd: 'updateEntity', data: { id: window.game.playerID, ent: window.game.allInvs[window.game.playerID] } }))
    }

    // console.log(ent.pos, entTile);
  }

  draw (ctx, ent) {
    if (this.car) return
    ctx.translate(this.pos.x, this.pos.y)
    ctx.drawImage(Settings.resDB.player.img, this.ss.x * 96, this.ss.y * 132, 96, 132, -48, -100, 96, 132)
    ctx.beginPath()
    /*
    ctx.fillStyle = 'red'
    ctx.fillRect(-25, -120, 50, 10)
    ctx.fillStyle = 'green'
    ctx.fillRect(-25, -120, (this.live / 100) * 50, 10)
    */
    ctx.fillStyle = 'yellow'
    ctx.fillRect(-25, -130, (this.workProgress / 100) * 50, 10)
  }

  onKeyDown (e) {
    if (e.code === 'Enter' || e.code === 'NumpadEnter') this.enterCar()

    if (this.car) {
      this.car.onKeyDown(e)
    } else {
      if (e.code === 'KeyW') this.dir.y = -1
      if (e.code === 'KeyS') this.dir.y = 1
      if (e.code === 'KeyD') this.dir.x = 1
      if (e.code === 'KeyA') this.dir.x = -1
      if (e.code === 'KeyF') this.fetch()
    }
  }

  onKeyUp (e) {
    if (this.car) {
      this.car.onKeyUp(e)
    } else {
      if (e.code === 'KeyW') this.dir.y = 0
      if (e.code === 'KeyS') this.dir.y = 0
      if (e.code === 'KeyD') this.dir.x = 0
      if (e.code === 'KeyA') this.dir.x = 0
    }
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
    if (e?.type === Settings.resDB.empty.id || e?.type === Settings.resDB.belt1.id) {
      const pickedItem = e.getFirstItem()
      e.moveItemTo(pickedItem, this)
      if (pickedItem?.reserved === true) pickedItem.reserved = false
    }
  }

  enterCar () {
    if (this.car) {
      this.car.speed = 0
      this.car = undefined
      return
    }

    for (const nbV of Settings.nbVec) {
      const nb = invfuncs.getInv(this.tilePos.x + nbV.x, this.tilePos.y + nbV.y)
      if (nb?.type === Settings.resDB.car.id) {
        this.car = window.game.allInvs[nb.id]
      }
    }
  }

  setDir (dir) {
    if (dir.y) window.game.allInvs[window.game.playerID].dir.y = dir.y
  }

  checkCollision (pos) {
    if (window.terrain.map == null) return
    const terrain = window.terrain.map[pos.x][pos.y][0]
    if (Settings.resName[terrain].playerCanWalkOn === false) return true

    const building = window.entityLayer.map[pos.x][pos.y]
    if (building == null) return false
    const buildingType = window.game.allInvs[building]?.type
    if (buildingType) {
      const canWalk = Settings.resName[buildingType].playerCanWalkOn
      if (canWalk === false || canWalk == null) return true
    }
    return false
  }

  startMining (tileCoordinate, ent) {
    ent.stopMining(ent)
    if (ent.miningTimer == null) {
      ent.miningTimer = setInterval(function () {
        ent.workProgress += 10
        if (ent.workProgress >= 100) {
          ent.workProgress %= 100
          const inv = invfuncs.getInv(tileCoordinate.x, tileCoordinate.y)
          const res = window.res.getResource(tileCoordinate)
          if (inv) {
            Settings.player.destructBuilding(tileCoordinate)
            Settings.player.stopMining(Settings.player)
            window.game.allInvs[window.game.playerID].addItem({id: inv.id, n: 1})
          } else if (res) {
            invfuncs.mineToInv({ source: tileCoordinate, id: res.id, n: 1 })
          }
        }
      }, 100)
    }
  }

  stopMining (ent) {
    clearInterval(ent.miningTimer)
    ent.miningTimer = null
    ent.workProgress = 0
  }

  destructBuilding (tileCoordinate) {
    window.entityLayer.removeEntity(tileCoordinate)
  }

  setInventory (newInv, newID) {
    window.game.allInvs[this.invID].stack = JSON.parse(JSON.stringify(newInv.stack))
    window.game.allInvs[this.invID].packsize = newInv.packsize
    window.game.allInvs[this.invID].itemsize = newInv.itemsize

    const currentID = window.game.allInvs[this.invID].id
    if (newInv.id !== undefined) {
      this.invID = newInv.id; window.game.allInvs[this.invID].id = newID
    } else if (newID !== undefined) { this.invID = newID; window.game.allInvs[this.invID].id = newID }

    if (window.game.allInvs[this.invID].id == null) window.game.allInvs[this.invID].id = currentID
    window.game.updateInventoryMenu(this.inv)
  }

  setInventoryID (newID) {
    this.invID = newID

    window.game.updateInventoryMenu(this.inv)
  }
}

const db = Settings.resDB.player
db.name = 'player'
db.type = 'entity'
db.P = 100
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
  Settings.resDB.inserter,
  Settings.resDB.inserter_long,
  Settings.resDB.inserter_smart,
  Settings.resDB.assembling_machine_1,
  Settings.resDB.assembling_machine_2,
  Settings.resDB.assembling_machine_3,
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
