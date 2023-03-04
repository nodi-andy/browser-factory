import { Settings } from '../../common.js'
import { AssemblingMachine } from '../assembling_machine/assembling_machine.js'
import { Gear } from '../../item/gear/gear.js'

export class AssemblingMachine1 extends AssemblingMachine {
  static rotatable = false
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
    this.output = ['Empty', 'WoodenStick', 'IronStick', 'Gear', 'CopperCable', 'Circuit', 'HydraulicPiston']
  }
  
  draw (ctx, ent) {
    ctx.drawImage(AssemblingMachine1.anim, 0, 0, AssemblingMachine1.size[0] * Settings.tileSize, AssemblingMachine1.size[1] * Settings.tileSize, 0, 0, AssemblingMachine1.size[0] * Settings.tileSize, AssemblingMachine1.size[1] * Settings.tileSize)
    ctx.drawImage(Gear.img, 0, 0, Settings.tileSize, Settings.tileSize, 10, 10, Settings.tileSize, Settings.tileSize)
    if (this.selectedItem) {
      ctx.drawImage(classDBi[this.selectedItem].img, 0, 0, Settings.tileSize, Settings.tileSize, Settings.tileSize, Settings.tileSize * 2, Settings.tileSize, Settings.tileSize)
    }
  }

}

AssemblingMachine1.anim = new Image(512, 32)
AssemblingMachine1.anim.src = './' + AssemblingMachine1.type + '/assembling_machine_1/platform.png'
