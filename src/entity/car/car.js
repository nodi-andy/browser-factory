import { Settings } from '../../common.js'
import { Player } from '../player/player.js'

class Car extends Player {
  constructor (pos, data) {
    super(pos, data)
    data.pos = pos
    this.setup(undefined, data)
    this.dir = 0
    this.speed = 0
  }

  update (map, ent) {
    ent.pos.x = ent.pos.x + this.speed * Math.cos(ent.dir)
    //ent.pos.x = ent.nextPos.x

    ent.pos.y = ent.pos.y + this.speed * Math.sin(ent.dir)
    //ent.pos.y = ent.nextPos.y
  }

  onKeyDown (e) {
    if (e.code === 'KeyW') this.speed = 10
    if (e.code === 'KeyS') this.speed = -10
    if (e.code === 'KeyD') this.dir += (Math.PI / 8)
    if (e.code === 'KeyA') this.dir -= (Math.PI / 8)
    this.dir += (2 * Math.PI)
    this.dir %= (2 * Math.PI)
    this.drawDir = (((Math.round(this.dir / (Math.PI / 8))) + 4) % 16)
    console.log(this.dir + '  ' + this.drawDir)
  }

  onKeyUp (e) {
    if (e.code === 'KeyW') this.speed = 0
    if (e.code === 'KeyS') this.speed = 0
  }

  draw (ctx, ent) {
    if (this.pos) {
      ctx.translate(this.pos.x, this.pos.y)
    }
    if (isNaN(this.dir)) {
      this.dir = 0
      this.drawDir = 4
    }

    ctx.drawImage(db.img_anim, this.drawDir * 260, 0, 260, 260, -130, -130, 260, 260)
  }
}

const db = Settings.resDB.car = {}
db.name = 'car'
db.type = 'entity'
db.rotatable = false
db.size = [1, 1]
db.mach = Car
db.playerCanWalkOn = false
db.size = [1, 1]
db.cost = [
  { id: "InserterBurner", n: 100 },
  { id: "Belt2", n: 100 },
  { id: "AssemblingMachine3", n: 100 }
]
if (typeof Image !== 'undefined') {
  const image = new Image(64, 64)
  image.src = './' + db.type + '/car/car.png'
  db.img = image

  const imageAnim = new Image(2340, 260)
  imageAnim.src = './' + db.type + '/car/car_anim.png'
  db.img_anim = imageAnim
}
