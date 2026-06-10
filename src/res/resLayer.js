import { Settings } from '../common.js'
import { gameSetup, isResourceAllowed } from '../gameConfig.js'
import { Terrain } from '../terrain/terrain.js'
import * as NC from 'nodicanvas'

export class ResLayer extends NC.NodiGrid {
  constructor (name, gridSize, tileSize, map) {
    super(name, gridSize, tileSize)
    this.offscreenCanvas = document.createElement('canvas')
    this.map = map
    if (this.map == null) {
      this.map = Array(this.gridSize.x).fill(0).map(() => Array(this.gridSize.y).fill(0).map(() => ({ type: undefined, id: undefined })))
      if (gameSetup?.resources?.enabled !== false) {
        Object.keys(window.classDB).forEach(name => {
          const perlinmap = Terrain.generateTerrain(this.gridSize.x * 2, this.gridSize.y * 2)
          const res = window.classDB[name]
          if (res?.type === 'res' && isResourceAllowed(res.id)) {
            for (let ax = 0; ax < this.map.length; ax++) {
              for (let ay = 0; ay < this.map[ax].length; ay++) {
                const perlinVal = perlinmap[ax * this.gridSize.y * 2 + ay]
                const tile = this.map[ax][ay]
                const terrainTile = game?.terrain?.map?.[ax]?.[ay]
                if (perlinVal > 9 && tile.id == null && terrainTile?.[0] === classDB.Grassland.id) {
                  tile.id = res.id
                  tile.n = Math.round((perlinVal - 9) * 400)
                }
              }
            }
          }
        })
      }
    }
    if (gameSetup?.resources?.enabled === false) this.clearAllResources()
    this.applyFixedDeposits()
  }

  clearAllResources () {
    if (!Array.isArray(this.map)) return
    for (let ax = 0; ax < this.map.length; ax++) {
      const col = this.map[ax]
      if (!Array.isArray(col)) continue
      for (let ay = 0; ay < col.length; ay++) {
        if (!col[ay] || typeof col[ay] !== 'object') col[ay] = {}
        col[ay].id = undefined
        col[ay].n = undefined
      }
    }
  }

  applyFixedDeposits () {
    if (gameSetup?.resources?.enabled === false) return
    const deposits = Array.isArray(gameSetup?.resources?.fixedDeposits) ? gameSetup.resources.fixedDeposits : []
    if (deposits.length === 0 || !Array.isArray(this.map)) return
    const floorId = classDB?.[gameSetup?.world?.terrain?.floorTile]?.id ?? classDB?.Grassland?.id

    for (const deposit of deposits) {
      if (deposit == null) continue
      const resourceClass = typeof deposit.id === 'number'
        ? classDBi?.[deposit.id]
        : window.classDB?.[deposit.id] || window.classDB?.[deposit.id?.toLowerCase?.()]
      const resourceId = resourceClass?.id
      if (resourceId == null || resourceClass?.type !== 'res') continue
      if (!isResourceAllowed(resourceId)) continue

      const x = Math.round(deposit.x)
      const y = Math.round(deposit.y)
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue
      if (x < 0 || y < 0 || x >= this.map.length || y >= this.map[0].length) continue

      const tile = this.map[x][y]
      const terrainTile = game?.terrain?.map?.[x]?.[y]
      if (!tile || !Array.isArray(terrainTile)) continue
      if (floorId != null && terrainTile[0] !== floorId) continue

      const amount = Number.isFinite(deposit.n) ? Math.max(1, Math.round(deposit.n)) : 1200
      tile.id = resourceId
      tile.n = amount
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
    if (window.game.res.map == null) return
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
