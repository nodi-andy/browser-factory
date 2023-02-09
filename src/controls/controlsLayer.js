import { Settings, dist } from '../common.js'
import { invfuncs } from '../core/inventory.js'
import { wssend } from '../core/socket.js'
import * as NC from 'nodicanvas'

export class ControlsLayer extends NC.NodiGrid {
  constructor (name) {
    super(name)
    this.start = new NC.Vec2(0, 0)
    this.start.started = false
    this.to = new NC.Vec2(0, 0)
    this.dir = new NC.Vec2(0, 0)
    this.force = 0
    this.rawPos = new NC.Vec2(0, 0)
    this.joystickCenter = new NC.Vec2(100, window.view.size.y * 0.90)
    this.joystickRadius = window.view.size.y * 0.05
  }

  // Gets the relevant location from a mouse or single touch event
  getEventLocation (e) {
    if (this.rawPos == null) this.rawPos = new NC.Vec2(0, 0)
    if (e.touches && e.touches.length === 1) {
      this.rawPos.x = e.touches[0].clientX
      this.rawPos.y = e.touches[0].clientY
    } else if (e.clientX && e.clientY) {
      this.rawPos.x = e.clientX
      this.rawPos.y = e.clientY
    }
  }

  onMouseDown (e, hit) {
    this.getEventLocation(e)
    this.start = this.joystickCenter.clone()

    if (this.rawPos.subtract(this.start).length() < 40) {
      this.start.started = true
      this.force = 0
      console.log('mouse down: ' + JSON.stringify(this.rawPos) + ' C:' + this.rawPos.subtract(this.start).length() < 40)
      return true
    }
  }

  onMouseMove (e, hit) {
    this.getEventLocation(e)
    if (this.start.started && this.rawPos) {
      this.to = this.rawPos.clone()
      this.to.subtract(this.start).divide(2)
      this.dir = this.to.clone().normalize()
      this.force = Math.min(20, this.to.clone().length())
      Settings.player.dir = this.dir
    }
    console.log(JSON.stringify(this.dir) + ' f: ' + this.force)
    return false
  }

  onMouseUp (e, hit) {
    this.start.started = false
    this.dir.x = 0
    this.dir.y = 0
    this.force = 0
    return false
  }

  render (view) {
    this.joystickCenter.x = this.joystickRadius * 2;
    this.joystickCenter.y = window.view.size.y * 0.90;
    this.joystickRadius = Settings.buttonSize.x / 2;

    const ctx = view.ctx
    ctx.resetTransform()
    ctx.beginPath()
    ctx.lineWidth = 5
    ctx.fillStyle = 'rgba(150, 150, 150, 0.75)'
    ctx.arc(this.joystickCenter.x, this.joystickCenter.y, this.joystickRadius, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.fill()
    ctx.closePath()

    ctx.beginPath()
    ctx.lineWidth = 5
    ctx.fillStyle = 'rgba(80, 20, 20, 1)'
    ctx.arc(this.joystickCenter.x + this.dir.x * this.force, this.joystickCenter.y + this.dir.y * this.force, this.joystickRadius / 2, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.fill()
    ctx.closePath()
  }
}
