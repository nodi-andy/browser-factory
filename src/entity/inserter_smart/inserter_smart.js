import { Settings } from '../../common.js'
import { Inventory } from '../../core/inventory.js'

export class InserterSmart extends Inventory {
  static name = 'inserter smart'
  static size = [1, 1]
  static type = 'entity'
  static cost = [{ id: "Inserter", n: 2 }, { id: "Gear", n: 1 }, { id: "HydraulicPiston", n: 1 }]
  static imgName = 'inserter_smart'

  constructor (pos, data) {
    super(pos, data)
    data.pos = pos
    this.setup(undefined, data)
  }
}

if (typeof Image !== 'undefined') {
  InserterSmart.platform = new Image(64, 64)
  InserterSmart.platform.src = './' + InserterSmart.type + '/inserter_smart/inserter_platform.png'
  InserterSmart.hand = new Image(64, 64)
  InserterSmart.hand.src = './' + InserterSmart.type + '/inserter_smart/inserter_smart_hand.png'
}
