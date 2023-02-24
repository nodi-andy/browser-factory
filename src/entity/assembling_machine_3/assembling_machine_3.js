import { Settings } from '../../common.js'
import { AssemblingMachine1 } from '../assembling_machine_1/assembling_machine_1.js'

Settings.resDB.assembling_machine_3 = {}
Settings.resDB.assembling_machine_3.name = 'assembling machine 3'
Settings.resDB.assembling_machine_3.type = 'entity'
Settings.resDB.assembling_machine_3.cost = [
  { id: "Circuit", n: 3 },
  { id: "Gear", n: 5 },
  { id: "IronPlate", n: 9 }
]

if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './' + Settings.resDB.assembling_machine_3.type + '/assembling_machine_3/platform.png'
  Settings.resDB.assembling_machine_3.anim = image
}

Settings.resDB.assembling_machine_3.size = [3, 3]
Settings.resDB.assembling_machine_3.output = [
  "WoodenStick"
]

class AssemblingMachine3 extends AssemblingMachine1 {
  constructor (pos, data) {
    super(data.pos, data)
  }

  draw (ctx, ent) {
    const db = Settings.resDB.assembling_machine_3
    ctx.drawImage(db.anim, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize, 0, 0, db.size[0] * Settings.tileSize, db.size[1] * Settings.tileSize)
  }
}

