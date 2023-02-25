import { Belt } from '../belt/belt.js'

export class Belt3 extends Belt {
  static type = 'entity'
  static size = [1, 1]
  static cost = [{ id: "IronPlate", n: 1 }, { id: "Gear", n: 1 }]
  static imgName = 'belt3'
  static playerCanWalkOn = true
  static speed = 4

  constructor (pos, data) {
    super(pos, data)
    this.name = "Belt3"
  }

  draw (ctx) {
    const beltPos = Math.round(game.tick * Belt3.speed) % 32
    ctx.drawImage(Belt3.anim, 32 - beltPos, 0, 64, 64, 0, 0, 64, 64)
  }
}

if (typeof Image !== 'undefined') {
  const image = new Image(64, 64)
  image.src = './' + Belt3.type + '/belt3/belt3_anim.png'
  Belt3.anim = image
}
