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
    this.joystickRadius = 0

    this.menuButton = new Button()
    this.menuButton.onClick = () => {
      if (window.openNav) window.openNav()
    }

    this.buildButton = new Button()
    this.buildButton.item = classDB.IronAxe
    this.buildButton.onClick = () => {
      game.entityLayer.onKeyUp({ code: 'KeyE' })
    }

    const helpScope = typeof window !== 'undefined' ? (window.gameName || 'default') : 'default'
    const gestureKey = `gestureHintSeenV2:${helpScope}`
    this.helpStepKey = `firstTimeHelpStepV1:${helpScope}`

    this.hintUntil = 0
    if (typeof window !== 'undefined' && window.localStorage && !window.localStorage.getItem(gestureKey)) {
      this.hintUntil = Date.now() + 6000
      window.localStorage.setItem(gestureKey, '1')
    }

    this.helpStep = 0
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedStep = parseInt(window.localStorage.getItem(this.helpStepKey), 10)
      if (!Number.isNaN(storedStep)) this.helpStep = storedStep
    }
    this.helpResourceTile = null
    this.helpResourceAt = 0
    this.resourceIds = this.getResourceIds()
    this.furnaceId = window.classDB?.StoneFurnace?.id
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
    const radius = this.joystickRadius || (Settings.buttonSize.x * 0.75)
    const pointer = { x: this.rawPos.x, y: this.rawPos.y }

    if (this.rawPos.clone().subtract(this.start).length() < radius) {
      this.start.started = true
      this.force = 0
      overlayClicked = true
    }
    if (this.menuButton.collision(pointer, this.menuButton)) { overlayClicked = true }
    if (this.buildButton.collision(pointer, this.buildButton)) { overlayClicked = true }
    return overlayClicked
  }

  onMouseMove (e, hit) {
    this.getEventLocation(e)
    let isOverlay = false
    const pointer = { x: this.rawPos.x, y: this.rawPos.y }
    this.menuButton.hover = false
    this.buildButton.hover = false
    if (this.start.started && this.rawPos) {
      this.to = this.rawPos.clone()
      this.to.subtract(this.start).divide(2)
      this.dir = this.to.clone().normalize()
      this.force = Math.min(20, this.to.clone().length())
      window.player.dir = this.dir
      isOverlay = true
    }
    //console.log(JSON.stringify(this.dir) + ' f: ' + this.force)

    if (this.menuButton.collision(pointer)) { this.menuButton.hover = true; isOverlay = true }
    if (this.buildButton.collision(pointer)) { this.buildButton.hover = true; isOverlay = true }
    return isOverlay
  }

  onMouseUp (e, hit) {
    if (hit) return
    let overlayClicked = false
    this.getEventLocation(e)
    const pointer = { x: this.rawPos.x, y: this.rawPos.y }

    this.start.started = false
    this.dir.x = 0
    this.dir.y = 0
    this.force = 0

    if (this.menuButton.collision(pointer) && this.menuButton.onClick) { this.menuButton.onClick(e.which, this.menuButton); overlayClicked = true }
    if (this.buildButton.collision(pointer) && this.buildButton.onClick) { this.buildButton.onClick(e.which, this.buildButton); overlayClicked = true }
    return overlayClicked
  }

  render (view) {
    const size = Settings.buttonSize.x
    const padding = Math.max(10, size * 0.35)
    const rightX = this.view.canvasSize.x - padding - size

    this.joystickRadius = Math.max(24, size * 0.75)
    this.joystickCenter.x = padding + this.joystickRadius
    this.joystickCenter.y = this.view.canvasSize.y - padding - this.joystickRadius

    const ctx = view.ctx
    ctx.resetTransform()
    ctx.save()
    ctx.beginPath()
    ctx.lineWidth = Math.max(2, this.joystickRadius * 0.08)
    ctx.fillStyle = 'rgba(20, 20, 20, 0.65)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.arc(this.joystickCenter.x, this.joystickCenter.y, this.joystickRadius, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.fill()
    ctx.closePath()

    ctx.beginPath()
    ctx.lineWidth = Math.max(2, this.joystickRadius * 0.08)
    ctx.fillStyle = 'rgba(220, 220, 220, 0.9)'
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.arc(this.joystickCenter.x + this.dir.x * this.force, this.joystickCenter.y + this.dir.y * this.force, this.joystickRadius * 0.55, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.fill()
    ctx.closePath()
    ctx.restore()

    this.menuButton.x = rightX
    this.menuButton.y = padding

    this.buildButton.x = rightX
    this.buildButton.y = this.view.canvasSize.y - padding - size

    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
    ctx.shadowBlur = Math.max(6, size * 0.2)
    this.menuButton.draw(ctx)
    this.buildButton.draw(ctx)
    ctx.restore()

    const menuPad = size * 0.25
    ctx.save()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.lineWidth = Math.max(2, size * 0.08)
    ctx.lineCap = 'round'
    for (let i = 0; i < 3; i++) {
      const y = this.menuButton.screen.y + menuPad + i * (size * 0.2)
      ctx.beginPath()
      ctx.moveTo(this.menuButton.screen.x + menuPad, y)
      ctx.lineTo(this.menuButton.screen.x + size - menuPad, y)
      ctx.stroke()
    }
    ctx.restore()

    if (this.hintUntil > Date.now()) {
      const hintText = 'Press and drag to rotate. Drag to edge to remove.'
      const fontSize = Math.max(12, Math.round(size * 0.35))
      ctx.save()
      ctx.font = `${fontSize}px Arial`
      const paddingX = Math.max(10, Math.round(fontSize * 0.8))
      const paddingY = Math.max(6, Math.round(fontSize * 0.6))
      const metrics = ctx.measureText(hintText)
      const w = metrics.width + paddingX * 2
      const h = fontSize + paddingY * 2
      const x = (this.view.canvasSize.x - w) / 2
      const y = padding + h * 0.2
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
      ctx.fillRect(x, y, w, h)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
      ctx.textBaseline = 'middle'
      ctx.fillText(hintText, x + paddingX, y + h / 2)
      ctx.restore()
    }

    this.updateHelpStep()
    if (this.helpStep < 4) {
      const viewSize = { x: this.view?.canvasSize?.x || ctx.canvas.width, y: this.view?.canvasSize?.y || ctx.canvas.height }
      if (this.helpStep === 0) {
        const joystickTarget = { x: this.joystickCenter.x, y: this.joystickCenter.y }
        this.drawCallout(ctx, viewSize, 'Move with the joystick', joystickTarget, { dx: 16, dy: -80 })
      } else if (this.helpStep === 1) {
        const resourceTile = this.getNearestResourceTile()
        if (resourceTile) {
          const worldPos = {
            x: (resourceTile.x + 0.5) * Settings.tileSize,
            y: (resourceTile.y + 0.5) * Settings.tileSize
          }
          const resTarget = this.worldToScreen(view, worldPos)
          this.drawCallout(ctx, viewSize, 'Tap resources to gather', resTarget, { dx: 16, dy: -80 })
        } else {
          const centerTarget = { x: viewSize.x / 2, y: viewSize.y / 2 }
          this.drawCallout(ctx, viewSize, 'Find resources and tap to gather', centerTarget, { dx: -160, dy: -60 })
        }
      } else if (this.helpStep === 2) {
        const toolboxTarget = {
          x: this.buildButton.screen.x + size / 2,
          y: this.buildButton.screen.y + size / 2
        }
        this.drawCallout(ctx, viewSize, 'Toolbox: items and crafting', toolboxTarget, { dx: -200, dy: -60 })
      } else if (this.helpStep === 3) {
        const goalTarget = { x: viewSize.x / 2, y: Math.max(40, padding * 1.2) }
        this.drawCallout(ctx, viewSize, 'Goal: craft a Stone Furnace', goalTarget, { dx: -140, dy: 0 })
      }
    }
  }

  worldToScreen (view, pos) {
    if (view?.worldToScreen) return view.worldToScreen(pos)
    const sx = view?.sx ?? 1
    const sy = view?.sy ?? 1
    const tx = view?.tx ?? 0
    const ty = view?.ty ?? 0
    return { x: (pos.x + tx) * sx, y: (pos.y + ty) * sy }
  }

  getNearestResourceTile () {
    if (this.helpResourceTile && (Date.now() - this.helpResourceAt) < 1000) return this.helpResourceTile
    const center = window.player?.tilePos
    if (!center || !game?.res?.map) return null
    const maxR = 20
    let found = null
    for (let r = 1; r <= maxR && !found; r++) {
      for (let dx = -r; dx <= r && !found; dx++) {
        for (let dy = -r; dy <= r && !found; dy++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue
          const x = Math.round(center.x + dx)
          const y = Math.round(center.y + dy)
          const res = game.res.getResourceXY(x, y)
          if (res?.id != null && res.n > 0) {
            found = { x, y }
          }
        }
      }
    }
    this.helpResourceTile = found
    this.helpResourceAt = Date.now()
    return found
  }

  updateHelpStep () {
    if (this.helpStep >= 4) return
    if (this.helpStep === 0) {
      const dir = window.player?.dir
      if ((Math.abs(dir?.x || 0) + Math.abs(dir?.y || 0)) > 0.01 || (Math.abs(this.dir.x) + Math.abs(this.dir.y)) > 0.01) {
        this.setHelpStep(1)
      }
      return
    }
    if (this.helpStep === 1) {
      if (this.playerHasAnyOf(this.resourceIds)) this.setHelpStep(2)
      return
    }
    if (this.helpStep === 2) {
      if (window.invMenu?.vis) this.setHelpStep(3)
      return
    }
    if (this.helpStep === 3) {
      if (this.furnaceId != null && this.playerHasAnyOf([this.furnaceId])) this.setHelpStep(4)
    }
  }

  setHelpStep (step) {
    if (step <= this.helpStep) return
    this.helpStep = step
    if (typeof window !== 'undefined' && window.localStorage && this.helpStepKey) {
      window.localStorage.setItem(this.helpStepKey, String(step))
    }
  }

  playerHasAnyOf (ids) {
    if (!ids || ids.length === 0) return false
    const inv = window.player
    if (!inv?.stack) return false
    const present = new Set()
    Object.keys(inv.stack).forEach(key => {
      const stack = inv.stack[key]
      if (Array.isArray(stack)) {
        stack.forEach(pack => { if (pack?.id != null) present.add(pack.id) })
      } else if (stack?.packs && Array.isArray(stack.packs)) {
        stack.packs.forEach(pack => { if (pack?.id != null) present.add(pack.id) })
      } else if (stack?.id != null) {
        present.add(stack.id)
      }
    })
    return ids.some(id => present.has(id))
  }

  getResourceIds () {
    const ids = []
    const names = ['Iron', 'Copper', 'Stone', 'Coal', 'Wood', 'RawWood']
    names.forEach(name => {
      const id = window.classDB?.[name]?.id
      if (id != null) ids.push(id)
    })
    return ids
  }

  drawCallout (ctx, viewSize, text, target, offset) {
    if (!target) return
    const fontSize = Math.max(12, Math.round(Settings.buttonSize.x * 0.3))
    const padding = Math.max(6, Math.round(fontSize * 0.6))
    ctx.save()
    ctx.font = `${fontSize}px Arial`
    const metrics = ctx.measureText(text)
    const w = metrics.width + padding * 2
    const h = fontSize + padding * 2
    let x = target.x + (offset?.dx || 0)
    let y = target.y + (offset?.dy || 0)
    x = Math.min(Math.max(8, x), viewSize.x - w - 8)
    y = Math.min(Math.max(8, y), viewSize.y - h - 8)

    const anchorX = x + w / 2
    const anchorY = y + h / 2
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)'
    ctx.lineWidth = Math.max(1, fontSize * 0.08)
    ctx.beginPath()
    ctx.moveTo(target.x, target.y)
    ctx.lineTo(anchorX, anchorY)
    ctx.stroke()

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, x + padding, y + h / 2)
    ctx.restore()
  }
}
