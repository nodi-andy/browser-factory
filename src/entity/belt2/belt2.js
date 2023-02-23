
import { Belt } from '../belt/belt.js'

export class Belt2 extends Belt {
  static type = 'entity'
  static size = [1, 1]
  static cost = [{ id: "IronPlate", n: 1 }, { id: "Gear", n: 1 }]
  static imgName = 'belt2'
  static playerCanWalkOn = true
  static speed = 2

  constructor (pos, data) {
    super(pos, data)
    this.name = "Belt2"


  }

  draw (ctx) {
    const beltPos = Math.round(window.game.tick * Belt2.speed) % 32
    ctx.drawImage(Belt2.anim, 32 - beltPos, 0, 64, 64, 0, 0, 64, 64)
  }
}

if (typeof Image !== 'undefined') {
  const image = new Image(64, 64)
  image.src = './' + Belt2.type + '/belt2/belt2_anim.png'
  Belt2.anim = image
}
