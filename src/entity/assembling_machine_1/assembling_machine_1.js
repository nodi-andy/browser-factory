import { Settings } from '../../common.js'
import { AssemblingMachine } from '../assembling_machine/assembling_machine.js'

export class AssemblingMachine1 extends AssemblingMachine {
  static cost = [
    { id: 'Circuit', n: 3 },
    { id: 'Gear', n: 5 },
    { id: 'IronPlate', n: 9 }
  ]
  static imgName = 'assembling_machine_1'

  constructor (pos, data) {
    super(pos, data)
    this.name = "AssemblingMachine1"
    this.setup()
  }

  setup (map, ent) {
    this.output = ['Empty', 'WoodenStick', 'IronStick', 'Gear', 'CopperCable', 'Circuit']
  }
  
  draw (ctx, ent) {
    ctx.drawImage(AssemblingMachine1.anim, 0, 0, AssemblingMachine1.size[0] * Settings.tileSize, AssemblingMachine1.size[1] * Settings.tileSize, 0, 0, AssemblingMachine1.size[0] * Settings.tileSize, AssemblingMachine1.size[1] * Settings.tileSize)
  }

}

if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './' + AssemblingMachine1.type + '/assembling_machine_1/platform.png'
  AssemblingMachine1.anim = image
}
