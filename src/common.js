/* eslint-disable comma-spacing */
/* eslint-disable no-multi-spaces */

import * as NC from 'nodicanvas'

const game  = {}
const resDB = {}
const resDBi = {}
const resName = {}
const Settings = {}

Settings.resID = [
  'hills',
  'deepsea',
  'sea',
  'grassland',
  'iron_plate',
  'copper_plate',
  'coal',
  'stone',
  'iron',
  'copper',
  'raw_wood',
  'iron_ore',
  'stone_ore',
  'tree',
  'copper_ore',
  'coal_ore',
  'empty',
  'water',
  'steam',
  'coulomb',
  'copper_cable',
  'wood',
  'wooden_stick',
  'sharp_stone',
  'iron_stick',
  'stone_furnace',
  'weak_armor',
  'strong_armor',
  'iron_chest',
  'chest',
  'gear',
  'hydraulic_piston',
  'circuit',
  'stone_axe',
  'iron_axe',
  'gun',
  'rocket_launcher',
  'bullet',
  'rocket',
  'burner_miner',
  'e_miner',
  'belt1',
  'belt2',
  'belt3',
  'inserter_burner',
  'inserter',
  'inserter_long',
  'inserter_smart',
  'assembling_machine_1',
  'assembling_machine_2',
  'assembling_machine_3',
  'pump',
  'pipe',
  'u_pipe',
  'boiler',
  'generator',
  'pole',
  'locomotive',
  'rail',
  'rail_curved',
  'turret',
  'laser_turret',
  'car',
  'player'
]

for (let i = 0; i < Settings.resID.length; i++) {
  resDB[Settings.resID[i]] = {}
  resDB[Settings.resID[i]].id = i
  resDBi[i] = resDB[Settings.resID[i]]
  resName[i] = resDB[Settings.resID[i]]
}

const allInvs = []

Settings.isServer = (typeof window === 'undefined')
Settings.isBrowser = !Settings.isServer
Settings.resDB = resDB
Settings.resDBi = resDBi
Settings.resName = resName
Settings.game = game
Settings.allInvs = allInvs
Settings.selEntity = 0
Settings.item = item
Settings.playerID = 0
Settings.gameState = 0
Settings.game.tick = 0
Settings.buttonSize = 68
Settings.tileSize = 64
Settings.gridSize = new NC.Vec2(160, 90)
Settings.DEV = false
Settings.buildDir = 0
Settings.dirToVec = [{ x: 1, y: 0 },{ x: 0, y: 1 },{ x: -1, y: 0 },{ x: 0, y: -1 }]
Settings.dirToAng = [0, 90, 180, 270]
Settings.nbVec = [{ x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: -1 }, { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 } , { x: 1, y: 1 }]
Settings.layers = { terrain: 0, res: 1, inv: 2, vis: 3 }

function item (type, n) { return { id: type, n } }

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

export { Settings, toUnitV, dist, distV, getNbOccur }
