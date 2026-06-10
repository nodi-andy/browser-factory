function createWorkshopWallAtlas () {
  const atlas = document.createElement('canvas')
  atlas.width = 256
  atlas.height = 64
  const ctx = atlas.getContext('2d')
  if (!ctx) return atlas

  const bases = ['#5f666f', '#676f79', '#59626c', '#646d77']
  for (let v = 0; v < 4; v++) {
    const ox = v * 64
    ctx.fillStyle = bases[v]
    ctx.fillRect(ox, 0, 64, 64)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)'
    ctx.fillRect(ox, 0, 64, 7)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)'
    ctx.fillRect(ox, 57, 64, 7)

    ctx.strokeStyle = 'rgba(15, 20, 30, 0.35)'
    ctx.lineWidth = 2
    for (let y = 10; y < 56; y += 14) {
      ctx.beginPath()
      ctx.moveTo(ox + 4 + (y % 3), y + 0.5)
      ctx.lineTo(ox + 60, y + 0.5)
      ctx.stroke()
    }
  }

  return atlas
}

export class WorkshopWall {
  static type = 'terrain'
  static playerCanWalkOn = false
  static useGeneratedImage = true
}

if (typeof document !== 'undefined') {
  WorkshopWall.img = createWorkshopWallAtlas()
}
