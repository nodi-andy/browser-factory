import { Settings } from '../../common.js'
import { AssemblingMachine1 } from '../assembling_machine_1/assembling_machine_1.js'

Settings.resDB.assembling_machine_3.name = 'assembling machine 3'
Settings.resDB.assembling_machine_3.type = 'entity'
Settings.resDB.assembling_machine_3.cost = [
  { id: Settings.resDB.circuit.id, n: 3 },
  { id: Settings.resDB.gear.id, n: 5 },
  { id: Settings.resDB.iron_plate.id, n: 9 }
]

if (typeof Image !== 'undefined') {
  const image = new Image(512, 32)
  image.src = './' + Settings.resDB.assembling_machine_3.type + '/assembling_machine_3/platform.png'
  Settings.resDB.assembling_machine_3.anim = image
}

Settings.resDB.assembling_machine_3.size = [3, 3]
Settings.resDB.assembling_machine_3.output = [
  Settings.resDB.wooden_stick.id,
  Settings.resDB.sharp_stone.id,
  Settings.resDB.iron_stick.id,
  Settings.resDB.gear.id,
  Settings.resDB.hydraulic_piston.id,
  Settings.resDB.copper_cable.id,
  Settings.resDB.circuit.id,
  Settings.resDB.stone_axe.id,
  Settings.resDB.iron_axe.id,
  Settings.resDB.gun.id,
  Settings.resDB.rocket_launcher.id,
  Settings.resDB.bullet.id,
  Settings.resDB.rocket.id,
  Settings.resDB.weak_armor.id,
  Settings.resDB.strong_armor.id,
  Settings.resDB.chest.id,
  Settings.resDB.iron_chest.id,
  Settings.resDB.stone_furnace.id,
  Settings.resDB.burner_miner.id,
  Settings.resDB.e_miner.id,
  classDB.Belt1.id,
  Settings.resDB.inserter_burner.id,
  Settings.resDB.car.id
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

