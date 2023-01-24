import { Settings } from '../../common.js'
import { Player } from '../player/player.js'

class Car extends Player {
  constructor (pos, data) {
    super(pos, data)
    data.pos = pos
    this.setup(undefined, data)
    this.dir = 0
  }

  update (map, ent) {

  }

  setup (map, ent) {
  }

  draw (ctx, ent) {
    if (this.pos) {
      ctx.translate(this.pos.x, this.pos.y)
    }
    ctx.drawImage(Settings.resDB.car.img_anim, 0, 0, 260, 260, -130, -130, 260, 260)
  }
}

const db = Settings.resDB.car
db.name = 'car'
db.type = 'entity'
db.size = [1, 1]
db.mach = Car
db.playerCanWalkOn = false
db.size = [1, 1]
db.cost = [
  { id: Settings.resDB.iron_plate.id, n: 50 },
  { id: Settings.resDB.iron_stick.id, n: 50 },
  { id: Settings.resDB.gear.id, n: 50 },
  { id: Settings.resDB.copper_cable.id, n: 50 },
  { id: Settings.resDB.circuit.id, n: 50 }
]
if (typeof Image !== 'undefined') {
  const image = new Image(64, 64)
  image.src = './src/' + db.type + '/car/car.png'
  db.img = image

  const imageAnim = new Image(2340, 260)
  imageAnim.src = './src/' + db.type + '/car/car_anim.png'
  db.img_anim = imageAnim
}
