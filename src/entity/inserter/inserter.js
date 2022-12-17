import { resDB, getInv, dirToVec } from '../../common.js'

class Inserter {
  constructor () {
    resDB.inserter.Mach = this
  }

  update (map, ent) {
    const nbPos = dirToVec[ent.dir]
    const invFrom = getInv(ent.pos.x - nbPos.x, ent.pos.y - nbPos.y)
    const invThis = getInv(ent.pos.x, ent.pos.y)
    const invTo = getInv(ent.pos.x + nbPos.x, ent.pos.y + nbPos.y)

    const iOut = invFrom.getOutputPackIndex()

    // PICK
    if (invThis.packs.length === 0 && invFrom && iOut !== undefined && invFrom.packs.length) {
      if (invThis.addItem({ id: invFrom.packs[iOut].id, n: 1 })) {
        invFrom.remItem({ id: invFrom.packs[iOut].id, n: 1, fixed: invFrom.packs[iOut].fixed })
      }
    } else if (invThis.packs.length) { // PLACE
      if (invTo.addItem({ id: invThis.packs[0].id, n: 1 })) {
        invThis.remItem({ id: invThis.packs[0].id, n: 1 })
      }
    }
  }
}

export { Inserter }
