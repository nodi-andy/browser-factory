import { Settings } from '../../common.js'
import { AssemblingMachine } from '../assembling_machine/assembling_machine.js'
import { Gear } from '../../item/gear/gear.js'

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
    this.output = ['Empty', 'WoodenStick', 'IronStick', 'Gear', 'CopperCable', 'Circuit', 'Belt1', 'Belt2', 'Belt3', 'Inserter' , 'InserterLong', 'InserterSmart', 'AssemblingMachine1', 'AssemblingMachine2', 'AssemblingMachine3', 'Car']
  }
  
  draw (ctx, ent) {
    ctx.drawImage(AssemblingMachine3.anim, 0, 0, AssemblingMachine3.size[0] * Settings.tileSize, AssemblingMachine3.size[1] * Settings.tileSize, 0, 0, AssemblingMachine3.size[0] * Settings.tileSize, AssemblingMachine3.size[1] * Settings.tileSize)
    ctx.drawImage(Gear.img, 0, 0, Settings.tileSize, Settings.tileSize, 10, 10, Settings.tileSize, Settings.tileSize)
    ctx.drawImage(Gear.img, 0, 0, Settings.tileSize, Settings.tileSize, Settings.tileSize, Settings.tileSize * 0.75, Settings.tileSize, Settings.tileSize)
    ctx.drawImage(Gear.img, 0, 0, Settings.tileSize, Settings.tileSize, Settings.tileSize * 2, 10, Settings.tileSize, Settings.tileSize)
    if (this.selectedItem) {
      ctx.drawImage(classDBi[this.selectedItem].img, 0, 0, Settings.tileSize, Settings.tileSize, Settings.tileSize, Settings.tileSize * 2, Settings.tileSize, Settings.tileSize)
    }
  }

}

if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './' + AssemblingMachine3.type + '/assembling_machine_1/platform.png'
  AssemblingMachine3.anim = image
}
