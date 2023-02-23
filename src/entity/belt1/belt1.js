import { Belt } from '../belt/belt.js'


export class Belt1 extends Belt {
  static type = 'entity'
  static size = [1, 1]
  static cost = [{ id: "IronPlate", n: 1 }, { id: "Gear", n: 1 }]
  static imgName = 'belt1'
  static playerCanWalkOn = true
  static speed = 1

  constructor (pos, data) {
    super(pos, data)
    this.name = "Belt1"


  }

  draw (ctx) {
    const beltPos = Math.round(window.game.tick * Belt1.speed) % 32
    ctx.drawImage(Belt1.anim, 32 - beltPos, 0, 64, 64, 0, 0, 64, 64)
  }
}

if (typeof Image !== 'undefined') {
  const image = new Image(64, 64)
  image.src = './' + Belt1.type + '/belt1/belt1_anim.png'
  Belt1.anim = image
}
