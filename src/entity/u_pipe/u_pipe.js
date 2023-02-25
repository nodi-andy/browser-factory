import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

export class UPipe extends Inventory {
  constructor (pos, data) {
    super(pos, data)
    this.setup(undefined, data)
  }

  setup (map, ent) {
    this.stacksize = 8
    this.packsize = {}
    this.packsize.INV = 1

    if (this.stack.INV == null) this.stack.INV = [{ n: 0 }]
    this.mapsize = { x: classDB.pipe.size[0], y: classDB.pipe.size[1] }
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
    if (!(nbr?.type === classDB.pipe.id || nbr?.type === classDB.boiler.id)) nbr = undefined
    if (!(nbl?.type === classDB.pipe.id || nbl?.type === classDB.boiler.id)) nbl = undefined
    if (!(nbu?.type === classDB.pipe.id || nbu?.type === classDB.boiler.id)) nbu = undefined
    if (!(nbd?.type === classDB.pipe.id || nbd?.type === classDB.boiler.id)) nbd = undefined

    const nbs = [nbr, nbl, nbu, nbd]
    for (const nb of nbs) {
      if ((nb?.type === classDB.pipe.id || nb?.type === classDB.boiler.id) && this.nbInputs.includes(nb.id) === false) this.nbInputs.push(nb.id)
    }

    this.img = classDB.pipe.sh
    this.imgMirror = false
    switch (this.nbInputs.length) {
      case 1:
        if (nbd) this.img = classDB.pipe.enddown
        else if (nbu) this.img = classDB.pipe.endup
        else if (nbl) this.img = classDB.pipe.endright
        else if (nbr) this.img = classDB.pipe.endleft
        break // is that right?
      case 2:
        if (nbl && nbr) this.img = classDB.pipe.sh
        else if (nbd && nbu) this.img = classDB.pipe.sv
        else if (nbl && nbu) this.img = classDB.pipe.crd
        else if (nbr && nbu) this.img = classDB.pipe.cld
        else if (nbl && nbd) this.img = classDB.pipe.cru
        else if (nbr && nbd) this.img = classDB.pipe.clu

        break
      case 3:
        if (nbd == null) this.img = classDB.pipe.tup
        else if (nbu == null) this.img = classDB.pipe.tdown
        else if (nbl == null) this.img = classDB.pipe.tright
        else if (nbr == null) this.img = classDB.pipe.tleft
        break
      case 4: this.img = classDB.pipe.cross
        break
    }
  }

  draw (ctx, ent) {
    let img = this.img
    if (ent) img = classDB.pipe.sh
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

const db = UPipe
db.type = 'entity'
db.playerCanWalkOn = false
db.rotatable = false
db.size = [1, 1]
db.cost = [
  { id: "IronPlate", n: 1 }
]

if (typeof Image !== 'undefined') {
  const image = new Image(32, 32)
  image.src = './' + UPipe.type + '/u_pipe/u_pipe.png'
  UPipe.img = image
}
