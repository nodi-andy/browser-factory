import { Settings } from '../../common.js'

export class Inserter {

}

const db = Settings.resDB.inserter = {}
db.name = 'inserter'
db.lock = 1
db.size = [1, 1]
db.type = 'entity'
if (typeof Image !== 'undefined') {
  let image = new Image(64, 64)
  image.src = './' + Settings.resDB.inserter.type + '/inserter/inserter_platform.png'
  Settings.resDB.inserter.platform = image
  image = new Image(64, 64)
  image.src = './' + Settings.resDB.inserter.type + '/inserter/inserter_hand.png'
  Settings.resDB.inserter.hand = image
}

db.mach = Inserter
db.cost = [{ id: "IronPlate", n: 1 }, { id: "Gear", n: 1 }, { id: "HydraulicPiston", n: 1 }]
