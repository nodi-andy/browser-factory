import { Settings } from '../common.js'
import { Terrain } from '../terrain/terrain.js'
import * as NC from 'nodicanvas'

export class ResLayer extends NC.NodiGrid {
  constructor (name, gridSize, tileSize, map) {
    super(name, gridSize, tileSize)
    this.offscreenCanvas = document.createElement('canvas')
    this.map = map
    if (this.map == null) {
      this.map = Array(this.gridSize.x).fill(0).map(() => Array(this.gridSize.y).fill(0).map(() => ({ type: undefined, id: undefined })))
      Object.keys(window.classDB).forEach(name => {
        const perlinmap = Terrain.generateTerrain(this.gridSize.x * 2, this.gridSize.y * 2)
        const res = window.classDB[name]
        if (res?.type === 'res') {
          for (let ax = 0; ax < this.map.length; ax++) {
            for (let ay = 0; ay < this.map[ax].length; ay++) {
              const perlinVal = perlinmap[ax * this.gridSize.y * 2 + ay]
              const tile = this.map[ax][ay]
              const terrainTile = game.terrain.map[ax][ay]
              if (perlinVal > 9 && tile.id == null && terrainTile[0] === classDB.Grassland.id) {
                tile.id = res.id
                tile.n = Math.round((perlinVal - 9) * 400)
              }
            }
          }
        }
      })
    }
  }

  loopScreenMap (resLayer, offScreencontext) {
    for (let ax = 0; ax < Settings.gridSize.x; ax++) {
      for (let ay = 0; ay < Settings.gridSize.y; ay++) {
        // GET TILE
        const tile = resLayer.map[ax][ay]
        // DRAW RESOURCES
        const type = tile.id
        const n = tile.n
        if (type == null || n === 0) continue
        if (classDBi[type]?.img?.complete === false) return false
        offScreencontext.drawImage(classDBi[type].img, Math.min(Math.floor(n / 400), 6) * 64, 2, 60, 60, ax * resLayer.tileSize, ay * resLayer.tileSize, 64, 64)
      }
    }
    return true
  }

  updateOffscreenMap (resLayer) {
    if (resLayer == null) resLayer = game.res
    if (game.res.map == null) return
    resLayer.offscreenCanvas.width = Settings.gridSize.x * Settings.tileSize
    resLayer.offscreenCanvas.height = Settings.gridSize.y * Settings.tileSize
    const offScreencontext = resLayer.offscreenCanvas.getContext('2d')
    const loopDone = resLayer.loopScreenMap(resLayer, offScreencontext)
    if (!loopDone) {
      setTimeout(resLayer.updateOffscreenMap, 500, resLayer)
    }
  }

  render (view) {
    const ctx = view.ctx

    if (this.offscreenCanvas == null) return

    ctx.drawImage(this.offscreenCanvas, 0, 0)
  }

  getResource (p) {
    if (p.x < 0) return
    if (p.y < 0) return
    if (p.x >= this.map.length) return
    if (p.y >= this.map[0].length) return

    return this.getResourceXY(p.x, p.y)
  }
  getResourceXY (x, y) {
    if (x < 0) return
    if (y < 0) return
    if (x >= this.map.length) return
    if (y >= this.map[0].length) return

    return this.map[x][y]
  }
}
