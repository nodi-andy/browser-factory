import * as NC from 'nodicanvas'

window.classDB = {}
window.classDBi = {}
window.gameName = ''
window.curResPos = new NC.Vec2(0, 0)

export const provinces = {
  "single" : {
      name: "Main",
      gridSize: {x: 80, y: 60 }
  }
}

export const Settings = {
  buttonSize : { x: 68, y: 68 },
  tileSize : 64,
  gridSize : new NC.Vec2(160, 90),
  buildDir : 0,
  dirToVec : [{ x: 1, y: 0 },{ x: 0, y: 1 },{ x: -1, y: 0 },{ x: 0, y: -1 }],
  dirToAng : [0, 90, 180, 270],
  nbVec : [{ x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: -1 }, { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 } , { x: 1, y: 1 }]
}

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
