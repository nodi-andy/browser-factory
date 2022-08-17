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
    ctx.font = '8px Arial'
    ctx.fillStyle = 'black'
    ctx.fillText(resDB[Object.keys(resDB)[this.id]].emo, this.x * tileSize, this.y * tileSize + 8)
  }

  update (map) {

  }
}

if (exports == undefined) var exports = {}
exports.Entity = Entity

const e = { Entity }
