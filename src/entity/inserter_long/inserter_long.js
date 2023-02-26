import { Inserter } from "../inserter/inserter.js"

export class InserterLong extends Inserter {
  static name = 'inserter long'
  static size = [1, 1]
  static type = 'entity'
  static cost = [{ id: "IronPlate", n: 1 }, { id: "Gear", n: 1 }, { id: "HydraulicPiston", n: 1 }]
  static imgName = "inserter_long"
  static armLen = 2

  constructor (pos, data) {
    super(pos, data)
    data.pos = pos
    this.setup(undefined, data)
  }
}

InserterLong.platform = new Image(64, 64)
InserterLong.platform.src = './' + InserterLong.type + '/inserter_long/inserter_platform.png'
InserterLong.hand = new Image(64, 64)
InserterLong.hand.src = './' + InserterLong.type + '/inserter_long/inserter_long_hand.png'
