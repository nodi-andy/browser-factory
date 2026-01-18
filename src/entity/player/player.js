import { Settings, toUnitV } from '../../common.js'
import { Inventory } from '../../core/inventory.js'
import * as NC from 'nodicanvas'

export class Player extends Inventory {
  static type = 'entity'
  static P = 100
  static name = "Player"
  constructor (pos, data) {
    if (data == null) {
      data = {
        tilePos: new NC.Vec2(game.entityLayer.gridSize.x / 2, game.entityLayer.gridSize.y / 2),
      }
      data.pos = game.entityLayer.tileToWorld(data.tilePos)
    }

    super(data.tilePos, data)

    this.tilePos = data.tilePos
    this.pos = data.pos
    if (data.stack) this.stack = data.stack
    this.setup()
  }

  setup (map, inv) {
    this.stack.INV.maxlen = 64
    if (this.tilePos == null) {
      this.tilePos = new NC.Vec2(game.entityLayer.gridSize.x / 2, game.entityLayer.gridSize.y / 2)
    }
    if (this.pos?.x == null || this.pos?.y == null) {
      this.pos = game.entityLayer.tileToWorld(this.tilePos)
    }
    if (this.pos?.x == null || this.pos?.y == null) {
      this.pos = { x: 0, y: 0 }
    }
    this.output = ["Wood", "StoneFurnace", "BurnerMiner", "Chest", "IronStick", "Gear", "HydraulicPiston", "Belt1", "Belt2", "Belt3", "Inserter", "InserterLong", "InserterSmart", "CopperCable", "Circuit", "AssemblingMachine1", "AssemblingMachine2", "AssemblingMachine3", "Car"]
    this.name = "Player"
    this.dir = { x: 0, y: 0 }
    this.live = 100
    this.nextPos = { x: 0, y: 0 }
    this.type = classDB.Player.id
    this.movable = true
    this.speed = 5

    this.ss = { x: 0, y: 0 }
    this.workProgress = 0
    this.miningTimer = 0
    this.invID = 0
  }

  update (map, ent) {
    this.tilePos = game.entityLayer.worldToTile(this.pos)
    while (this.checkCollision(this.tilePos)) {
      this.tilePos.x++
      this.pos = { x: this.tilePos.x * Settings.tileSize, y: this.tilePos.y * Settings.tileSize }
    }

    this.unitdir = toUnitV(this.dir)
    const entTile = game.entityLayer.worldToTile(this.pos)

    const entMap = game.entityLayer.getInv(entTile.x, entTile.y)
    if (entMap?.isBelt) {
      this.pos.x += Settings.dirToVec[entMap.dir].x * window.classDB[entMap.name].speed
      this.pos.y += Settings.dirToVec[entMap.dir].y * window.classDB[entMap.name].speed
    }

    if (this.speed != 0 && this.car == null) {
      this.nextPos.x = this.pos.x + this.speed * this.unitdir.x
      const nextXTile = game.entityLayer.worldToTileXY(this.nextPos.x, this.pos.y)
      if (nextXTile.x > 0 && nextXTile.x < Settings.gridSize.x - 1 && this.checkCollision({ x: nextXTile.x, y: entTile.y }) === false) this.pos.x = this.nextPos.x

      this.nextPos.y = this.pos.y + this.speed * this.unitdir.y
      const nextYTile = game.entityLayer.worldToTileXY(this.pos.x, this.nextPos.y)
      if (nextYTile.y > 0 && nextYTile.y < Settings.gridSize.y - 1 && this.checkCollision({ x: entTile.x, y: nextYTile.y }) === false) this.pos.y = this.nextPos.y
    }

    if (this.car) {
      let c = game.allInvs[this.car]
      this.tilePos = {x: c.pos.x, y: c.pos.y}
      this.pos = { x: c.mapPos.x, y: c.mapPos.y }
    }

    if (this.pos && this.id === game.playerID && (this.speed != 0 || this.car?.speed != 0)) {
      game.setCenter(this.pos.x, this.pos.y - 66)
      game.focusOn()
    }



    if (this.dir.x < 0) this.ss.x--; else this.ss.x++

    if (this.dir.y < -0.25 && this.dir.x < -0.25) this.ss.y = 5
    if (this.dir.y < -0.25 && Math.abs(this.dir.x) < 0.25) this.ss.y = 0
    if (this.dir.y < -0.25 && this.dir.x > 0.25) this.ss.y = 1
    if (Math.abs(this.dir.y) < 0.5 && this.dir.x < 0) this.ss.y = 6
    if (Math.abs(this.dir.y) < 0.5 && this.dir.x > 0) this.ss.y = 2
    if (this.dir.y > 0.25 && this.dir.x < -0.25) this.ss.y = 7
    if (this.dir.y > 0.25 && Math.abs(this.dir.x) < 0.25) this.ss.y = 4
    if (this.dir.y > 0.25 && this.dir.x > 0.25) this.ss.y = 3

    if (this.dir.x !== 0) window.curResPos.x = 0
    if (this.dir.y !== 0) window.curResPos.y = 0

    this.ss.x += 30
    this.ss.x %= 30
    if (this.dir.x === 0 && this.dir.y === 0) this.ss.x = 5




    //console.log(this.ss)
    // console.log(ent.pos, entTile);
  }

  draw (ctx, ent) {
    if (this.car != null) return
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
      game.allInvs[this.car].onKeyDown(e)
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
      game.allInvs[this.car].onKeyUp(e)
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
    const e = game.entityLayer.getInv(x, y)
    if (e?.type === classDB.Empty.id || e?.isBelt) {
      const pickedItem = e.getItem()
      e.moveItemTo({id: pickedItem, n:1}, this)
      if (pickedItem?.reserved === true) pickedItem.reserved = false
    }
  }

  enterCar () {
    if (this.car) {
      game.allInvs[this.car].speed = 0
      this.car = undefined
      return
    }

    for (const nbV of Settings.nbVec) {
      const nb = game.entityLayer.getInv(this.tilePos.x + nbV.x, this.tilePos.y + nbV.y)
      if (nb?.type === classDB.Car.id) {
        this.car = nb.id
      }
    }
  }

  setDir (dir) {
    if (dir.y) game.allInvs[game.playerID].dir.y = dir.y
  }

  checkCollision (pos) {
    if (game.terrain.map == null) return
    const terrain = classDBi[game.terrain.map[pos.x][pos.y][0]]
    if (terrain.playerCanWalkOn === false) return true

    const building = game.entityLayer.map[pos.x][pos.y]
    if (building == null) return false
    const buildingType = game.allInvs[building]?.type
    if (buildingType) {
      const canWalk = classDBi[buildingType].playerCanWalkOn
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
          const inv = game.entityLayer.getInv(tileCoordinate.x, tileCoordinate.y)
          const res = game.res.getResource(tileCoordinate)
          if (inv) {
            window.player.destructBuilding(tileCoordinate)
            window.player.stopMining(window.player)
            game.allInvs[game.playerID].addItem({id: inv.id, n: 1})
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
    game.entityLayer.removeEntity(tileCoordinate)
  }

  setInventory (newInv, newID) {
    game.allInvs[this.invID].stack = JSON.parse(JSON.stringify(newInv.stack))
    game.allInvs[this.invID].packsize = newInv.packsize

    const currentID = game.allInvs[this.invID].id
    if (newInv.id !== undefined) {
      this.invID = newInv.id; game.allInvs[this.invID].id = newID
    } else if (newID !== undefined) { this.invID = newID; game.allInvs[this.invID].id = newID }

    if (game.allInvs[this.invID].id == null) game.allInvs[this.invID].id = currentID
    game.updateInventoryMenu(this.inv)
  }

  setInventoryID (newID) {
    this.invID = newID

    game.updateInventoryMenu(this.inv)
  }
}
