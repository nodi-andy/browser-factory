import { Settings } from '../common.js'

class Entity {
  constructor (entList, x, y, dir, h, w, type, onClick) {
    this.pos = { x, y }
    this.dir = dir
    this.h = h
    this.w = w
    if (entList) {
      entList.push(this)
      this.id = entList.length - 1
    }

    this.type = type
    this.done = false
  }

  collision (p) {
    return (p.x > this.x && p.y > this.y && p.x < this.x + this.w && p.y < this.y + this.h)
  }

  draw (ctx) {
  }

  update (map) {

  }
}

export { Entity }
