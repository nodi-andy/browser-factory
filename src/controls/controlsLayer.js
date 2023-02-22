import { Settings } from '../common.js'
import { Button } from '../dialogs/button.js'
import * as NC from 'nodicanvas'

export class ControlsLayer extends NC.NodiGrid {
  constructor (name, gridSize, tileSize) {
    super(name, gridSize, tileSize)
    this.start = new NC.Vec2(0, 0)
    this.start.started = false
    this.to = new NC.Vec2(0, 0)
    this.dir = new NC.Vec2(0, 0)
    this.force = 0
    this.rawPos = new NC.Vec2(0, 0)
    this.joystickCenter = new NC.Vec2()
    this.joystickRadius = new NC.Vec2()

    this.showInvButton = new Button()
    const image = new Image(this.tileSize, this.tileSize)
    image.src = './controls/tools.png'
    this.showInvButton.img = image

    this.showInvButton.onClick = () => {
      window.game.entityLayer.onKeyUp({ code: 'KeyE' })
    }

    this.buildButton = new Button()
    this.buildButton.item = Settings.resDB.iron_axe
    this.buildButton.onClick = () => {
      window.game.entityLayer.onKeyDown({ code: 'Enter' })
    }

    this.rotateButton = new Button()
    const imageRotateButton = new Image(this.tileSize, this.tileSize)
    imageRotateButton.src = './controls/rotate.png'
    this.rotateButton.img = imageRotateButton
    this.rotateButton.onClick = () => {
      window.game.entityLayer.onKeyUp({ code: 'KeyR' })
    }
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
    let overlayClicked = false

    this.getEventLocation(e)
    this.start = this.joystickCenter.clone()

    if (this.rawPos.subtract(this.start).length() < 40) {
      this.start.started = true
      this.force = 0
      console.log('mouse down: ' + JSON.stringify(this.rawPos) + ' C:' + this.rawPos.subtract(this.start).length() < 40)
      overlayClicked = true
    }
    if (this.showInvButton.collision(e, this.showInvButton)) { overlayClicked = true }
    if (this.buildButton.collision(e, this.buildButton)) { overlayClicked = true }
    if (this.rotateButton.collision(e, this.rotateButton)) { overlayClicked = true }
    return overlayClicked
  }

  onMouseMove (e, hit) {
    this.getEventLocation(e)
    let isOverlay = false
    if (this.start.started && this.rawPos) {
      this.to = this.rawPos.clone()
      this.to.subtract(this.start).divide(2)
      this.dir = this.to.clone().normalize()
      this.force = Math.min(20, this.to.clone().length())
      window.player.dir = this.dir
      isOverlay = true
    }
    //console.log(JSON.stringify(this.dir) + ' f: ' + this.force)

    if (this.showInvButton.collision(e)) { this.showInvButton.hover = true; isOverlay = true }
    if (this.buildButton.collision(e)) { this.buildButton.hover = true; isOverlay = true }
    if (this.rotateButton.collision(e)) { this.rotateButton.hover = true; isOverlay = true }
    return isOverlay
  }

  onMouseUp (e, hit) {
    if (hit) return
    let overlayClicked = false

    this.start.started = false
    this.dir.x = 0
    this.dir.y = 0
    this.force = 0

    if (this.showInvButton.collision(e) && this.showInvButton.onClick) { this.showInvButton.onClick(e.which, this.showInvButton); overlayClicked = true }
    if (this.buildButton.collision(e) && this.buildButton.onClick) { this.buildButton.onClick(e.which, this.buildButton); overlayClicked = true }
    if (this.rotateButton.collision(e) && this.rotateButton.onClick) { this.rotateButton.onClick(e.which, this.rotateButton); overlayClicked = true }
    return overlayClicked
  }

  render (view) {
    this.joystickCenter.x = this.joystickRadius * 2
    this.joystickCenter.y = this.view.canvasSize.y * 0.90
    this.joystickRadius = Settings.buttonSize.x / 2

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

    this.showInvButton.x = this.view.canvasSize.x - this.showInvButton.size.x * 1.5
    this.showInvButton.y = this.view.canvasSize.y - this.showInvButton.size.y * 1.5
    this.showInvButton.draw(ctx)

    this.buildButton.x = this.showInvButton.x
    this.buildButton.y = this.showInvButton.y - 1.1 * Settings.buttonSize.y
    this.buildButton.draw(ctx)

    this.rotateButton.x = this.buildButton.x
    this.rotateButton.y = this.buildButton.y - 1.1 * Settings.buttonSize.y
    this.rotateButton.draw(ctx)
  }
}
