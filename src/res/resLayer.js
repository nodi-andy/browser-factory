import { Settings } from '../common.js'
import * as NC from 'nodicanvas'

class ResLayer extends NC.NodiGrid {
  render (view) {
    const ctx = view.ctx
    // scan all tiles in view
    const minTile = this.screenToTile({ x: 0, y: 0 })
    const maxTile = this.screenToTile({ x: ctx.canvas.width, y: ctx.canvas.height })
    for (let ay = minTile.y - 3; ay < Math.min(maxTile.y + 5, this.gridSize.y); ay++) {
      for (let ax = minTile.x - 3; ax < Math.min(maxTile.x + 2, this.gridSize.x); ax++) {
        if (ax < 0 || ay < 0) continue
        // GET TILE
        const tile = Settings.game.map[ax][ay]

        // DRAW RESOURCES
        const type = tile[Settings.layers.res].id
        const n = tile[Settings.layers.res].n

        if (type && Settings.resName[type].img && n) {
          ctx.drawImage(Settings.resName[type].img, Math.min(Math.floor(n / 100), 6) * 64, 2, 60, 60, ax * this.tileSize, ay * this.tileSize, 64, 64)
        }
      }
    }
  }
}

export { ResLayer }
