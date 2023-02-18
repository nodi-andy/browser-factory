import { Settings } from '../../common.js'

export class Inserter {

}

const db = Settings.resDB.inserter
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
db.cost = [{ id: Settings.resDB.iron_plate.id, n: 1 }, { id: Settings.resDB.gear.id, n: 1 }, { id: Settings.resDB.hydraulic_piston.id, n: 1 }]
