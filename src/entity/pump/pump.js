import { Settings } from '../../common.js'
import { Inventory, invfuncs } from '../../core/inventory.js'

class Pump extends Inventory {
  constructor (pos, data) {
    super(pos, data)
    data.pos = pos
    this.pos = pos
    this.stack = data.stack
    this.setup(undefined, data)
    this.nbPipes = []
  }

  setup (map, ent) {
    if (this.stack === undefined) this.stack = {}
    this.packsize = {}
    this.packsize.OUTPUT = 1
    /* this.mapsize = {x: Settings.resDB.generator.size[0], y: Settings.resDB.generator.size[1]};
        if (this.dir === 1 || this.dir === 3) this.mapsize = {x: Settings.resDB.generator.size[1], y: Settings.resDB.generator.size[0]};
        for(let i = 0; i < this.mapsize.x; i++) {
            for(let j = 0; j < this.mapsize.y; j++) {
                inventory.setInv(this.pos.x + i, this.pos. y + j, this.id);
            }
        } */
  }

  update (map, ent) {
    if (this.stack.OUTPUT === undefined) this.stack.OUTPUT = [{ id: Settings.resDB.water.id, n: 0 }]
    const output = this.stack.OUTPUT[0]
    if (Settings.game.tick % 10 === 0 && output?.n < 100) {
      output.n += 1
    }

    if (this.nbPipes.length === 0) return
    if (this.nbPipes[0].stack.INV[0].id === undefined) this.nbPipes[0].stack.INV[0].id = output.id
    if (this.nbPipes[0].stack.INV[0].id === output.id) {
      const total = output.n + this.nbPipes[0].stack.INV[0].n
      const medVal = Math.floor(total / 2)
      this.nbPipes[0].stack.INV[0].n = medVal
      this.stack.OUTPUT[0].n = total - medVal
    }
  }

  updateNB () {
    const nbPos = Settings.dirToVec[(this.dir + 1) % 4]
    const nbPipe = invfuncs.getInv(this.pos.x - nbPos.x, this.pos.y - nbPos.y)
    this.nbPipes = []
    if (nbPipe) this.nbPipes.push(nbPipe)
  }

  draw (ctx, ent) {
    const mapSize = Settings.resDB.pump.size
    const viewSize = Settings.resDB.pump.viewsize
    ctx.drawImage(Settings.resDB.pump.img, 0, 0, Settings.tileSize, Settings.tileSize, 0, -(viewSize[1] - mapSize[1]) * Settings.tileSize, viewSize[0] * Settings.tileSize, viewSize[1] * Settings.tileSize)
  }
}

const db = Settings.resDB.pump
db.mach = Pump
db.type = 'entity'
db.cost = [{ id: Settings.resDB.iron_plate.id, n: 3 }]
if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './src/' + db.type + '/pump/pump.png'
  db.anim1 = image
}
db.size = [1, 2]
db.viewsize = [1, 2]

export { Pump }
