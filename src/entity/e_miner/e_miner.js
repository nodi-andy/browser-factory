import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

class ElectricalMiner extends Inventory {
  constructor (pos, data) {
    super(pos, data)
    data.pos = pos
    this.pos = pos
    this.stack = data.stack
    this.setup(undefined, data)
  }

  setup (map, ent) {
    if (this.stack == null) this.stack = {}
    if (this.stack.FUEL == null) this.stack.FUEL = []
    this.packsize = {}
    this.packsize.FUEL = 1
    const size = Settings.resDB.burner_miner.size
    for (let i = 0; i < size[0]; i++) {
      for (let j = 0; j < size[1]; j++) {
        Inventory.getInv(ent.pos.x + i, ent.pos.y + j, this.id)
      }
    }
    this.energy = 0
    this.power = 0
    this.mapsize = { x: Settings.resDB.e_miner.size[0], y: Settings.resDB.e_miner.size[1] }
  }

  update (map, ent) {
    if (this.stack.FUEL == null) this.stack.FUEL = []

    if (window.game.tick % 100 === 0) {
      this.power = 0
      if (this.stack.FUEL == null || this.stack.FUEL.length === 0) this.stack.FUEL = [Settings.item(undefined, 0)]
      let output
      let tile = wiwindow.gamendow.res.map[ent.pos.x][ent.pos.y]
      if (tile?.n === 0) tile = map[ent.pos.x + 1][ent.pos.y]

      let invTo
      if (this.dir === 0) invTo = Inventory.getInv(ent.pos.x + 2, ent.pos.y, true)
      if (this.dir === 1) invTo = Inventory.getInv(ent.pos.x + 1, ent.pos.y + 2, true)
      if (this.dir === 2) invTo = Inventory.getInv(ent.pos.x - 1, ent.pos.y + 1, true)
      if (this.dir === 3) invTo = Inventory.getInv(ent.pos.x, ent.pos.y - 1, true)
      if (tile?.n) output = Settings.resName[Settings.resName[tile.id].becomes]
      // Shift output on next tile
      let stackName
      // place into assembling machine
      if (invTo?.type === Settings.resDB.assembling_machine_1.id) stackName = Settings.resName[this.stack.INV[0].id].name
      // place onto belt
      else if (invTo?.type === classDB.Belt1.id) {
        const relDir = (invTo.dir - this.dir + 3) % 4
        const dirPref = ['L', 'R', 'L', 'R']
        stackName = dirPref[relDir]
      }

      const hasPlace = invTo.hasPlaceFor({ id: output, n: 1 }, stackName)
      const neededEnergy = Settings.resName[tile.id].E
      if (this.stack.FUEL[0]?.n > 0 && hasPlace && this.energy <= neededEnergy) {
        this.energy += Settings.resName[this.stack.FUEL[0].id].E // add time factor
        this.power = 100
        this.stack.FUEL[0].n--
        tile.n--
      }

      if (output && hasPlace && this.energy > neededEnergy) {
        this.power = 100
        this.energy -= neededEnergy // add time factor
        invTo.addItem({ id: output.id, n: 1 }, stackName)
      }
    }
  }

  updateNB () {
    this.nbInputs = []

    const scanArea = { x: this.pos.x - 1, y: this.pos.y - 1, x2: this.pos.x + this.mapsize.x + 2, y2: this.pos.y + this.mapsize.y + 2 }
    for (let x = scanArea.x; x < scanArea.x2; x++) {
      for (let y = scanArea.y; y < scanArea.y2; y++) {
        const nb = Inventory.getInv(x, y)
        if (nb?.id === this.id) continue
        if (nb?.type === Settings.resDB.pole.id && this.nbInputs.includes(nb.id) === false) this.nbInputs.push(nb.id)
      }
    }
  }

  draw (ctx, ent) {
    const db = Settings.resDB.burner_miner
    ctx.save()
    ctx.drawImage(db.anim1, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize)
    ctx.fillStyle = 'black'
    ctx.fillRect(Settings.tileSize * 1.75, Settings.tileSize * 0.5, Settings.tileSize / 4, Settings.tileSize / 4)
    ctx.translate(Settings.tileSize, Settings.tileSize)

    if (this.pos?.x) {
      if (this.power) ctx.rotate((window.game.tick / 100) % (2 * Math.PI))
    }
    ctx.translate(-Settings.tileSize, -Settings.tileSize)
    ctx.drawImage(db.anim2, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize)
    ctx.restore()
  }
}

const db = Settings.resDB.e_miner = {}
db.mach = ElectricalMiner
db.name = 'electrical miner'
db.lock = 1
db.type = 'entity'
db.cost = [{ id: "StoneFurnace", n: 1 }, { id: "IronPlate", n: 3 }, { id: "Gear", n: 2 }]
if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './' + db.type + '/burner_miner/platform.png'
  db.anim1 = image
}
if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './' + db.type + '/burner_miner/drill.png'
  db.anim2 = image
}
db.size = [2, 2]
export { ElectricalMiner }
