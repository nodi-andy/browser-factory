import { Settings } from './common.js'
import { ViewModule } from './core/view.js'
import { Time } from './core/loop.js'
import { Inventory } from './core/inventory.js'
import { Terrain } from './terrain/terrain.js'
import { EntityLayer } from './entity/entityLayer.js'
import { ResLayer } from './res/resLayer.js'
import { DialogLayer } from './dialogs/dialogLayer.js'
import { ControlsLayer } from './controls/controlsLayer.js'

import elements from './imports.js'

window.classDB = {}
Settings.resID = []

elements.forEach((el) => {
  let key = Object.keys(el)[0]

  Settings.resID.push(key)
  let i = Settings.resID.length - 1

  window.classDB[key] = el[key]
  if (window.classDB[key]) window.classDB[key].id = i

  Settings.resDB[Settings.resID[i]] = {}
  Settings.resDB[Settings.resID[i]].id = i
  Settings.resName[i] = window.classDB[key]
})


window.canvas = document.getElementById('myCanvas')
window.context = window.canvas.getContext('2d')
window.canvas.width = window.innerWidth
window.canvas.height = window.innerHeight
window.canvas.oncontextmenu = function (e) { e.preventDefault() }
window.Time = Time
window.nextGameID = undefined
window.htmlList = document.getElementById('savedGameList')

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
  const gamesList = Object.values(Object.keys(window.localStorage))
  window.htmlList.innerHTML = ''
  for (const gameID in gamesList) {
    if (gamesList[gameID] === 'curGame') continue
    const gameDiv = document.createElement('div')
    gameDiv.id = gamesList[gameID]
    gameDiv.classList.add('gameEntry')
    if (gamesList[gameID] === window.game.name) gameDiv.classList.add('gameEntrySelected')
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
          window.canvas.focus()
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
  window.game = new ViewModule(window.canvas)
  updateNextGameID()
  if (name == null) name = 'unnamed_' + window.nextGameID

  if (window.game.state === 1) {
    window.game.state = 2
    window.game.stopped = () => { loadGame(name) }
    return
  }

  window.game.state = 1

  let savedData = JSON.parse(window.localStorage.getItem(name))
  if (!savedData) newGame(name)
  // try again, after creation
  savedData = JSON.parse(window.localStorage.getItem(name))

  window.game.name = name
  window.game.x = Settings.gridSize.x
  window.game.y = Settings.gridSize.y
  window.game.playerID = 0
  window.game.tick = 0
  window.game.allInvs = []

  window.terrain = new Terrain('terrain', Settings.gridSize, Settings.tileSize, savedData.terrain)
  window.game.addLayer(window.terrain)

  window.res = new ResLayer('resource', Settings.gridSize, Settings.tileSize, savedData.res)
  window.game.addLayer(window.res)

  window.entityLayer = new EntityLayer('entity', Settings.gridSize, Settings.tileSize, savedData.entity)
  window.game.addLayer(window.entityLayer)

  window.dialogLayer = new DialogLayer('dialog', Settings.gridSize, Settings.tileSize)
  window.game.addLayer(window.dialogLayer)

  window.controlLayer = new ControlsLayer('controls', Settings.gridSize, Settings.tileSize)
  window.game.addLayer(window.controlLayer)

  for (let i = 0; i < savedData.ents.length; i++) {
    const ent = savedData.ents[i]
    if (ent.name == "Inventory") {
      window.game.allInvs.push(new Inventory(ent.pos, ent))
    } else {
        window.game.allInvs.push(new window.classDB[ent.name](ent.pos, ent))
    }
  }

  window.game.allInvs.forEach(ent => {
    if (ent?.updateNB) ent.updateNB()
  })

  window.player = window.game.allInvs[window.game.playerID]
  window.player.id = window.game.playerID
  window.game.allInvs[window.player.id].type = Settings.resDB.Player.id
  Settings.pointer = window.game.allInvs[1]
  Settings.pointer.id = 1

  window.dialogLayer.createInvMenu(window.game.playerID)
  window.game.updateInventoryMenu(window.game.allInvs[window.game.playerID])
  updateGameMenu()
  window.terrain.updateOffscreenMap(window.terrain)
  window.res.updateOffscreenMap(window.res)
  window.Time.gameLoop()
}

function newGame (name) {
  if (name == null) name = 'unnamed_0'
  window.game = new ViewModule(window.canvas)
  window.game.name = name
  window.game.x = Settings.gridSize.x
  window.game.y = Settings.gridSize.y
  window.game.playerID = 0
  window.game.allInvs = []
  window.game.tick = 0

  window.terrain = new Terrain('terrain', Settings.gridSize, Settings.tileSize)
  window.game.addLayer(window.terrain)

  window.res = new ResLayer('resource', Settings.gridSize, Settings.tileSize)
  window.game.addLayer(window.res)

  window.entityLayer = new EntityLayer('entity', Settings.gridSize, Settings.tileSize)
  window.game.addLayer(window.entityLayer)

  window.dialogLayer = new DialogLayer('dialog', Settings.gridSize, Settings.tileSize)
  window.game.addLayer(window.dialogLayer)
  window.game.addLayer(new ControlsLayer('controls', Settings.gridSize, Settings.tileSize))

  window.player = new window.classDB.Player()
  window.game.allInvs.push(window.player)
  window.player.invID = window.game.allInvs.length - 1
  window.game.allInvs.push(new Inventory())

  saveGame(window.game)
}

function saveGame (game) {
  for (const [key, value] of Object.entries(window.game.allInvs)) {
    if (value?.layer) value.layer = value.layer.name
  }
  window.localStorage.setItem(window.game.name, JSON.stringify({ terrain: window.terrain.map, res: window.res.map, entity: window.entityLayer.map, ents: window.game.allInvs, playerID: window.game.playerID }))
  for (const [key, value] of Object.entries(window.game.allInvs)) {
    if (value?.layer) value.layer = window.game.layers[value.layer]
  }
}

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
loadGame(curGame)

window.addEventListener('resize', function () { window.game.resize() })

document.getElementById('openNavBtn').onclick = openNav
document.getElementById('closeNavBtn').onclick = closeNav
document.getElementById('saveGameBtn').onclick = saveGame
document.getElementById('newGameBtn').onclick = newGame
// requestAnimationFrame( render );
