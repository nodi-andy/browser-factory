import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

export class InserterLong extends Inventory {
  constructor (pos, data) {
    super(pos, data)
    data.pos = pos
    this.setup(undefined, data)
  }
}

const db = Settings.resDB.inserter_long = {}
db.name = 'inserter long'
db.lock = 1
db.size = [1, 1]
db.type = 'entity'
if (typeof Image !== 'undefined') {
  let image = new Image(64, 64)
  image.src = './' + Settings.resDB.inserter_long.type + '/inserter_burner/inserter_platform.png'
  Settings.resDB.inserter_long.platform = image
  image = new Image(64, 64)
  image.src = './' + Settings.resDB.inserter_long.type + '/inserter_burner/inserter_burner_hand.png'
  Settings.resDB.inserter_long.hand = image
}
db.mach = InserterLong
db.cost = [{ id: "IronPlate", n: 1 }, { id: "Gear", n: 1 }, { id: "HydraulicPiston", n: 1 }]
