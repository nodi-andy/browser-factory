import { Settings } from '../../common.js'
import { AssemblingMachine } from '../assembling_machine/assembling_machine.js'
import { Gear } from '../../item/gear/gear.js'

export class AssemblingMachine2 extends AssemblingMachine {
  static cost = [
    { id: 'AssemblingMachine1', n: 1 },
    { id: 'Circuit', n: 3 },
    { id: 'Gear', n: 5 }
  ]
  static imgName = 'assembling_machine_2'

  constructor (pos, data) {
    super(pos, data)
    this.name = "AssemblingMachine2"
    this.setup()
  }

  setup (map, ent) {
    this.output = ['Empty', 'WoodenStick', 'IronStick', 'Gear', 'CopperCable', 'Circuit', 'HydraulicPiston',
                   'AssemblingMachine1', 'Inserter']
  }
  
  draw (ctx, ent) {
    ctx.drawImage(AssemblingMachine2.anim, 0, 0, AssemblingMachine2.size[0] * Settings.tileSize, AssemblingMachine2.size[1] * Settings.tileSize, 0, 0, AssemblingMachine2.size[0] * Settings.tileSize, AssemblingMachine2.size[1] * Settings.tileSize)
    ctx.drawImage(Gear.img, 0, 0, Settings.tileSize, Settings.tileSize, 10, 10, Settings.tileSize, Settings.tileSize)
    ctx.drawImage(Gear.img, 0, 0, Settings.tileSize, Settings.tileSize, Settings.tileSize, Settings.tileSize * 0.75, Settings.tileSize, Settings.tileSize)
    if (this.selectedItem) {
      ctx.drawImage(classDBi[this.selectedItem].img, 0, 0, Settings.tileSize, Settings.tileSize, Settings.tileSize, Settings.tileSize * 2, Settings.tileSize, Settings.tileSize)
    }
  }

}

if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './' + AssemblingMachine2.type + '/assembling_machine_1/platform.png'
  AssemblingMachine2.anim = image
}
