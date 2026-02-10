import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

export class BurnerMiner extends Inventory {
  static type = 'entity'
  static size = [2, 2]
  static viewsize = [2, 2.5]
  static cost = [{ id: "StoneFurnace", n: 1 }, { id: "IronPlate", n: 3 }, { id: "Gear", n: 2 }]
  static rotatable = true
  static imgName = 'burner_miner'

  constructor (pos, data) {
    super(pos, data)
    data.pos = pos
    this.name = "BurnerMiner"
    this.pos = pos
    this.stack = data.stack
    this.setup(undefined, data)
  }

  setup (map, ent) {
    if (this.stack == null) this.stack = {}
    this.stack.FUEL = Inventory.normalizeStack(this.stack.FUEL, { maxlen: 1, packsize: 50 })
    const size = BurnerMiner.size
    for (let i = 0; i < size[0]; i++) {
      for (let j = 0; j < size[1]; j++) {
        game.entityLayer.setInv(ent.pos.x + i, ent.pos.y + j, this.id)
      }
    }
    this.energy = 0
    this.power = 0
  }

  update (map, ent) {
    this.stack.FUEL = Inventory.normalizeStack(this.stack.FUEL, { maxlen: 1, packsize: 50 })
    if (this.stack.FUEL.packs[0]?.n === 0) this.stack.FUEL.packs.splice(0, 1)
    let fuel = this.stack.FUEL.packs[0]
    if (fuel == null) { this.power = 0; return;}

    if (game.tick % 100 === 0) {
      this.power = 0
      let output
      let tile =  game.res.getResource(ent.pos)
      if (tile?.n == null || tile?.n == 0) tile = game.res.getResourceXY(ent.pos.x + 1, ent.pos.y)
      if (tile?.n == null || tile?.n == 0) tile = game.res.getResourceXY(ent.pos.x, ent.pos.y + 1)
      if (tile?.n == null || tile?.n == 0) tile = game.res.getResourceXY(ent.pos.x + 1, ent.pos.y + 1)
      if (tile?.n == null || tile?.n == 0) tile = game.res.getResourceXY(ent.pos.x - 1, ent.pos.y - 1)
      if (tile?.n == null || tile?.n == 0) tile = game.res.getResourceXY(ent.pos.x, ent.pos.y - 1)
      if (tile?.n == null || tile?.n == 0) tile = game.res.getResourceXY(ent.pos.x + 1, ent.pos.y - 1)
      if (tile?.n == null || tile?.n == 0) tile = game.res.getResourceXY(ent.pos.x + 2, ent.pos.y - 1)
      if (tile?.n == null || tile?.n == 0) tile = game.res.getResourceXY(ent.pos.x - 1, ent.pos.y)
      if (tile?.n == null || tile?.n == 0) tile = game.res.getResourceXY(ent.pos.x + 2, ent.pos.y)
      if (tile?.n == null || tile?.n == 0) tile = game.res.getResourceXY(ent.pos.x - 1, ent.pos.y + 1)
      if (tile?.n == null || tile?.n == 0) tile = game.res.getResourceXY(ent.pos.x + 2, ent.pos.y + 1)
      if (tile?.n == null || tile?.n == 0) tile = game.res.getResourceXY(ent.pos.x - 1, ent.pos.y + 2)
      if (tile?.n == null || tile?.n == 0) tile = game.res.getResourceXY(ent.pos.x, ent.pos.y + 2)
      if (tile?.n == null || tile?.n == 0) tile = game.res.getResourceXY(ent.pos.x + 1, ent.pos.y + 2)
      if (tile?.n == null || tile?.n == 0) tile = game.res.getResourceXY(ent.pos.x + 2, ent.pos.y + 2)
      if (tile?.n == null || tile?.n == 0) return

      let invTo
      if (this.dir === 0) invTo = game.entityLayer.getInv(ent.pos.x + 2, ent.pos.y, true)
      if (this.dir === 1) invTo = game.entityLayer.getInv(ent.pos.x + 1, ent.pos.y + 2, true)
      if (this.dir === 2) invTo = game.entityLayer.getInv(ent.pos.x - 1, ent.pos.y + 1, true)
      if (this.dir === 3) invTo = game.entityLayer.getInv(ent.pos.x, ent.pos.y - 1, true)
      if (invTo == null) return

      if (tile?.n) output = classDB[classDBi[tile.id].becomes]
      // Shift output on next tile
      let stackName
      // place into assembling machine
      if (invTo?.type === classDB.AssemblingMachine1?.id) stackName = classDBi[this.stack.INV.packs[0].id].name
      // place onto belt
      else if (invTo?.isBelt) {
        const relDir = (invTo.dir - this.dir + 4) % 4
        const dirPref = ['L', 'R', 'L', 'L']
        stackName = dirPref[relDir]
      }

      const hasPlace = invTo.hasPlaceFor({ id: output.id, n: 1 }, stackName)
      const neededEnergy = classDBi[tile.id].W
      if (fuel.n > 0 && hasPlace && this.energy <= neededEnergy) {
        this.energy += classDBi[fuel.id].E // add time factor
        this.power = 100
        fuel.n--
      }
      
      if (output && hasPlace && this.energy > neededEnergy) {
        this.power = 100
        this.energy -= neededEnergy // add time factor
        invTo.addItem({ id: output.id, n: 1 }, stackName)
        tile.n--
        game.res.updateOffscreenMap()
      }
    }
  }

  draw (ctx, ent) {
    ctx.save()
    ctx.drawImage(BurnerMiner.anim1, 0, 0, BurnerMiner.size[0] * Settings.tileSize, BurnerMiner.size[1] * Settings.tileSize, 0, 0, BurnerMiner.size[0] * Settings.tileSize, BurnerMiner.size[1] * Settings.tileSize)
    ctx.fillStyle = 'black'
    ctx.fillRect(Settings.tileSize * 1.75, Settings.tileSize * 0.5, Settings.tileSize / 4, Settings.tileSize / 4)
    ctx.translate(Settings.tileSize, Settings.tileSize)

    if (this.pos?.x) {
      if (this.power) ctx.rotate((game.tick / 100) % (2 * Math.PI))
    }
    ctx.translate(-Settings.tileSize, -Settings.tileSize)
    ctx.drawImage(BurnerMiner.anim2, 0, 0, BurnerMiner.size[0] * Settings.tileSize, BurnerMiner.size[1] * Settings.tileSize, 0, 0, BurnerMiner.size[0] * Settings.tileSize, BurnerMiner.size[1] * Settings.tileSize)
    ctx.restore()
  }
}

if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './' + BurnerMiner.type + '/burner_miner/platform.png'
  BurnerMiner.anim1 = image
}

if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './' + BurnerMiner.type + '/burner_miner/drill.png'
  BurnerMiner.anim2 = image
}
