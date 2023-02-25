import { Settings } from '../common.js'
import * as NC from 'nodicanvas'

export class World extends NC.NodiGrid {
  constructor (name, gridSize, tileSize, provinces) {
    super(name, gridSize, tileSize)
    this.offscreenCanvas = document.createElement('canvas')
    this.prov = provinces
    this.provName = []
  }

  loopScreenMap (resLayer, offScreencontext) {

    Object.keys(this.prov).forEach(key => {
      let p = new Path2D(this.prov[key].path)
      offScreencontext.fillStyle = '#' + this.prov[key].color
      offScreencontext.fill(p)
      this.provName[this.prov[key].color] = key
    })


    return true
  }

  updateOffscreenMap (resLayer) {
    if (game.res.map == null) return
    resLayer.offscreenCanvas.width = Settings.gridSize.x * Settings.tileSize
    resLayer.offscreenCanvas.height = Settings.gridSize.y * Settings.tileSize
    const offScreencontext = resLayer.offscreenCanvas.getContext('2d')
    const loopDone = resLayer.loopScreenMap(resLayer, offScreencontext)
    if (!loopDone) {
      setTimeout(resLayer.updateOffscreenMap, 500, resLayer)
    }
  }

  rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
  }

  onMouseDown(e, hit) {
    if (hit) return
    
    var p = this.offscreenCanvas.getContext('2d').getImageData(e.canvasX, e.canvasY, 1, 1).data;
    var hex = ("000000" + this.rgbToHex(p[0], p[1], p[2])).slice(-6);

    if (this.selectedProvince == this.prov[this.provName[hex]]) 
      window.setProvince(this.provName[hex])
    else 
      window.selectProvince(this.prov[this.provName[hex]])

    console.log(this.provName[hex])
  }

  onMouseMove(e, hit) {
    if (hit) return
    
    var p = this.offscreenCanvas.getContext('2d').getImageData(e.canvasX, e.canvasY, 1, 1).data;
    var hex = ("000000" + this.rgbToHex(p[0], p[1], p[2])).slice(-6);

    this.provUnderMouse = this.prov[this.provName[hex]]
  }

  render (view) {
    this.view = view
    const ctx = view.ctx

    if (this.offscreenCanvas == null) return

    ctx.drawImage(this.offscreenCanvas, 0, 0)

    if(this.selectedProvince) {
      let p = new Path2D(this.selectedProvince.path)
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#000000'
      ctx.stroke(p)
    }
    if(this.provUnderMouse) {
      let p = new Path2D(this.provUnderMouse.path)
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#000000'
      ctx.stroke(p)
    }
  }
}
