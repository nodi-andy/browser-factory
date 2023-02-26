import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

export class Pipe extends Inventory {
  constructor (pos, data) {
    super(pos, data)
    this.setup(undefined, data)
  }

  setup (map, ent) {
    this.stacksize = 8
    this.packsize = {}
    this.packsize.INV = 1

    if (this.stack.INV == null) this.stack.INV = [{ n: 0 }]
    this.mapsize = { x: Pipe.size[0], y: Pipe.size[1] }
    this.nbInputs = []
  }

  update (map, ent) {
    if (game.tick % 100) return

    if (this.nbInputs.length === 0 || this.stack.INV[0].n === 0) return

    // INPUT
    let total = 0
    let nSameType = 0
    for (const nbID of this.nbInputs) {
      const n = game.allInvs[nbID]
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
      const n = game.allInvs[nbID]
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
    let nbr = game.entityLayer.getInv(this.pos.x + 1, this.pos.y + 0)
    let nbl = game.entityLayer.getInv(this.pos.x - 1, this.pos.y + 0)
    let nbu = game.entityLayer.getInv(this.pos.x + 0, this.pos.y - 1)
    let nbd = game.entityLayer.getInv(this.pos.x + 0, this.pos.y + 1)
    if (!(nbr?.type === Pipe.id || nbr?.type === classDB.boiler.id)) nbr = undefined
    if (!(nbl?.type === Pipe.id || nbl?.type === classDB.boiler.id)) nbl = undefined
    if (!(nbu?.type === Pipe.id || nbu?.type === classDB.boiler.id)) nbu = undefined
    if (!(nbd?.type === Pipe.id || nbd?.type === classDB.boiler.id)) nbd = undefined

    const nbs = [nbr, nbl, nbu, nbd]
    for (const nb of nbs) {
      if ((nb?.type === Pipe.id || nb?.type === classDB.boiler.id) && this.nbInputs.includes(nb.id) === false) this.nbInputs.push(nb.id)
    }

    this.img = Pipe.sh
    this.imgMirror = false
    switch (this.nbInputs.length) {
      case 1:
        if (nbd) this.img = Pipe.enddown
        else if (nbu) this.img = Pipe.endup
        else if (nbl) this.img = Pipe.endright
        else if (nbr) this.img = Pipe.endleft
        break // is that right?
      case 2:
        if (nbl && nbr) this.img = Pipe.sh
        else if (nbd && nbu) this.img = Pipe.sv
        else if (nbl && nbu) this.img = Pipe.crd
        else if (nbr && nbu) this.img = Pipe.cld
        else if (nbl && nbd) this.img = Pipe.cru
        else if (nbr && nbd) this.img = Pipe.clu

        break
      case 3:
        if (nbd == null) this.img = Pipe.tup
        else if (nbu == null) this.img = Pipe.tdown
        else if (nbl == null) this.img = Pipe.tright
        else if (nbr == null) this.img = Pipe.tleft
        break
      case 4: this.img = Pipe.cross
        break
    }
  }

  draw (ctx, ent) {
    let img = this.img
    if (ent) img = Pipe.sh
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

const db = Pipe
db.type = 'entity'
db.playerCanWalkOn = false
db.rotatable = false
db.size = [1, 1]
db.cost = [
  { id: "IronPlate", n: 1 }
]

if (typeof Image !== 'undefined') {
  let image = new Image(32, 32)
  image.src = './' + Pipe.type + '/pipe/pipe-straight-horizontal.png'
  Pipe.sh = image

  image = new Image(32, 32)
  image.src = './' + Pipe.type + '/pipe/pipe-straight-vertical.png'
  Pipe.sv = image

  image = new Image(32, 32)
  image.src = './' + Pipe.type + '/pipe/pipe-cross.png'
  Pipe.cross = image

  image = new Image(32, 32)
  image.src = './' + Pipe.type + '/pipe/pipe-ending-up.png'
  Pipe.endup = image

  image = new Image(32, 32)
  image.src = './' + Pipe.type + '/pipe/pipe-ending-down.png'
  Pipe.enddown = image

  image = new Image(32, 32)
  image.src = './' + Pipe.type + '/pipe/pipe-ending-left.png'
  Pipe.endleft = image

  image = new Image(32, 32)
  image.src = './' + Pipe.type + '/pipe/pipe-ending-right.png'
  Pipe.endright = image

  image = new Image(32, 32)
  image.src = './' + Pipe.type + '/pipe/pipe-t-right.png'
  Pipe.tright = image

  image = new Image(32, 32)
  image.src = './' + Pipe.type + '/pipe/pipe-t-left.png'
  Pipe.tleft = image

  image = new Image(32, 32)
  image.src = './' + Pipe.type + '/pipe/pipe-t-up.png'
  Pipe.tup = image

  image = new Image(32, 32)
  image.src = './' + Pipe.type + '/pipe/pipe-t-down.png'
  Pipe.tdown = image

  image = new Image(32, 32)
  image.src = './' + Pipe.type + '/pipe/pipe-corner-left-down.png'
  Pipe.cld = image

  image = new Image(32, 32)
  image.src = './' + Pipe.type + '/pipe/pipe-corner-left-up.png'
  Pipe.clu = image

  image = new Image(32, 32)
  image.src = './' + Pipe.type + '/pipe/pipe-corner-right-down.png'
  Pipe.crd = image

  image = new Image(32, 32)
  image.src = './' + Pipe.type + '/pipe/pipe-corner-right-up.png'
  Pipe.cru = image
}
