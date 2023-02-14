import { Settings } from '../../common.js'
import { Belt } from '../belt/belt.js'

if (typeof window === 'undefined') {
  require('../../core/inventory')
  require('../belt/belt.js')
}

export class Belt2 extends Belt {
  constructor (pos, data) {
    super(pos, data)
    this.setupBelt(undefined, data)
  }

  setupBelt (map, ent) {
    this.speed = 2
  }

  draw (ctx, ent) {
    if (this.speed == null) this.speed = 2
    const beltPos = Math.round(window.game.tick * this.speed) % 32
    ctx.drawImage(Settings.resDB.belt2.anim, 32 - beltPos, 0, 64, 64, 0, 0, 64, 64)
  }
}

const db = Settings.resDB.belt2
db.playerCanWalkOn = true
db.name = 'belt2'
db.type = 'entity'
db.size = [1, 1]
db.cost = [
  { id: Settings.resDB.iron_plate.id, n: 1 },
  { id: Settings.resDB.gear.id, n: 1 }
]
if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './src/' + Settings.resDB.belt2.type + '/belt2/belt2_anim.png'
  Settings.resDB.belt2.anim = image
}
db.mach = Belt2
