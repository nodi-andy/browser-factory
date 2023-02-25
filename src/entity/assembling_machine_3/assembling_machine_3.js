import { Settings } from '../../common.js'
import { AssemblingMachine } from '../assembling_machine/assembling_machine.js'

export class AssemblingMachine3 extends AssemblingMachine {
  static cost = [
    { id: 'Circuit', n: 3 },
    { id: 'Gear', n: 5 },
    { id: 'IronPlate', n: 9 }
  ]
  static imgName = 'assembling_machine_3'

  constructor (pos, data) {
    super(pos, data)
    this.name = "AssemblingMachine3"
    this.setup()
  }

  setup (map, ent) {
    this.output = ['Empty', 'WoodenStick', 'IronStick', 'Gear', 'CopperCable', 'Circuit', 'AssemblingMachine1', 'AssemblingMachine2', 'AssemblingMachine3']
  }
  
  draw (ctx, ent) {
    ctx.drawImage(AssemblingMachine3.anim, 0, 0, AssemblingMachine3.size[0] * Settings.tileSize, AssemblingMachine3.size[1] * Settings.tileSize, 0, 0, AssemblingMachine3.size[0] * Settings.tileSize, AssemblingMachine3.size[1] * Settings.tileSize)
  }

}

if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './' + AssemblingMachine3.type + '/assembling_machine_1/platform.png'
  AssemblingMachine3.anim = image
}
