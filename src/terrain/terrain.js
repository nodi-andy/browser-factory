import { Settings } from '../common.js'
import { noise } from '../core/perlin.js'
import * as NC from 'nodicanvas'

export class Terrain extends NC.NodiGrid {
  constructor (name, gridSize, tileSize, map) {
    super(name, gridSize, tileSize)
    this.offscreenCanvas = document.createElement('canvas')
    this.map = map
    if (this.map == null) {
      this.map = Array(this.gridSize.x).fill(0).map(() => Array(this.gridSize.y).fill(0).map(() => [undefined, 0]))
      this.createWorld(gridSize.x, gridSize.y)
    }
  }

  // GENERATE TERRAIN
  static generateTerrain (w, h) {
    const map = Array(w * h).fill(0)
    noise.seed(Math.random())
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        map[x * h + y] = (noise.perlin2(x / 10, y / 10) + 0.7) * 8
      }
    }
    return map
  }

  createWorld (x, y) {
    this.perlinmap = Terrain.generateTerrain(this.gridSize.x, this.gridSize.y)
    // discrete perlin
    for (let ax = 0; ax < this.map.length; ax++) {
      for (let ay = 0; ay < this.map[ax].length; ay++) {
        const perlinVal = this.perlinmap[ax * this.gridSize.y + ay]
        let resVal = 0
        if (perlinVal < 1) resVal = [classDB.Deepsea.id, 0]
        else if (perlinVal < 2) resVal = [classDB.Sea.id, 0]
        else if (perlinVal < 9) resVal = [classDB.Grassland.id, Math.round(Math.random() * 3)]
        else resVal = [classDB.Hills.id, Math.round(Math.random() * 3)]

        this.map[ax][ay] = resVal
      }
    }
  }

  loopScreenMap (terrainLayer, offScreencontext) {
    for (let ax = 0; ax < Settings.gridSize.x; ax++) {
      for (let ay = 0; ay < Settings.gridSize.y; ay++) {
        const tile = terrainLayer.map[ax][ay]

        // MAP
        const type = tile[0]
        const variant = tile[1]
        if (classDBi[type]?.img?.complete === false) return false

        offScreencontext.drawImage(classDBi[type].img, variant * 64, 0, Settings.tileSize, Settings.tileSize, ax * Settings.tileSize, ay * Settings.tileSize, Settings.tileSize, Settings.tileSize)
      }
    }
    return true
  }

  updateOffscreenMap (terrainLayer) {
    if (game.terrain.map == null) return
    terrainLayer.offscreenCanvas.width = Settings.gridSize.x * Settings.tileSize
    terrainLayer.offscreenCanvas.height = Settings.gridSize.y * Settings.tileSize
    const offScreencontext = terrainLayer.offscreenCanvas.getContext('2d')
    const loopDone = terrainLayer.loopScreenMap(terrainLayer, offScreencontext)
    if (!loopDone) {
      setTimeout(terrainLayer.updateOffscreenMap, 500, terrainLayer)
    }
  }

  render (view) {
    const ctx = view.ctx
    // DRAW TERRAIN
    ctx.drawImage(this.offscreenCanvas, 0, 0)
  }
}
