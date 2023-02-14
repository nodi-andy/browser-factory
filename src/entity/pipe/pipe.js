import { Settings } from '../../common.js'
import { Inventory, invfuncs } from '../../core/inventory.js'

class Pipe extends Inventory {
  constructor (pos, data) {
    super(pos, data)
    this.setup(undefined, data)
  }

  setup (map, ent) {
    this.stacksize = 8
    this.packsize = {}
    this.packsize.INV = 1

    if (this.stack.INV == null) this.stack.INV = [{ n: 0 }]
    this.mapsize = { x: Settings.resDB.pipe.size[0], y: Settings.resDB.pipe.size[1] }
    this.nbInputs = []
  }

  update (map, ent) {
    if (window.game.tick % 100) return

    if (this.nbInputs.length === 0 || this.stack.INV[0].n === 0) return

    // INPUT
    let total = 0
    let nSameType = 0
    for (const nbID of this.nbInputs) {
      const n = window.game.allInvs[nbID]
      if (n == null) continue
      if (n.stack.INV[0].id == null) n.stack.INV[0].id = this.stack.INV[0].id
      if (n.stack.INV[0].id === this.stack.INV[0].id) {
        total += n.stack.INV[0].n
        nSameType++
      }
    }
    nSameType++
    total += this.stack.INV[0].n

    // PROCESS
    const medVal = Math.floor(total / nSameType)

    // OUTPUT
    for (const nbID of this.nbInputs) {
      const n = window.game.allInvs[nbID]
      if (n == null) continue
      if (n.stack.INV[0].id === this.stack.INV[0].id) {
        n.stack.INV[0].n = medVal
      }
    }
    this.stack.INV[0].n = medVal
    const rest = total - (medVal * nSameType)
    this.stack.INV[0].n += rest
  }

  updateNB () {
    this.nbInputs = []
    let nbr = invfuncs.getInv(this.pos.x + 1, this.pos.y + 0)
    let nbl = invfuncs.getInv(this.pos.x - 1, this.pos.y + 0)
    let nbu = invfuncs.getInv(this.pos.x + 0, this.pos.y - 1)
    let nbd = invfuncs.getInv(this.pos.x + 0, this.pos.y + 1)
    if (!(nbr?.type === Settings.resDB.pipe.id || nbr?.type === Settings.resDB.boiler.id)) nbr = undefined
    if (!(nbl?.type === Settings.resDB.pipe.id || nbl?.type === Settings.resDB.boiler.id)) nbl = undefined
    if (!(nbu?.type === Settings.resDB.pipe.id || nbu?.type === Settings.resDB.boiler.id)) nbu = undefined
    if (!(nbd?.type === Settings.resDB.pipe.id || nbd?.type === Settings.resDB.boiler.id)) nbd = undefined

    const nbs = [nbr, nbl, nbu, nbd]
    for (const nb of nbs) {
      if ((nb?.type === Settings.resDB.pipe.id || nb?.type === Settings.resDB.boiler.id) && this.nbInputs.includes(nb.id) === false) this.nbInputs.push(nb.id)
    }

    this.img = Settings.resDB.pipe.sh
    this.imgMirror = false
    switch (this.nbInputs.length) {
      case 1:
        if (nbd) this.img = Settings.resDB.pipe.enddown
        else if (nbu) this.img = Settings.resDB.pipe.endup
        else if (nbl) this.img = Settings.resDB.pipe.endright
        else if (nbr) this.img = Settings.resDB.pipe.endleft
        break // is that right?
      case 2:
        if (nbl && nbr) this.img = Settings.resDB.pipe.sh
        else if (nbd && nbu) this.img = Settings.resDB.pipe.sv
        else if (nbl && nbu) this.img = Settings.resDB.pipe.crd
        else if (nbr && nbu) this.img = Settings.resDB.pipe.cld
        else if (nbl && nbd) this.img = Settings.resDB.pipe.cru
        else if (nbr && nbd) this.img = Settings.resDB.pipe.clu

        break
      case 3:
        if (nbd == null) this.img = Settings.resDB.pipe.tup
        else if (nbu == null) this.img = Settings.resDB.pipe.tdown
        else if (nbl == null) this.img = Settings.resDB.pipe.tright
        else if (nbr == null) this.img = Settings.resDB.pipe.tleft
        break
      case 4: this.img = Settings.resDB.pipe.cross
        break
    }
  }

  draw (ctx, ent) {
    let img = this.img
    if (ent) img = Settings.resDB.pipe.sh
    ctx.drawImage(img, 0, 0, db.size[0] * Settings.tileSize / 2, db.size[1] * Settings.tileSize / 2, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize)
  }

  drawItems (ctx) {
    if (this.pos && this.stack) {
      ctx.save()
      ctx.translate((this.pos.x + 0.5) * Settings.tileSize, (this.pos.y + 0.5) * Settings.tileSize)
      ctx.rotate(this.dir * Math.PI / 2)
      ctx.translate(-Settings.tileSize / 2, -Settings.tileSize / 2)

      ctx.restore()
    }
  }
}

const db = Settings.resDB.pipe
db.name = 'pipe'
db.type = 'entity'
db.lock = 1
db.playerCanWalkOn = false
db.rotatable = false
db.size = [1, 1]
db.cost = [
  { id: Settings.resDB.iron_plate.id, n: 1 }
]

if (typeof Image !== 'undefined') {
  let image = new Image(32, 32)
  image.src = './src/' + Settings.resDB.pipe.type + '/pipe/pipe-straight-horizontal.png'
  Settings.resDB.pipe.sh = image

  image = new Image(32, 32)
  image.src = './src/' + Settings.resDB.pipe.type + '/pipe/pipe-straight-vertical.png'
  Settings.resDB.pipe.sv = image

  image = new Image(32, 32)
  image.src = './src/' + Settings.resDB.pipe.type + '/pipe/pipe-cross.png'
  Settings.resDB.pipe.cross = image

  image = new Image(32, 32)
  image.src = './src/' + Settings.resDB.pipe.type + '/pipe/pipe-ending-up.png'
  Settings.resDB.pipe.endup = image

  image = new Image(32, 32)
  image.src = './src/' + Settings.resDB.pipe.type + '/pipe/pipe-ending-down.png'
  Settings.resDB.pipe.enddown = image

  image = new Image(32, 32)
  image.src = './src/' + Settings.resDB.pipe.type + '/pipe/pipe-ending-left.png'
  Settings.resDB.pipe.endleft = image

  image = new Image(32, 32)
  image.src = './src/' + Settings.resDB.pipe.type + '/pipe/pipe-ending-right.png'
  Settings.resDB.pipe.endright = image

  image = new Image(32, 32)
  image.src = './src/' + Settings.resDB.pipe.type + '/pipe/pipe-t-right.png'
  Settings.resDB.pipe.tright = image

  image = new Image(32, 32)
  image.src = './src/' + Settings.resDB.pipe.type + '/pipe/pipe-t-left.png'
  Settings.resDB.pipe.tleft = image

  image = new Image(32, 32)
  image.src = './src/' + Settings.resDB.pipe.type + '/pipe/pipe-t-up.png'
  Settings.resDB.pipe.tup = image

  image = new Image(32, 32)
  image.src = './src/' + Settings.resDB.pipe.type + '/pipe/pipe-t-down.png'
  Settings.resDB.pipe.tdown = image

  image = new Image(32, 32)
  image.src = './src/' + Settings.resDB.pipe.type + '/pipe/pipe-corner-left-down.png'
  Settings.resDB.pipe.cld = image

  image = new Image(32, 32)
  image.src = './src/' + Settings.resDB.pipe.type + '/pipe/pipe-corner-left-up.png'
  Settings.resDB.pipe.clu = image

  image = new Image(32, 32)
  image.src = './src/' + Settings.resDB.pipe.type + '/pipe/pipe-corner-right-down.png'
  Settings.resDB.pipe.crd = image

  image = new Image(32, 32)
  image.src = './src/' + Settings.resDB.pipe.type + '/pipe/pipe-corner-right-up.png'
  Settings.resDB.pipe.cru = image
}

db.mach = Pipe
export { Pipe }
