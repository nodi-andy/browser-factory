/* eslint-disable comma-spacing */
/* eslint-disable no-multi-spaces */

const resDB = Object()

resDB.empty                  = { name: 'empty'                        , type: 'empty' }

resDB.player                 = { name: 'player'                       , type: 'entity' }

resDB.hills                  = { name: 'hills'                        , type: 'terrain' }
resDB.deepsea                = { name: 'deep sea'                     , type: 'terrain' }
resDB.sea                    = { name: 'sea'                          , type: 'terrain' }
resDB.grassland              = { name: 'grassland'                    , type: 'terrain' }

resDB.iron_plate             = { name: 'iron plate'                   , type: 'item' }
resDB.copper_plate           = { name: 'copper plate'                 , type: 'item' }

resDB.coal                   = { name: 'coal'                         , type: 'item', E: 100 }
resDB.stone                  = { name: 'stone'                        , type: 'item' }
resDB.iron                   = { name: 'iron'                         , type: 'item', W: 25 }
resDB.copper                 = { name: 'copper'                       , type: 'item', W: 50 }
resDB.raw_wood               = { name: 'raw_wood'                     , type: 'item' }

resDB.iron_ore               = { name: 'iron ore'                     , type: 'res', W: 50 }
resDB.stone_ore              = { name: 'stone ore'                    , type: 'res', W: 50 }
resDB.tree                   = { name: 'tree'                         , type: 'res', W: 50 }
resDB.copper_ore             = { name: 'copper ore'                   , type: 'res', W: 50 }
resDB.coal_ore               = { name: 'coal ore'                     , type: 'res', W: 20 }
resDB.water                  = { name: 'water'                        , type: 'item' }
resDB.steam                  = { name: 'steam'                        , type: 'item', W: 200 }
resDB.coulomb                = { name: 'coulomb'                      , type: 'item', E: 200 }

resDB.copper_cable           = { name: 'copper cable'                 , type: 'item' }
resDB.wood                   = { name: 'wood'                         , type: 'item', E: 100 }
resDB.wooden_stick           = { name: 'wooden stick'                 , type: 'item', E: 100, lock: 1 }
resDB.sharp_stone            = { name: 'sharp stone'                  , type: 'item', E: 100, lock: 1 }
resDB.iron_stick             = { name: 'iron stick'                   , type: 'item', E: 100 }

resDB.stone_furnace          = { name: 'stone furnace'                , type: 'entity' }
resDB.weak_armor             = { name: 'weak armor'                   , type: 'item', lock: 1 }
resDB.strong_armor           = { name: 'strong armor'                 , type: 'item', lock: 1 }
resDB.iron_chest             = { name: 'iron chest'                   , type: 'item', lock: 1 }
resDB.chest                  = { name: 'chest'                        , type: 'entity' }
resDB.gear                   = { name: 'gear'                         , type: 'item' }
resDB.hydraulic_piston       = { name: 'hydraulic_piston'             , type: 'item' }
resDB.circuit                = { name: 'circuit'                      , type: 'item' }
resDB.stone_axe              = { name: 'stone_axe'                    , type: 'item', lock: 1 }
resDB.iron_axe               = { name: 'iron_axe'                     , type: 'item', lock: 1 }
resDB.gun                    = { name: 'gun'                          , type: 'item', lock: 1 }
resDB.rocket_launcher        = { name: 'rocket_launcher'              , type: 'item', lock: 1 }
resDB.bullet                 = { name: 'bullet'                       , type: 'item', lock: 1 }
resDB.rocket                 = { name: 'rocket'                       , type: 'item', lock: 1 }
resDB.inserter               = { name: 'inserter'                     , type: 'entity', lock: 1 }
resDB.burner_miner           = { name: 'coal mining platform'         , type: 'entity' }
resDB.e_miner                = { name: 'electrical mining platform'   , type: 'entity' }
resDB.belt1                  = { name: 'transport belt'               , type: 'entity' }
resDB.belt2                  = { name: 'transport belt'               , type: 'entity', lock: 1 }
resDB.belt3                  = { name: 'transport belt'               , type: 'entity', lock: 1 }
resDB.inserter_burner        = { name: 'burner inserter'              , type: 'entity' }
resDB.inserter_short         = { name: 'short inserter'               , type: 'entity', lock: 1 }
resDB.inserter               = { name: 'inserter'                     , type: 'entity', lock: 1 }
resDB.inserter_long          = { name: 'long inserter'                , type: 'entity', lock: 1 }
resDB.inserter_smart         = { name: 'smart inserter'               , type: 'entity', lock: 1 }
resDB.assembling_machine_1   = { name: 'assembling machine 1'         , type: 'entity' }
resDB.assembling_machine_2   = { name: 'assembling machine 2'         , type: 'entity', lock: 1 }
resDB.assembling_machine_3   = { name: 'assembling machine 3'         , type: 'entity', lock: 1 }
resDB.assembling_machine_4   = { name: 'assembling machine 4'         , type: 'entity', lock: 1 }
resDB.pump                   = { name: 'pump'                         , type: 'entity' }
resDB.pipe                   = { name: 'pipe'                         , type: 'entity' }
resDB.u_pipe                 = { name: 'u_pipe'                       , type: 'entity' }
resDB.boiler                 = { name: 'boiler'                       , type: 'entity' }
resDB.generator              = { name: 'generator'                    , type: 'entity' }
resDB.pole                   = { name: 'electrical pole'              , type: 'entity' }
resDB.locomotive             = { name: 'locomotive'                   , type: 'entity', lock: 1 }
resDB.rail                   = { name: 'rail'                         , type: 'entity', lock: 1 }
resDB.rail_curved            = { name: 'rail_curved'                  , type: 'entity', lock: 1 }
resDB.turret                 = { name: 'turret'                       , type: 'entity', lock: 1 }
resDB.laser_turret           = { name: 'laser_turret'                 , type: 'entity', lock: 1 }
resDB.car                    = { name: 'car'                          , type: 'entity' }

resDB.player                 = { name: 'player'                       , type: 'entity', P: 100 }

const resID = Object()
const Settings = {}
Settings.resName = []
Object.keys(resDB).forEach((k) => {
  resDB[k].id = Settings.resName.length
  resID[k] = resDB[k].id
  Settings.resName.push(resDB[k])
})

resDB.iron_ore.becomes          = resDB.iron.id
resDB.stone_ore.becomes         = resDB.stone.id
resDB.tree.becomes              = resDB.raw_wood.id
resDB.copper_ore.becomes        = resDB.copper.id
resDB.coal_ore.becomes          = resDB.coal.id
resDB.iron.smeltedInto          = resDB.iron_plate.id
resDB.copper.smeltedInto        = resDB.copper_plate.id
resDB.iron_plate.cost           = [{ id: resDB.coal.id, n: 1 }, { id: resDB.iron.id, n: 1 }]
resDB.copper_cable.cost         = [{ id: resDB.copper_plate.id, n: 1 }]
resDB.wood.cost                 = [{ id: resDB.raw_wood.id, n: 1 }]
resDB.wooden_stick.cost         = [{ id: resDB.wood.id, n: 1 }]
resDB.sharp_stone.cost          = [{ id: resDB.stone.id, n: 2 }]
resDB.iron_stick.cost           = [{ id: resDB.iron_plate.id, n: 1 }]
resDB.chest.cost                = [{ id: resDB.wood.id, n: 4 }]
resDB.gear.cost                 = [{ id: resDB.iron_plate.id, n: 2 }]
resDB.hydraulic_piston.cost     = [{ id: resDB.iron_plate.id, n: 1 }, { id: resDB.iron_stick.id, n: 1 }]
resDB.circuit.cost              = [{ id: resDB.iron_plate.id, n: 1 }, { id: resDB.copper_cable.id, n: 3 }]
resDB.stone_axe.cost            = [{ id: resDB.wooden_stick.id, n: 2 }, { id: resDB.sharp_stone.id, n: 2 }]
resDB.iron_axe.cost             = [{ id: resDB.iron_stick.id, n: 2 }, { id: resDB.iron_plate.id, n: 2 }]
resDB.inserter_short.cost       = [{ id: resDB.coal.id, n: 2 }]
resDB.inserter.cost             = [{ id: resDB.coal.id, n: 2 }]
resDB.inserter_long.cost        = [{ id: resDB.coal.id, n: 2 }]
resDB.inserter_smart.cost       = [{ id: resDB.coal.id, n: 2 }]
resDB.assembling_machine_1.cost = [{ id: resDB.circuit.id, n: 3 }, { id: resDB.gear.id, n: 5 }, { id: resDB.iron_plate.id, n: 9 }]

const game        = {}
const allInvs = []
const allMovableEntities = []
let selEntity

Settings.isServer = (typeof window === 'undefined')
Settings.isBrowser = !Settings.isServer
Settings.resDB = resDB
Settings.resID = resID
Settings.game = game
Settings.allInvs = allInvs
Settings.selEntity = selEntity
Settings.item = item
Settings.playerID = 0
Settings.allMovableEntities = allMovableEntities
Settings.gameState = 0
Settings.game.tick = 0
Settings.buttonSize = 68
Settings.tileSize = 64
Settings.gridSize = { x: 160, y: 90 }
Settings.DEV = false
Settings.buildDir = 0
Settings.dirToVec = [{ x: 1, y: 0 },{ x: 0, y: 1 },{ x: -1, y: 0 },{ x: 0, y: -1 }]
Settings.dirToAng = [0, 90, 180, 270]
Settings.nbVec = [{ x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: -1 }, { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 } , { x: 1, y: 1 }]
Settings.layers = { terrain: 0, res: 1, inv: 2, vis: 3 }

function item (type, n) { return { id: type, n } }

function worldToTile (p) {
  return (
    {
      x: Math.min(Math.floor(p.x / Settings.tileSize), Settings.gridSize.x),
      y: Math.min(Math.floor(p.y / Settings.tileSize), Settings.gridSize.y)
    })
}

function dist (a, b) { return Math.hypot(a.x - b.x, a.y - b.y) }

function distV (a, b) { return { x: a.x - b.x, y: a.y - b.y } }

function toUnitV (v) {
  if (v.x === 0 && v.y === 0) return { x: 0, y: 0 }
  const len = Math.hypot(v.x, v.y)
  return { x: v.x / len, y: v.y / len }
}

function getNbOccur (arr, val) {
  let occurs = 0

  for (let i = 0; i < arr.length; i++) {
    if ('job' in arr[i] && arr[i].job === val) occurs++
  }

  return occurs
}

export { Settings, worldToTile, toUnitV, dist, distV, getNbOccur }
