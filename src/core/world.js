// GENERATE TERRAIN
function generateTerrain (w, h) {
  const map = Array(w * h).fill(0)
  noise.seed(Math.random())
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      map[x * h + y] = (noise.perlin2(x / 10, y / 10) + 0.7) * 8
    }
  }
  return map
}

function createWorld (x, y) {
  const nCity = {
    id: 0,
    name: '',
    x: Math.floor(x / 10) * 10,
    y: Math.floor(y / 10) * 10,
    map: Array(c.gridSize.x).fill(0).map(() => Array(c.gridSize.y).fill(0).map(() => [[undefined, 0], { id: undefined, n: 0 }, undefined, 0])),
    camera: { x: 0, y: 0, zoom: 4 },
    res: [0, 100, 0, 0, 0, 0, 100, 0, 0, 0, 0],
    nb: [],
    w: [],
    dist: [],
    tick: 0
  }

  let terrainmap = generateTerrain(gridSize.x, gridSize.y)
  // discrete perlin
  for (let ax = 0; ax < nCity.map.length; ax++) {
    for (let ay = 0; ay < nCity.map[ax].length; ay++) {
      const perlinVal = terrainmap[ax * c.gridSize.y + ay]
      let resVal = 0
      if (perlinVal < 1) resVal = [c.resDB.deepsea.id, 0]
      else if (perlinVal < 2) resVal = [c.resDB.sea.id, 0]
      else if (perlinVal < 8) resVal = [c.resDB.grassland.id, Math.round(Math.random() * 3)]
      else resVal = [c.resDB.hills.id, Math.round(Math.random() * 3)]

      nCity.map[ax][ay][c.layers.terrain] = resVal
      nCity.map[ax][ay][c.layers.vis] = 0
    }
  }

  Object.keys(c.resDB).forEach(name => {
    const res = c.resDB[name]
    if (res.type == 'res' && res.id !== c.resDB.water.id) {
      terrainmap = generateTerrain(c.gridSize.x, c.gridSize.y)
      for (let ax = 0; ax < nCity.map.length; ax++) {
        for (let ay = 0; ay < nCity.map[ax].length; ay++) {
          const perlinVal = terrainmap[ax * c.gridSize.y + ay]
          if (perlinVal > 8 &&
                        nCity.map[ax][ay][c.layers.res].id == undefined &&
                        nCity.map[ax][ay][c.layers.terrain][0] == c.resDB.grassland.id) {
            nCity.map[ax][ay][c.layers.res].id = res.id
            nCity.map[ax][ay][c.layers.res].n = Math.round((perlinVal - 8) * 200)
          }
        }
      }
    }
  })

  return nCity
}
