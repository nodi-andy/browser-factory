import { Settings, provinces } from './common.js'
import { ViewModule } from './core/view.js'
import { TimeLoop } from './core/loop.js'
import { Inventory } from './core/inventory.js'
import { Terrain } from './terrain/terrain.js'
import { EntityLayer } from './entity/entityLayer.js'
import { World } from './world/world.js'
import { ResLayer } from './res/resLayer.js'
import { DialogLayer } from './dialogs/dialogLayer.js'
import { ControlsLayer } from './controls/controlsLayer.js'
import { elements, version} from './imports.js'
import * as NC from 'nodicanvas'

console.log("📦: Browser factory")
console.log("🚀: " + version)

for(let i = 0; i < elements.length; i++) {
  let el = elements[i]
  let key = Object.keys(el)[0]
  if (key == null) continue

  window.classDB[key] = el[key]
  // also register a lowercase alias for legacy references (e.g. classDB.steam)
  try {
    window.classDB[key.toLowerCase()] = el[key]
  } catch (e) {}
  window.classDBi[i] = el[key]
  if (window.classDB[key]) window.classDB[key].id = i
  if (window.classDB[key.toLowerCase()]) window.classDB[key.toLowerCase()].id = i
}

function isSavedGameData (raw) {
  if (!raw) return false
  let data
  try {
    data = JSON.parse(raw)
  } catch {
    return false
  }
  if (data == null || typeof data !== 'object') return false
  const provinceKeys = Object.keys(provinces)
  for (const key of provinceKeys) {
    const province = data[key]
    if (province == null || typeof province !== 'object') continue
    if ('terrain' in province && 'res' in province && 'entity' in province && 'ents' in province) {
      return true
    }
  }
  return false
}

function getSavedGameKeys () {
  const keys = Object.keys(window.localStorage || {})
  return keys.filter(key => isSavedGameData(window.localStorage.getItem(key)))
}

function updateNextGameID () {
  const gamesList = getSavedGameKeys()
  window.nextGameID = 0
  for (let i = 0; ; i++) {
    if (gamesList.includes('unnamed_' + i) === false) {
      window.nextGameID = i
      break
    }
  }
}

function updateGameMenu () {
  window.htmlList = document.getElementById('savedGameList')
  const gamesList = getSavedGameKeys()
  window.htmlList.innerHTML = ''
  for (const gameID in gamesList) {
    if (gamesList[gameID] === 'curGame') continue
    const gameDiv = document.createElement('div')
    gameDiv.id = gamesList[gameID]
    gameDiv.classList.add('gameEntry')
    if (gamesList[gameID] === gameName) gameDiv.classList.add('gameEntrySelected')
    const gameNameDiv = document.createElement('div')
    gameNameDiv.classList.add('gameEntryName')
    gameNameDiv.onclick = function () { loadGame(this.parentElement.id) }
    gameNameDiv.innerHTML = gamesList[gameID]
    gameDiv.appendChild(gameNameDiv)

    const renameGameDiv = document.createElement('button')
    renameGameDiv.type = 'button'
    renameGameDiv.classList.add('gameEntryAction', 'fas', 'fa-edit')
    renameGameDiv.nameItem = gameNameDiv
    renameGameDiv.onclick = function () {
      this.nameItem.contentEditable = true
      this.nameItem.onclick = function () {}
      this.nameItem.onkeydown = function (event) {
        if (event.keyCode === 13) {
          event.preventDefault()
          this.contentEditable = false
          this.classList.remove('editable')
          game.canvas.focus()
          window.localStorage.setItem(this.innerHTML, window.localStorage.getItem(this.parentElement.id))
          window.localStorage.removeItem(this.parentElement.id)
        }
      }
      this.nameItem.classList.add('editable')
    }
    gameDiv.appendChild(renameGameDiv)

    const remGameDiv = document.createElement('button')
    remGameDiv.type = 'button'
    remGameDiv.classList.add('gameEntryAction', 'fas', 'fa-remove')
    remGameDiv.onclick = function () { remGame(this.parentElement.id) }

    gameDiv.appendChild(remGameDiv)

    window.htmlList.appendChild(gameDiv)
  }
}

function remGame (gameName) {
  window.localStorage.removeItem(gameName)
  updateGameMenu()
}

function setNavOpen (open) {
  const nav = document.getElementById('myNav')
  if (!nav) return
  nav.classList.toggle('open', open)
  nav.setAttribute('aria-hidden', open ? 'false' : 'true')
}

function openNav () {
  setNavOpen(true)
}

function closeNav () {
  setNavOpen(false)
}

function toggleNav () {
  const nav = document.getElementById('myNav')
  const isOpen = nav?.classList.contains('open')
  setNavOpen(!isOpen)
}
window.openNav = openNav
window.closeNav = closeNav

function loadGame (name) {

  if (window.game) {
    window.game.stop()
    saveGame()
  }

  updateNextGameID()

  if (name == null || typeof(name) == 'object') name = 'unnamed_' + window.nextGameID

  let savedData = JSON.parse(window.localStorage.getItem(name))
  
  if (!savedData) {
     createGame(name)

    // try again, after creation
    savedData = JSON.parse(window.localStorage.getItem(name))
  }

  gameName = name
  if (window.localStorage) {
    window.localStorage.setItem('curGame', gameName)
  }

  if (provinces.single == null) {
    let showWorldButton = document.createElement('div')
    showWorldButton.id = 'switchView'
    showWorldButton.class = 'switchView'
    showWorldButton.style = 'font-size:30px;cursor:pointer'
    showWorldButton.innerHtml = 'World'
    showWorldButton.onclick = function(){
      window.uni.start()
      window.uni.canvas.style.display = "block"
  
      if (game.canvas) game.canvas.style.display = "none"
      game.stop()
    }
    document.body.appendChild(showWorldButton);

    window.uni = new ViewModule(document.createElement('canvas'))
    window.uni.canvas.style = "display:block; border:none; margin:0"
    window.uni.canvas.id = 'myCanvasWorld'
    window.uni.canvas.width = window.innerWidth
    window.uni.canvas.height = window.innerHeight
    window.uni.canvas.oncontextmenu = function (e) { e.preventDefault() }
    //document.body.appendChild(window.uni.canvas); // adds the canvas to the body element
    window.uni.worldLayer = new World('world', new NC.Vec2(100,100), new NC.Vec2(10,10), provinces)
    window.uni.addLayer(window.uni.worldLayer)
    window.uni.canvas.style.display = "block"
    window.uni.worldLayer.updateOffscreenMap(window.uni.worldLayer)
    window.uni.name = name

    window.uni.setCenter(600, 600)
    window.uni.focusOn()
    window.uni.start()
  }

  window.games = {}
  window.player = null
  Object.keys(savedData).forEach(provinceName => {
    let savedProvinceData = savedData[provinceName]
    if (savedProvinceData.terrain) {
      let newProvince = new ViewModule(document.createElement('canvas'))
      newProvince.canvas.id = 'myCanvas'+ provinceName
      newProvince.canvas.style = "display:none; border:none; margin:0"
      newProvince.canvas.width = window.innerWidth
      newProvince.canvas.height = window.innerHeight
      newProvince.canvas.oncontextmenu = function (e) { e.preventDefault() }
      newProvince.name = provinceName
      newProvince.playerID = 0
      newProvince.allInvs = []

      document.body.appendChild(newProvince.canvas); // adds the canvas to the body element

      window.game = newProvince

      newProvince.terrain = new Terrain('terrain', Settings.gridSize, Settings.tileSize, savedProvinceData.terrain)
      newProvince.addLayer(newProvince.terrain)

      newProvince.res = new ResLayer('resource', Settings.gridSize, Settings.tileSize, savedProvinceData.res)
      newProvince.addLayer(newProvince.res)

      newProvince.entityLayer = new EntityLayer('entity', Settings.gridSize, Settings.tileSize, savedProvinceData.entity)
      newProvince.addLayer(newProvince.entityLayer)

      newProvince.dialogLayer = new DialogLayer('dialog', Settings.gridSize, Settings.tileSize)
      newProvince.addLayer(newProvince.dialogLayer)

      newProvince.controlLayer = new ControlsLayer('controls', Settings.gridSize, Settings.tileSize)
      newProvince.addLayer(newProvince.controlLayer)

      for (const ent of Object.values(savedProvinceData.ents)) {
        if (ent == null) continue
        if (ent?.name === "Inventory" || ent?.type == null) {
          newProvince.allInvs[ent.id] = new Inventory(ent.pos, ent)
          continue
        }

        const entClass = window.classDBi[ent.type] || window.classDB[ent.name]
        if (typeof entClass === 'function') {
          newProvince.allInvs[ent.id] = new entClass(ent.pos, ent)
        } else {
          console.warn('Unknown entity type while loading save:', ent)
        }
      }

      newProvince.allInvs.forEach(ent => {
        if (ent) Inventory.normalizeEntityStacks(ent)
      })

      newProvince.allInvs.forEach(ent => {
        if (ent?.updateNB) ent.updateNB()
      })

      newProvince.player = newProvince.allInvs[newProvince.playerID]
      Settings.pointer = newProvince.allInvs[1]
      Settings.pointer.id = 1

      newProvince.dialogLayer.createInvMenu(newProvince.playerID)
      newProvince.updateInventoryMenu(newProvince.allInvs[newProvince.playerID])
      
      newProvince.terrain.updateOffscreenMap(game.terrain)
      newProvince.res.updateOffscreenMap()

      // start game loop
      newProvince.time = new TimeLoop(newProvince)

      // add the province in province list
      games[newProvince.name] = newProvince
    }
  })

  window.player = game.allInvs[game.playerID]
  window.player.id = game.playerID

  if (game.canvas) {
    // Multiple maps?
    if (provinces.single == null) {
      game.canvas.style.display = "none"
      game.stop()
    }  else {
      game.canvas.style.display = "block"
      game.start()
      game.resize() // just for redraw
    }
  }

  updateGameMenu()
}

function createGame (name) {
  if (name == null) name = 'unnamed_0'
  gameName = name
  window.games = {}
  window.games.version = version
  Object.keys(provinces).forEach(key => {
    games[key] = new ViewModule()
    window.game = games[key]

    games[key].playerID = 0
    games[key].allInvs =  {}

    games[key].terrain = new Terrain('terrain', Settings.gridSize, Settings.tileSize)
    games[key].addLayer(game.terrain)

    games[key].res = new ResLayer('resource', Settings.gridSize, Settings.tileSize)
    games[key].addLayer(game.res)

    games[key].entityLayer = new EntityLayer('entity', Settings.gridSize, Settings.tileSize)
    games[key].addLayer(game.entityLayer)

    games[key].dialogLayer = new DialogLayer('dialog', Settings.gridSize, Settings.tileSize)
    games[key].addLayer(game.dialogLayer)

    games[key].addLayer(new ControlsLayer('controls', Settings.gridSize, Settings.tileSize))

    games[key].player = new window.classDB.Player()
    games[key].player.id = 0
    games[key].allInvs[0] = games[key].player
    games[key].invID = games[key].allInvs.length - 1
    games[key].allInvs[1] = new Inventory()
    games[key].allInvs[1].id = 1
  })
  window.player = game.player
  saveGame()
}

function saveGame () {
  let provinceList = Object.keys(provinces)
  provinceList.forEach(provinceName => {
    let province = games[provinceName]
    for (const [key, value] of Object.entries(province.allInvs)) {
      if (value?.layer) value.layer = value.layer.name
    }  
  })

  let gameContent = {}
  gameContent.version = window.games.version
  provinceList.forEach(provinceName => {
    let province = games[provinceName]
    gameContent[provinceName]  = {terrain: province.terrain.map, res: province.res.map, entity: province.entityLayer.map, ents: province.allInvs, playerID: province.playerID }
  })

  window.localStorage.setItem(gameName, JSON.stringify(gameContent))

  provinceList.forEach(provinceName => {
    let province = games[provinceName]
    for (const [key, value] of Object.entries(province.allInvs)) {
      if (value?.layer) value.layer = game.layers[value.layer]
    }
  })
}

// Save Game Loop
setInterval(saveGame, 60000);

// LOAD IMAGES
Object.keys(window.classDB).forEach(key => {
    if (window.classDB[key] == null) return
    if (window.classDB[key].type == null) return

    let costs = window.classDB[key].cost
    if (costs) costs.forEach(cost => {
      if (!cost || cost.id == null) return
      // if cost.id is already a numeric id, keep it
      if (typeof cost.id === 'number') return
      // cost.id expected to be a string name; try direct and lowercase lookups
      const name = cost.id
      const target = window.classDB[name] || (typeof name === 'string' ? window.classDB[name.toLowerCase()] : undefined)
      if (target && target.id != null) cost.id = target.id
      else console.warn('[game] Unknown cost item:', cost.id, 'for', key)
    })

    let imgName = window.classDB[key].imgName
    if (imgName == null) imgName = key.toLowerCase()
    const image = new Image(Settings.tileSize, Settings.tileSize)
    image.src = './' + window.classDB[key].type + '/' + imgName + '/' +  imgName + '.png'
    window.classDB[key].img = image
  }
)

window.saveGame = saveGame
let curGame = window.localStorage.getItem('curGame')
if (curGame == null) {
  window.localStorage.setItem('curGame', 'unnamed_0')
  curGame = 'unnamed_0'
}



window.addEventListener('resize', function () {
  if (window.game?.resize) window.game.resize()
})

window.selectProvince = (province) => {
  if (!province) return
  window.uni.worldLayer.selectedProvince = province
  document.getElementById('switchView').innerHTML = province.name
}

const closeNavBtn = document.getElementById('closeNavBtn')
if (closeNavBtn) closeNavBtn.onclick = closeNav
const nav = document.getElementById('myNav')
if (nav) {
  nav.addEventListener('click', (event) => {
    if (event.target === nav) closeNav()
  })
}
document.addEventListener('keydown', (event) => {
  if (event.code === 'Escape') closeNav()
})
document.getElementById('saveGameBtn').onclick = saveGame
document.getElementById('newGameBtn').onclick = loadGame
const storeBtn = document.getElementById('storeBtn')
if (storeBtn) {
  storeBtn.onclick = () => {
    game.entityLayer.onKeyUp({ code: 'KeyE' })
    closeNav()
  }
}


loadGame(curGame)
