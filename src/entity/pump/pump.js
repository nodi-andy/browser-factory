import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

export class Pump extends Inventory {
  constructor (pos, data) {
    super(pos, data)
    data.pos = pos
    this.pos = pos
    this.stack = data.stack
    this.setup(undefined, data)
    this.nbPipes = []
  }

  setup (map, ent) {
    if (this.stack == null) this.stack = {}
    this.packsize = {}
    this.packsize.OUTPUT = 1
    /* this.mapsize = {x: classDB.generator.size[0], y: classDB.generator.size[1]};
        if (this.dir === 1 || this.dir === 3) this.mapsize = {x: classDB.generator.size[1], y: classDB.generator.size[0]};
        for(let i = 0; i < this.mapsize.x; i++) {
            for(let j = 0; j < this.mapsize.y; j++) {
                inventory.setInv(this.pos.x + i, this.pos. y + j, this.id);
            }
        } */
  }

  update (map, ent) {
    if (this.stack.OUTPUT == null) this.stack.OUTPUT = [{ id: classDB.water.id, n: 0 }]
    const output = this.stack.OUTPUT[0]
    if (game.tick % 10 === 0 && output?.n < 100) {
      output.n += 1
    }

    if (this.nbPipes.length === 0) return
    if (this.nbPipes[0].stack.INV[0].id == null) this.nbPipes[0].stack.INV[0].id = output.id
    if (this.nbPipes[0].stack.INV[0].id === output.id) {
      const total = output.n + this.nbPipes[0].stack.INV[0].n
      const medVal = Math.floor(total / 2)
      this.nbPipes[0].stack.INV[0].n = medVal
      this.stack.OUTPUT[0].n = total - medVal
    }
  }

  updateNB () {
    const nbPos = Settings.dirToVec[(this.dir + 1) % 4]
    const nbPipe = game.entityLayer.getInv(this.pos.x - nbPos.x, this.pos.y - nbPos.y)
    this.nbPipes = []
    if (nbPipe) this.nbPipes.push(nbPipe)
  }

  draw (ctx, ent) {
    const mapSize = classDB.pump.size
    const viewSize = classDB.pump.viewsize
    ctx.drawImage(classDB.pump.img, 0, 0, Settings.tileSize, Settings.tileSize, 0, -(viewSize[1] - mapSize[1]) * Settings.tileSize, viewSize[0] * Settings.tileSize, viewSize[1] * Settings.tileSize)
  }
}

const db = Pump
db.type = 'entity'
db.lock = 1
db.cost = [{ id: "IronPlate", n: 3 }]
if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './' + db.type + '/pump/pump.png'
  db.anim1 = image
}
db.size = [1, 2]
db.viewsize = [1, 2]
