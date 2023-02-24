import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

export class InserterSmart extends Inventory {
  constructor (pos, data) {
    super(pos, data)
    data.pos = pos
    this.setup(undefined, data)
  }
}

const db = Settings.resDB.inserter_smart = {}
db.name = 'inserter smart'
db.lock = 1
db.size = [1, 1]
db.type = 'entity'
if (typeof Image !== 'undefined') {
  let image = new Image(64, 64)
  image.src = './' + Settings.resDB.inserter_smart.type + '/inserter_burner/inserter_platform.png'
  Settings.resDB.inserter_smart.platform = image
  image = new Image(64, 64)
  image.src = './' + Settings.resDB.inserter_smart.type + '/inserter_burner/inserter_burner_hand.png'
  Settings.resDB.inserter_smart.hand = image
}
db.mach = InserterSmart
db.cost = [{ id: "IronPlate", n: 1 }, { id: "Gear", n: 1 }, { id: "HydraulicPiston", n: 1 }]
