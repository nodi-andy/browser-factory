import { Settings } from '../common.js'
import { noise } from './perlin.js'
import { invfuncs } from '../core/inventory.js'
import * as NC from 'nodicanvas'

export class Terrain extends NC.NodiGrid {
  // GENERATE TERRAIN
  generateTerrain (w, h) {
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
    const nCity = {
      id: 0,
      name: '',
      map: Array(this.gridSize.x).fill(0).map(() => Array(this.gridSize.y).fill(0).map(() => [[undefined, 0], { id: undefined, n: 0 }, undefined, 0])),
      res: [0, 100, 0, 0, 0, 0, 100, 0, 0, 0, 0],
      nb: [],
      w: [],
      dist: [],
      tick: 0
    }

    let terrainmap = this.generateTerrain(this.gridSize.x, this.gridSize.y)
    // discrete perlin
    for (let ax = 0; ax < nCity.map.length; ax++) {
      for (let ay = 0; ay < nCity.map[ax].length; ay++) {
        const perlinVal = terrainmap[ax * this.gridSize.y + ay]
        let resVal = 0
        if (perlinVal < 1) resVal = [Settings.resDB.deepsea.id, 0]
        else if (perlinVal < 2) resVal = [Settings.resDB.sea.id, 0]
        else if (perlinVal < 8) resVal = [Settings.resDB.grassland.id, Math.round(Math.random() * 3)]
        else resVal = [Settings.resDB.hills.id, Math.round(Math.random() * 3)]

        nCity.map[ax][ay][Settings.layers.terrain] = resVal
        nCity.map[ax][ay][Settings.layers.vis] = 0
      }
    }

    Object.keys(Settings.resDB).forEach(name => {
      const res = Settings.resDB[name]
      if (res.type === 'res' && res.id !== Settings.resDB.water.id) {
        terrainmap = this.generateTerrain(this.gridSize.x, this.gridSize.y)
        for (let ax = 0; ax < nCity.map.length; ax++) {
          for (let ay = 0; ay < nCity.map[ax].length; ay++) {
            const perlinVal = terrainmap[ax * this.gridSize.y + ay]
            const tile = nCity.map[ax][ay];
            if (perlinVal > 8 &&
                          tile[Settings.layers.res].id === undefined &&
                          tile[Settings.layers.terrain][0] === Settings.resDB.grassland.id) {
              tile[Settings.layers.res].id = res.id
              tile[Settings.layers.res].n = Math.round((perlinVal - 8) * 200)
            }
          }
        }
      }
    })

    return nCity
  }

  onMouseMove (e) {
    this.extendMouseData(e)
    window.curResPos = { x: e.gridX, y: e.gridY }
  }

  render (view) {
    const ctx = view.ctx
    // DRAW TERRAIN
    ctx.drawImage(window.canvas.offScreenCanvas, 0, 0)
    // CONTENT MENU
    if (window.curResPos && Settings.game.map) {
      const inv = invfuncs.getInv(window.curResPos.x, window.curResPos.y)
      const res = Settings.game.map[window.curResPos.x][window.curResPos.y][Settings.layers.res]

      if (Settings.DEV) {
        // console.log(JSON.stringify(game.map[curResPos.x][curResPos.y]), inv);
        ctx.font = '24px Arial'
        ctx.fillStyle = 'white'

        if (res !== undefined) ctx.fillText(JSON.stringify(res, null, 1), window.mousePos.x, window.mousePos.y + 24)
        if (inv !== undefined) {
          ctx.fillText(inv.id + ': ' + window.curResPos.x + ', ' + window.curResPos.y, window.mousePos.x, window.mousePos.y)
          ctx.fillText(JSON.stringify(inv.stack, null, 1), window.mousePos.x, window.mousePos.y + 48)
          ctx.fillText(JSON.stringify(inv.nbInputs, null, 1), window.mousePos.x, window.mousePos.y + 72)
          ctx.fillText(JSON.stringify(inv.nbOutputs, null, 1), window.mousePos.x, window.mousePos.y + 96)
          ctx.fillText(JSON.stringify(inv.dir, null, 1), window.mousePos.x, window.mousePos.y + 120)
        }
        ctx.stroke()
      }

      ctx.resetTransform()
      if (res?.id) {
        ctx.beginPath()
        ctx.fillStyle = 'rgba(150, 150, 190, 0.75)'
        const menuPos = { x: window.canvas.width - 200, y: window.canvas.height / 2 - 50 }
        ctx.translate(menuPos.x, menuPos.y)
        ctx.fillRect(0, 0, 200, 100)
        ctx.font = '24px Arial'
        ctx.fillStyle = 'black'
        ctx.fillText(Settings.resName[res.id].name + ' ' + res.n, 0, 30)
      }
    }
  }
}
