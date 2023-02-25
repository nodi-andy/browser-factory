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
//import { provinces } from './world/germany.js'
import * as NC from 'nodicanvas'

import elements from './imports.js'

window.classDB = {}
window.classDBi = {}
Settings.resID = []

elements.forEach((el) => {
  let key = Object.keys(el)[0]

  if (key == null) return

  Settings.resID.push(key)
  let i = Settings.resID.length - 1

  window.classDB[key] = el[key]
  window.classDBi[i] = el[key]
  if (window.classDB[key]) window.classDB[key].id = i

  Settings.resDB[Settings.resID[i]] = {id: i}
  Settings.resName[i] = window.classDB[key]
})


function updateNextGameID () {
  const gamesList = Object.values(Object.keys(window.localStorage))
  window.nextGameID = 0
  for (let i = 0; i < gamesList.length; i++) {
    if (gamesList.includes('unnamed_' + i) === false) {
      window.nextGameID = i
      break
    }
  }
}

function updateGameMenu () {
  window.htmlList = document.getElementById('savedGameList')
  const gamesList = Object.values(Object.keys(window.localStorage))
  window.htmlList.innerHTML = ''
  for (const gameID in gamesList) {
    if (gamesList[gameID] === 'curGame') continue
    const gameDiv = document.createElement('div')
    gameDiv.id = gamesList[gameID]
    gameDiv.classList.add('gameEntry')
    if (gamesList[gameID] === gameName) gameDiv.classList.add('gameEntrySelected')
    const gameNameDiv = document.createElement('div')
    gameNameDiv.onclick = function () { loadGame(this.parentElement.id) }
    gameNameDiv.innerHTML = gamesList[gameID]
    gameDiv.appendChild(gameNameDiv)

    const renameGameDiv = document.createElement('div')
    renameGameDiv.classList.add('fas')
    renameGameDiv.classList.add('fa-edit')
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

    const remGameDiv = document.createElement('div')
    remGameDiv.classList.add('fas')
    remGameDiv.classList.add('fa-remove')
    remGameDiv.onclick = function () { remGame(this.parentElement.id) }

    gameDiv.appendChild(remGameDiv)

    window.htmlList.appendChild(gameDiv)
  }
}

function remGame (gameName) {
  window.localStorage.removeItem(gameName)
  updateGameMenu()
}

function openNav () {
  document.getElementById('myNav').style.left = (window.innerWidth - 300) + 'px'
}

function closeNav () {
  document.getElementById('myNav').style.left = '100%'
}

function loadGame (name) {
  updateNextGameID()

  if (name == null) name = 'unnamed_' + window.nextGameID

  let savedData = JSON.parse(window.localStorage.getItem(name))
  
  if (!savedData) createGame(name)

  // try again, after creation
  savedData = JSON.parse(window.localStorage.getItem(name))

  window.gameName = name

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
    document.body.appendChild(window.canvas); // adds the canvas to the body element
    window.uni.worldLayer = new World('world', new NC.Vec2(100,100), new NC.Vec2(10,10), provinces)
    window.uni.addLayer(window.uni.worldLayer)
    window.uni.canvas.style.display = "block"
    window.uni.worldLayer.updateOffscreenMap(window.uni.worldLayer)
    window.uni.name = name
    window.uni.state = 1

    window.uni.setCenter(600, 600)
    window.uni.focusOn()
    window.uni.start()
  }

  window.games = {}
  Object.keys(savedData).forEach(provinceName => {
    let savedProvinceData = savedData[provinceName]
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
    //newProvince.stop();

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

    let provinceData = savedData[provinceName]
    for (let i = 0; i < provinceData.ents.length; i++) {
      const ent = provinceData.ents[i]
      if (ent == null) continue
      if (ent?.name == "Inventory") {
        newProvince.allInvs.push(new Inventory(ent.pos, ent))
      } else {
        newProvince.allInvs.push(new window.classDB[ent.name](ent.pos, ent))
      }
    }

    newProvince.allInvs.forEach(ent => {
      if (ent?.updateNB) ent.updateNB()
    })

    newProvince.player = newProvince.allInvs[newProvince.playerID]
    Settings.pointer = newProvince.allInvs[1]
    Settings.pointer.id = 1

    newProvince.dialogLayer.createInvMenu(newProvince.playerID)
    newProvince.updateInventoryMenu(newProvince.allInvs[newProvince.playerID])
    
    newProvince.terrain.updateOffscreenMap(game.terrain)
    newProvince.res.updateOffscreenMap(game.res)

    // start game loop
    newProvince.time = new TimeLoop(newProvince)

    // add the province in province list
    games[newProvince.name] = newProvince
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

  Object.keys(provinces).forEach(key => {
    games[key] = new ViewModule()
    window.game = games[key]

    games[key].playerID = 0
    games[key].allInvs = []

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
    games[key].allInvs.push(games[key].player)
    games[key].invID = games[key].allInvs.length - 1
    games[key].allInvs.push(new Inventory())
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
setInterval(function () {saveGame}, 10000);

// LOAD IMAGES
Object.keys(window.classDB).forEach(key => {
    if (window.classDB[key] == null) return
    if (window.classDB[key].type == null) return

    let costs = window.classDB[key].cost
    if (costs) costs.forEach(cost => {cost.id = window.classDB[cost.id].id})

    const image = new Image(Settings.tileSize, Settings.tileSize)
    let imgName = window.classDB[key].imgName
    if (imgName == null) imgName = key.toLowerCase()
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



window.addEventListener('resize', function () { game.resize() })

window.selectProvince = (province) => {
  window.uni.worldLayer.selectedProvince = province
  document.getElementById('switchView').innerHTML = province.name
}

window.setProvince = (province) => {
  game = games[province]
  game.start()
  game.canvas.style.display = "block"

  window.uni.canvas.style.display = "none"
  window.uni.stop()
}

document.getElementById('openNavBtn').onclick = openNav
document.getElementById('closeNavBtn').onclick = closeNav
document.getElementById('saveGameBtn').onclick = saveGame
document.getElementById('newGameBtn').onclick = createGame


loadGame(curGame)