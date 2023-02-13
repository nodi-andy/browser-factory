/* eslint-disable no-unmodified-loop-condition */
import { Settings } from '../common.js'

export class Inventory {
  constructor (pos, entData) {
    this.stack = {}
    if (pos) this.pos = { x: pos.x, y: pos.y }
    this.stacksize = 1
    this.packsize = {}
    this.packsize.INV = 4
    this.itemsize = 1
    if (entData) Object.assign(this, entData)
  }

  getStackName () {
    return 'INV'
  }

  moveItemTo (item, to, toStackname) {
    if (to === undefined) return false
    if (this.remItem(item)) {
      if (to.addItem(item, toStackname)) {
        return true
      } else {
        this.addItem(item)
        return false
      }
    }
    return false
  }

  getFilledStackSize () {
    let ret = 0
    const keys = Object.keys(this.stack)
    for (let iStack = 0; iStack < keys.length; iStack++) {
      const key = keys[iStack]
      if (this.stack[key]?.id || this.stack[key][0]?.id) ret++
    }
    return ret
  }

  // use this.hasPlaceFor()
  addItem (newItem, stackName) {
    if (newItem === undefined) return false
    if (stackName === undefined) stackName = 'INV'
    if (this.hasPlaceFor(newItem, stackName) === false) return false
    if (this.stacksize === undefined) this.stacksize = 1

    if (this.stack[stackName] === undefined) {
      if (this.getFilledStackSize() < this.stacksize) {
        if (this.packsize[stackName] === 1) { this.stack[stackName] = {} } else { this.stack[stackName] = [] }
      } else return false
    }

    const key = stackName

    for (let iPack = 0; iPack < this.packsize[key]; iPack++) {
      let pack = this.stack[key]
      if (Array.isArray(pack)) pack = pack[iPack]
      if (pack === undefined) {
        pack = { id: newItem.id, n: 1 }
        this.stack[key].push(pack)
        return true
      } else if (pack.id === undefined) {
        if (pack.reserved === true) return false
        pack = { id: newItem.id, n: 1 }
        this.stack[key] = pack
        return true
      } else if (pack.id === newItem.id && pack.n + newItem.n <= this.itemsize) {
        pack.n += newItem.n
        return true
      }
    }

    return false
  }

  hasPlaceFor (newItem, stackName) {
    if (newItem === undefined) return false
    if (stackName === undefined) stackName = 'INV'
    if (this.stacksize === undefined) this.stacksize = 1

    if (this.stack[stackName] === undefined) {
      if (this.getFilledStackSize() >= this.stacksize) return false
    }

    if (this.stack[stackName]?.full === true) return false

    const key = stackName
    for (let iPack = 0; iPack < this.packsize[key]; iPack++) {
      let pack = this.stack[key]
      if (Array.isArray(pack)) pack = pack[iPack]
      if (pack?.id === undefined) return true
      if (pack.id === newItem.id) {
        if (pack.n + newItem.n <= this.itemsize) {
          return true
        }
      }
    }
    return false
  }

  addItems (newItems) {
    let ret = true
    for (let i = 0; i < newItems.length; i++) {
      ret = ret && this.addItem(newItems[i])
    }
    return ret
  }

  remItemFromStack (removingItem, stackName) {
    if (Array.isArray(this.stack[stackName]) === false) {
      const pack = this.stack[stackName]
      if (pack && pack.id === removingItem.id) {
        const n = pack.n - removingItem.n
        if (n > 0) {
          pack.n = n
          return true
        } else if (n === 0) {
          delete this.stack[stackName]
          return true
        } else return false
      }
    } else {
      for (let iPack = 0; iPack < this.packsize[stackName] && removingItem; iPack++) {
        const pack = this.stack[stackName][iPack]
        if (pack && pack.id === removingItem.id) { // Find the pack
          const n = pack.n - removingItem.n
          if (n > 0) {
            pack.n = n
            return true
          } else if (n === 0) {
            this.stack[stackName].splice(iPack, 1) // Remove empty pack
            iPack--
            return true
          } else return false
        }
      }
    }
  }

  remItem (removingItem, prefStackName) {
    if (removingItem === undefined) return false

    if (this.stack[prefStackName] === undefined || this.remItemFromStack(removingItem, prefStackName) === false) {
      const keys = Object.keys(this.stack)
      for (let iStack = 0; iStack < keys.length; iStack++) {
        if (this.remItemFromStack(removingItem, keys[iStack])) {
          return true
        }
      }
    }
    return false
  }

  movePack (stackName, packPos, toInv, toStackName, toPackPos, toPack) {
    this.remPack(stackName, packPos)
    toInv.addPack(toStackName, toPackPos, toPack)
  }

  remPack (stackName, packPos) {
    const stack = this.stack[stackName]
    if (stack) {
      const pack = stack[packPos]
      if (pack) {
        stack.splice(packPos, 1)
      }
    }
  }

  addPack (stackName, packPos, pack) {
    const stack = this.stack[stackName]
    if (stack) {
      stack.splice(packPos, 0, pack)
    }
  }

  remItems (newItems) {
    let ret = true
    for (let i = 0; i < newItems.length; i++) {
      ret = ret && this.remItem(newItems[i])
    }
    return ret
  }

  remStack (stackKey) {
    delete this.stack[stackKey]
  }

  hasItem (searchItem) {
    const keys = Object.keys(this.stack)
    for (let iStack = 0; iStack < keys.length && searchItem; iStack++) {
      const key = keys[iStack]
      if (Array.isArray(this.stack[key])) {
        for (let iPack = 0; iPack < this.stack[key].length && searchItem; iPack++) {
          const pack = this.stack[key][iPack]
          if (pack && pack.id === searchItem.id) { // Find the pack
            return (pack.n >= searchItem.n || searchItem.n === undefined)
          }
        }
      } else {
        if (this.stack[key] && this.stack[key]?.id === searchItem.id) { // Find the pack
          return (this.stack[key].n >= 0)
        }
      }
    }
    return false
  }

  hasItems (searchItem) {
    let ret = true
    for (let i = 0; i < searchItem.length; i++) {
      ret = ret && this.hasItem(searchItem[i])
    }
    return ret
  }

  getFirstItem () {
    const firstPack = this.getFirstPack()
    if (firstPack?.length) return firstPack[0]
    return firstPack
  }

  getFirstPack (pref) {
    let key
    let selectedKey
    if (pref && this.stack[pref]) selectedKey = pref
    else {
      const keys = Object.keys(this.stack)
      if (keys.length) {
        for (let iStack = 0; iStack < keys.length; iStack++) {
          key = keys[iStack]
          if (this.stack[key]?.id || this.stack[key][0]?.id) {
            selectedKey = key
            break
          }
        }
      }
    }
    if (selectedKey === undefined) return
    let pack = this.stack[selectedKey]
    if (Array.isArray(pack)) pack = pack[0]
    return pack
  }

  draw (ctx) {
    ctx.beginPath()
    ctx.fillStyle = 'rgba(120, 120, 120, 0.9)'
    ctx.rect(this.x, this.y, this.w, this.h)
    ctx.fill()
    ctx.font = (Settings.buttonSize.y / 2) + 'px Arial'
    ctx.fillText(this.t, this.x, this.y + 48)
  }
}

function getNumberOfItems (ent, type) {
  if (ent === undefined || ent.stack === undefined) return
  let n = 0
  const keys = Object.keys(ent.stack)
  for (let iStack = 0; iStack < keys.length; iStack++) {
    const key = keys[iStack]
    for (let iPack = 0; iPack < ent.packsize[key]; iPack++) {
      const pack = ent.stack[key][iPack]
      if (pack && pack.id === type) {
        n += pack.n
      }
    }
  }
  return n
}

function mineToInv (minedItem) {
  const newItem = { id: Settings.resName[minedItem.id].becomes, n: 1 }
  const res = Settings.game.map[minedItem.source.x][minedItem.source.y][Settings.layers.res]
  res.n--

  if (res.n <= 0) {
    delete Settings.game.map[minedItem.source.x][minedItem.source.y][Settings.layers.res].id
    Settings.player.stopMining(Settings.allInvs[Settings.playerID])
  }
  Settings.allInvs[Settings.playerID].addItem(newItem)
  window.view.updateInventoryMenu(Settings.player)
}

function craftToInv (inv, items) {
  if (!items) return
  items.forEach(item => {
    let itemsExist = true
    for (let c = 0; c < item.cost.length && itemsExist; c++) {
      itemsExist = false
      itemsExist = inv.hasItems(item.cost)
    }
    if (itemsExist) {
      const newItem = { id: item.id, n: 1 }
      Settings.player.addItem(newItem)
      inv.remItems(item.cost)
      window.view.updateInventoryMenu(Settings.player)
    }
    return itemsExist
  })
}

function getInv (x, y, create = false) {
  if (x < 0) return
  if (y < 0) return

  const tile = Settings.game.map[x][y]
  if (tile[Settings.layers.inv] === null && create) createInvOnMap(x, y)
  return Settings.allInvs[tile[Settings.layers.inv]]
}

function setInv (x, y, invID) {
  const tile = Settings.game.map[x][y]
  tile[Settings.layers.inv] = invID
}

function setEnt (x, y, invID) {
  const tile = Settings.game.map[x][y]
  tile[Settings.layers.buildings] = invID
}

function createInvOnMap (x, y) {
  let invID = Settings.game.map[x][y][Settings.layers.inv]
  if (invID === null) {
    const inv = new Inventory({ x, y })

    Settings.allInvs.push(inv)
    inv.id = Settings.allInvs.length - 1

    Settings.game.map[x][y][Settings.layers.inv] = inv.id
    inv.type = Settings.resDB.empty.id
    invID = inv.id
  }
  return invID
}

function createInv (type, newEntity) {
  newEntity.id = Settings.allInvs.length
  Settings.allInvs.push(new Settings.resName[type].mach(newEntity.pos, newEntity))
  return Settings.allInvs.length - 1
}

function addInventory (newEntity, updateDir) {
  if (!newEntity) return
  let inv = getInv(newEntity.pos.x, newEntity.pos.y)
  if (inv == null || inv?.type === Settings.resDB.empty.id) {
    if (Settings.pointer.stack.INV[0].n > 0) {
      const invID = createInv(newEntity.type, newEntity)
      inv = Settings.allInvs[invID]
      inv.id = invID
      inv.pos = { x: newEntity.pos.x, y: newEntity.pos.y }
      inv.dir = newEntity.dir
      inv.type = newEntity.type
      Settings.game.map[newEntity.pos.x][newEntity.pos.y][Settings.layers.inv] = inv.id
      if (inv?.updateNB) inv.updateNB()
      if (typeof window !== 'undefined') window.view.updateInventoryMenu(Settings.player)
      Settings.pointer.stack.INV[0].n--
      if (Settings.pointer.stack.INV[0].n === 0) delete Settings.pointer.stack.INV
    }
    if (Settings.isBrowser) {
      if (Settings.resName[newEntity.type].mach && Settings.resName[newEntity.type].mach.setup) Settings.resName[newEntity.type].mach.setup(Settings.game.map, inv)
    }
  }

  // Update Neighbours
  for (const nbV of Settings.nbVec) {
    const nb = getInv(newEntity.pos.x + nbV.x, newEntity.pos.y + nbV.y)
    if (nb?.updateNB) nb.updateNB()
  }

  if (inv) return inv.id
}

function addItem (newItem) {
  let inv
  const invID = Settings.game.map[newItem.pos.x][newItem.pos.y][Settings.layers.inv]
  if (invID == null) {
    inv = new Inventory(newItem.pos)
    Settings.allInvs.push(inv)
    inv.id = Settings.allInvs.length - 1
    Settings.game.map[newItem.pos.x][newItem.pos.y][Settings.layers.inv] = inv.id
    inv.type = Settings.resDB.belt1.id
  } else inv = inv = Settings.allInvs[invID]
  inv.addItem({ id: newItem.inv.item.id, n: 1 })
  /* s.sendAll(JSON.stringify({msg:"updateInv", data:Settings.allInvs}));
  s.sendAll(JSON.stringify({msg: "updateMapData", data:Settings.game.map})); */
}

function moveStack (data) {
  if (data.fromInvID === data.toInvID && data.fromInvKey === data.toInvKey && data.fromStackPos === data.toStackPos) return

  const invFrom = Settings.allInvs[data.fromInvID].stack[data.fromInvKey]
  const from = invFrom[data.fromStackPos]

  if (data.toStackPos == null) data.toStackPos = Settings.allInvs[data.toInvID].stack[data.toInvKey].length - 1

  const toStack = Settings.allInvs[data.toInvID].stack
  if (toStack[data.fromStackPos]) {
    Settings.allInvs[data.toInvID].stack[data.toInvKey][data.toStackPos] = from
  } else {
    if (toStack[data.toInvKey] == null) toStack[data.toInvKey] = []

    // add items into stack
    if (toStack[data.toInvKey][data.toStackPos]?.id === from.id) {
      toStack[data.toInvKey][data.toStackPos].n += from.n

    // add new stack
    } else {
      toStack[data.toInvKey].push(from)
    }
  }

  invFrom.splice(data.fromStackPos, 1)
  // s.sendAll(JSON.stringify({msg:"updateInv", data:Settings.allInvs}));
  if (data.fromInvID === 0 || data.toInvID === 0) Settings.player.setInventory(Settings.allInvs[0])
  if (data.fromInvID === Settings.selEntity?.id || data.toInvID === Settings.selEntity?.id) window.view.updateInventoryMenu(Settings.selEntity)
}

const invfuncs = {}
invfuncs.Inventory = Inventory
invfuncs.getInv = getInv
invfuncs.setInv = setInv
invfuncs.setEnt = setEnt
invfuncs.createInv = createInv
invfuncs.mineToInv = mineToInv
invfuncs.moveStack = moveStack
invfuncs.addItem = addItem
invfuncs.addInventory = addInventory
invfuncs.getNumberOfItems = getNumberOfItems
invfuncs.craftToInv = craftToInv

export { invfuncs }
