import { Settings } from '../../common.js'
import { Belt } from '../belt/belt.js'

if (typeof window === 'undefined') {
  require('../../core/inventory')
  require('../belt/belt.js')
}

class Belt1 extends Belt {
  constructor (pos, data) {
    super(pos, data)
    this.setupBelt(undefined, data)
  }

  setupBelt (map, ent) {
    this.speed = 2
  }
}

const db = Settings.resDB.belt1
db.playerCanWalkOn = true
db.size = [1, 1]
db.cost = [
  { id: Settings.resDB.iron_plate.id, n: 1 },
  { id: Settings.resDB.gear.id, n: 1 }
]
if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './src/' + Settings.resDB.belt1.type + '/belt1/belt1_anim.png'
  Settings.resDB.belt1.anim = image
}
db.Mach = Belt1

export { Belt1 }
