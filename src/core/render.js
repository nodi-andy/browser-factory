import { Settings } from '../common.js'

function imgLoaded (imgElement) {
  return imgElement.complete && imgElement.naturalHeight !== 0
}

function updateOffscreenMap () {
  if (Settings.game.map === undefined) return
  window.canvas.offScreenCanvas.width = Settings.gridSize.x * Settings.tileSize
  window.canvas.offScreenCanvas.height = Settings.gridSize.y * Settings.tileSize
  const offScreencontext = window.canvas.offScreenCanvas.getContext('2d')
  let hadError = false

  for (let ax = 0; ax < Settings.gridSize.x; ax++) {
    for (let ay = 0; ay < Settings.gridSize.y; ay++) {
      const tile = Settings.game.map[ax][ay]

      // MAP
      const type = tile[Settings.layers.terrain][0]
      const variant = tile[Settings.layers.terrain][1]
      if (Settings.resName[type]?.img?.complete) {
        offScreencontext.drawImage(Settings.resName[type].img, variant * 64, 0, Settings.tileSize, Settings.tileSize, ax * Settings.tileSize, ay * Settings.tileSize, Settings.tileSize, Settings.tileSize)
      } else {
        if (hadError === false) {
          hadError = true
          setTimeout(updateOffscreenMap, 1000)
        }
      }
    }
  }
}

export { updateOffscreenMap, imgLoaded }
