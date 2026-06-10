function createWorkshopFloorAtlas () {
  const atlas = document.createElement('canvas')
  atlas.width = 256
  atlas.height = 64
  const ctx = atlas.getContext('2d')
  if (!ctx) return atlas

  const bases = ['#e9e5da', '#e4dfd2', '#ddd7ca', '#e7e2d6']
  for (let v = 0; v < 4; v++) {
    const ox = v * 64
    ctx.fillStyle = bases[v]
    ctx.fillRect(ox, 0, 64, 64)

    ctx.strokeStyle = 'rgba(70, 70, 70, 0.15)'
    ctx.lineWidth = 1
    for (let x = 0; x <= 64; x += 16) {
      ctx.beginPath()
      ctx.moveTo(ox + x + 0.5, 0)
      ctx.lineTo(ox + x + 0.5, 64)
      ctx.stroke()
    }
    for (let y = 0; y <= 64; y += 16) {
      ctx.beginPath()
      ctx.moveTo(ox, y + 0.5)
      ctx.lineTo(ox + 64, y + 0.5)
      ctx.stroke()
    }

    ctx.fillStyle = 'rgba(40, 40, 40, 0.08)'
    ctx.fillRect(ox + 4 + v, 6, 8, 8)
    ctx.fillRect(ox + 46, 42 - v, 10, 10)
  }

  return atlas
}

export class WorkshopFloor {
  static type = 'terrain'
  static useGeneratedImage = true
}

if (typeof document !== 'undefined') {
  WorkshopFloor.img = createWorkshopFloorAtlas()
}
