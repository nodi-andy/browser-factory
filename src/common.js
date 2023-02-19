/* eslint-disable comma-spacing */
/* eslint-disable no-multi-spaces */

import * as NC from 'nodicanvas'
export const Settings = {}
const resDB = {}
const resName = {}


Settings.isServer = (typeof window === 'undefined')
Settings.isBrowser = !Settings.isServer
Settings.resDB = resDB
Settings.resName = resName

Settings.selEntity = 0
Settings.item = item

Settings.buttonSize = { x: 68, y: 68 }
Settings.tileSize = 64
Settings.gridSize = new NC.Vec2(160, 90)
Settings.DEV = false
Settings.buildDir = 0
Settings.dirToVec = [{ x: 1, y: 0 },{ x: 0, y: 1 },{ x: -1, y: 0 },{ x: 0, y: -1 }]
Settings.dirToAng = [0, 90, 180, 270]
Settings.nbVec = [{ x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: -1 }, { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 } , { x: 1, y: 1 }]

Settings.curResPos = new NC.Vec2(0, 0)

function item (type, n) { return { id: type, n } }

export function dist (a, b) { return Math.hypot(a.x - b.x, a.y - b.y) }

export function distV (a, b) { return { x: a.x - b.x, y: a.y - b.y } }

export function toUnitV (v) {
  if (v.x === 0 && v.y === 0) return { x: 0, y: 0 }
  const len = Math.hypot(v.x, v.y)
  return { x: v.x / len, y: v.y / len }
}

export function getNbOccur (arr, val) {
  let occurs = 0

  for (let i = 0; i < arr.length; i++) {
    if ('job' in arr[i] && arr[i].job === val) occurs++
  }

  return occurs
}
