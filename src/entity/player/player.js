import { Settings, toUnitV } from '../../common.js'
import { Inventory } from '../../core/inventory.js'
import * as NC from 'nodicanvas'

export class Player extends Inventory {
  static type = 'entity'
  static P = 100
  constructor (pos, data) {
    if (data == null) {
      data = {
        tilePos: new NC.Vec2(window.game.entityLayer.gridSize.x / 2, window.game.entityLayer.gridSize.y / 2),
        stack: {}
      }
      data.pos = window.game.entityLayer.tileToWorld(data.tilePos)
    }

    super(data.tilePos, data)

    this.tilePos = data.tilePos
    this.pos = data.pos
    this.stack = data.stack
    this.setup()
  }

  setup (map, inv) {
    if (this.tilePos == null) {
      this.tilePos = new NC.Vec2(window.game.entityLayer.gridSize.x / 2, window.game.entityLayer.gridSize.y / 2)
    }
    if (this.pos?.x == null || this.pos?.y == null) {
      this.pos = window.game.entityLayer.tileToWorld(this.tilePos)
    }
    if (this.pos?.x == null || this.pos?.y == null) {
      this.pos = { x: 0, y: 0 }
    }
    this.output = ["Wood", "StoneFurnace", "BurnerMiner", "Chest", "IronStick", "Gear", "Belt1", "Belt2", "Belt3"]
    this.name = "Player"
    this.dir = { x: 0, y: 0 }
    this.live = 100
    this.nextPos = { x: 0, y: 0 }
    this.type = Settings.resDB.Player.id
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
    this.tilePos = window.game.entityLayer.worldToTile(this.pos)
    while (this.checkCollision(this.tilePos)) {
      this.tilePos.x++
      this.pos = { x: this.tilePos.x * Settings.tileSize, y: this.tilePos.y * Settings.tileSize }
    }

    this.unitdir = toUnitV(this.dir)
    const entTile = window.game.entityLayer.worldToTile(this.pos)

    const entMap = Inventory.getInv(entTile.x, entTile.y)
    if (entMap?.isBelt) {
      this.pos.x += Settings.dirToVec[entMap.dir].x * window.classDB[entMap.name].speed
      this.pos.y += Settings.dirToVec[entMap.dir].y * window.classDB[entMap.name].speed
    }

    this.nextPos.x = this.pos.x + this.speed * this.unitdir.x
    const nextXTile = window.game.entityLayer.worldToTileXY(this.nextPos.x, this.pos.y)
    if (nextXTile.x > 0 && nextXTile.x < Settings.gridSize.x - 1 && this.checkCollision({ x: nextXTile.x, y: entTile.y }) === false) this.pos.x = this.nextPos.x

    this.nextPos.y = this.pos.y + this.speed * this.unitdir.y
    const nextYTile = window.game.entityLayer.worldToTileXY(this.pos.x, this.nextPos.y)
    if (nextYTile.y > 0 && nextYTile.y < Settings.gridSize.y - 1 && this.checkCollision({ x: entTile.x, y: nextYTile.y }) === false) this.pos.y = this.nextPos.y

    if (this.dir.x < 0) this.ss.x--; else this.ss.x++

    if (this.dir.y < -0.25 && this.dir.x < -0.25) this.ss.y = 5
    if (this.dir.y < -0.25 && Math.abs(this.dir.x) < 0.25) this.ss.y = 0
    if (this.dir.y < -0.25 && this.dir.x > 0.25) this.ss.y = 1
    if (Math.abs(this.dir.y) < 0.5 && this.dir.x < 0) this.ss.y = 6
    if (Math.abs(this.dir.y) < 0.5 && this.dir.x > 0) this.ss.y = 2
    if (this.dir.y > 0.25 && this.dir.x < -0.25) this.ss.y = 7
    if (this.dir.y > 0.25 && Math.abs(this.dir.x) < 0.25) this.ss.y = 4
    if (this.dir.y > 0.25 && this.dir.x > 0.25) this.ss.y = 3

    if (this.dir.x !== 0) Settings.curResPos.x = 0
    if (this.dir.y !== 0) Settings.curResPos.y = 0

    this.ss.x += 30
    this.ss.x %= 30
    if (this.dir.x === 0 && this.dir.y === 0) this.ss.x = 5

    if (this.pos && this.id === window.game.playerID) {
      const myMid = {}
      myMid.x = this.pos.x
      myMid.y = this.pos.y - 66
      window.game.setCenter(myMid.x, myMid.y)
      window.game.focusOn()
      if (this.dir.x !== 0 || this.dir.y !== 0) {
        this.needUpdate = true
      } else {
        // wssend(JSON.stringify({ cmd: 'updateEntity', data: { id: window.game.playerID, ent: window.game.allInvs[window.game.playerID] } }))
        this.needUpdate = false
      }
      // if (ent.needUpdate) wssend(JSON.stringify({ cmd: 'updateEntity', data: { id: window.game.playerID, ent: window.game.allInvs[window.game.playerID] } }))
    }
    //console.log(this.ss)
    // console.log(ent.pos, entTile);
  }

  draw (ctx, ent) {
    if (this.car) return
    ctx.translate(this.pos.x, this.pos.y)
    ctx.drawImage(Player.img, this.ss.x * 96, this.ss.y * 132, 96, 132, -48, -100, 96, 132)

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
    const e = Inventory.getInv(x, y)
    if (e?.type === Settings.resDB.Empty.id || e?.isBelt) {
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
      const nb = Inventory.getInv(this.tilePos.x + nbV.x, this.tilePos.y + nbV.y)
      if (nb?.type === Settings.resDB.car.id) {
        this.car = window.game.allInvs[nb.id]
      }
    }
  }

  setDir (dir) {
    if (dir.y) window.game.allInvs[window.game.playerID].dir.y = dir.y
  }

  checkCollision (pos) {
    if (window.game.terrain.map == null) return
    const terrain = Settings.resID[window.game.terrain.map[pos.x][pos.y][0]]
    if (window.classDB[terrain].playerCanWalkOn === false) return true

    const building = window.game.entityLayer.map[pos.x][pos.y]
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
          const inv = Inventory.getInv(tileCoordinate.x, tileCoordinate.y)
          const res = window.game.res.getResource(tileCoordinate)
          if (inv) {
            window.player.destructBuilding(tileCoordinate)
            window.player.stopMining(window.player)
            window.game.allInvs[window.game.playerID].addItem({id: inv.id, n: 1})
          } else if (res) {
            Inventory.mineToInv({ source: tileCoordinate, id: res.id, n: 1 })
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
    window.game.entityLayer.removeEntity(tileCoordinate)
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
