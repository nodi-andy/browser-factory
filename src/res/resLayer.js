import { Settings } from '../common.js'
import * as NC from 'nodicanvas'

export class ResLayer extends NC.NodiGrid {
  constructor (name, gridSize, tileSize) {
    super(name, gridSize, tileSize)
    this.map = Array(this.gridSize.x).fill(0).map(() => Array(this.gridSize.y).fill(0).map(() => ({ type: undefined, id: undefined })))
    this.offscreenCanvas = document.createElement('canvas')

    Object.keys(Settings.resDB).forEach(name => {
      const perlinmap = window.terrain.generateTerrain(this.gridSize.x, this.gridSize.y)
      const res = Settings.resDB[name]
      if (res.type === 'res' && res.id !== Settings.resDB.water.id) {
        for (let ax = 0; ax < this.map.length; ax++) {
          for (let ay = 0; ay < this.map[ax].length; ay++) {
            const perlinVal = perlinmap[ax * this.gridSize.y + ay]
            const tile = this.map[ax][ay]
            const terrainTile = window.terrain.map[ax][ay]
            if (perlinVal > 8 && tile.id === undefined && terrainTile[0] === Settings.resDB.grassland.id) {
              tile.id = res.id
              tile.n = Math.round((perlinVal - 8) * 200)
            }
          }
        }
      }
    })
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
        if (Settings.resName[type]?.img?.complete === false) return false
        offScreencontext.drawImage(Settings.resName[type].img, Math.min(Math.floor(n / 100), 6) * 64, 2, 60, 60, ax * resLayer.tileSize, ay * resLayer.tileSize, 64, 64)
      }
    }
    return true
  }

  updateOffscreenMap (resLayer) {
    if (window.res.map === undefined) return
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
    /*
    // scan all tiles in view
    const minTile = this.screenToTile({ x: 0, y: 0 })
    const maxTile = this.screenToTile({ x: ctx.canvas.width, y: ctx.canvas.height })
    for (let ay = minTile.y - 3; ay < Math.min(maxTile.y + 5, this.gridSize.y); ay++) {
      for (let ax = minTile.x - 3; ax < Math.min(maxTile.x + 2, this.gridSize.x); ax++) {
        if (ax < 0 || ay < 0) continue
        // GET TILE
        const tile = this.map[ax][ay]

        // DRAW RESOURCES
        const type = tile[Settings.layers.res].id
        const n = tile[Settings.layers.res].n

        if (type && Settings.resName[type].img && n) {
          ctx.drawImage(Settings.resName[type].img, Math.min(Math.floor(n / 100), 6) * 64, 2, 60, 60, ax * this.tileSize, ay * this.tileSize, 64, 64)
        }
      }
    } */
  }
}
