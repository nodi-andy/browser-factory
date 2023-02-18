import { Settings } from '../../common.js'
import { Belt } from '../belt/belt.js'

if (typeof window === 'undefined') {
  require('../../core/inventory')
  require('../belt/belt.js')
}

export class Belt1 extends Belt {
  constructor (pos, data) {
    super(pos, data)
    this.setupBelt(undefined, data)
  }

  setupBelt (map, ent) {
    this.speed = 1
  }

  draw (ctx, ent) {
    if (this.speed == null) this.speed = 1
    const beltPos = Math.round(window.game.tick * this.speed) % 32
    ctx.drawImage(Settings.resDB.belt1.anim, 32 - beltPos, 0, 64, 64, 0, 0, 64, 64)
  }
}

const db = Settings.resDB.belt1
db.playerCanWalkOn = true
db.name = 'belt1'
db.type = 'entity'
db.size = [1, 1]
db.cost = [
  { id: Settings.resDB.iron_plate.id, n: 1 },
  { id: Settings.resDB.gear.id, n: 1 }
]
if (typeof Image !== 'undefined') {
  const image = new Image(64, 96)
  image.src = './' + Settings.resDB.belt1.type + '/belt1/belt1_anim.png'
  Settings.resDB.belt1.anim = image
}

if (typeof Image !== 'undefined') {
  const image = new Image(64, 64)
  image.src = './' + Settings.resDB.belt1.type + '/belt1/belt1.png'
  Settings.resDB.belt1.img = image
}
db.mach = Belt1
