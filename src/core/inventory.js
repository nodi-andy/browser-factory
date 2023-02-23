/* eslint-disable no-unmodified-loop-condition */
import { Settings } from '../common.js'

export class Inventory {

  static getInv (x, y, create = false) {
    if (x < 0) return
    if (y < 0) return
    if (x > window.game.entityLayer.map.length) return
    if (y > window.game.entityLayer.map[0].length) return
  
    let tile = window.game.entityLayer.map[x][y]
    if (tile == null && create) tile = createInvOnMap(x, y)
    return window.game.allInvs[tile]
  }

  static setInv (x, y, invID) {
    window.game.entityLayer.map[x][y] = invID
  }

  static getInvP (p, create = false) {
    return Inventory.getInv(p.x, p.y, create)
  }

  static mineToInv (minedItem) {
    const newItem = { id: window.classDB[Settings.resName[minedItem.id].becomes].id, n: 1 }
    const res = window.game.res.getResource(minedItem.source)
    res.n--
  
    if (res.n <= 0) {
      delete window.game.res.map[minedItem.source.x][minedItem.source.y].id
      window.player.stopMining(window.game.allInvs[window.game.playerID])
    }
    window.game.allInvs[window.game.playerID].addItem(newItem)
    window.game.updateInventoryMenu(window.player)
  }

  static getNumberOfItems (ent, type) {
    if (ent == null || ent.stack == null) return
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
  
  static craftToInv (inv, items) {
    if (!items) return
    items.forEach(item => {
      let itemsExist = true
      for (let c = 0; c < item.cost.length && itemsExist; c++) {
        itemsExist = false
        itemsExist = inv.hasItems(item.cost)
      }
      if (itemsExist) {
        const newItem = { id: item.id, n: 1 }
        window.player.addItem(newItem)
        inv.remItems(item.cost)
        window.game.updateInventoryMenu(window.player)
      }
      return itemsExist
    })
  }
  
  static createInvOnMap (x, y) {
    let invID = window.game.entityLayer.map[x][y]
    if (invID == null) {
      const inv = new Inventory({ x, y })
  
      window.game.allInvs.push(inv)
      inv.id = window.game.allInvs.length - 1
  
      window.game.entityLayer.map[x][y] = inv.id
      inv.type = Settings.resDB.Empty.id
      invID = inv.id
    }
    return invID
  }
  
  static createInv (type, newEntity) {
    newEntity.id = window.game.allInvs.length
    window.game.allInvs.push(new Settings.resName[type](newEntity.pos, newEntity))
    return window.game.allInvs.length - 1
  }
  
  static addInventory (newEntity, updateDir) {
    if (!newEntity) return
    let inv = Inventory.getInv(newEntity.pos.x, newEntity.pos.y)
    if (inv == null || inv?.type === Settings.resDB.Empty.id) {
      if (Settings.pointer.stack.INV[0].n > 0) {
        const invID = createInv(newEntity.type, newEntity)
        inv = window.game.allInvs[invID]
        inv.id = invID
        inv.pos = { x: newEntity.pos.x, y: newEntity.pos.y }
        inv.dir = newEntity.dir
        inv.type = newEntity.type
        window.game.entityLayer.map[newEntity.pos.x][newEntity.pos.y] = inv.id
        if (inv?.updateNB) inv.updateNB()
        if (typeof window !== 'undefined') window.game.updateInventoryMenu(window.player)
        Settings.pointer.stack.INV[0].n--
        if (Settings.pointer.stack.INV[0].n === 0) delete Settings.pointer.stack.INV
      }
      if (Settings.resName[newEntity.type].mach && Settings.resName[newEntity.type].mach.setup) Settings.resName[newEntity.type].mach.setup(window.game.entityLayer.map, inv)
    }
  
    // Update Neighbours
    for (const nbV of Settings.nbVec) {
      const nb = Inventory.getInv(newEntity.pos.x + nbV.x, newEntity.pos.y + nbV.y)
      if (nb?.updateNB) nb.updateNB()
    }
  
    if (inv) return inv.id
  }
  
  static addItem (newItem) {
    let inv
    const invID = window.game.entityLayer.map[newItem.pos.x][newItem.pos.y]
    if (invID == null) {
      inv = new Inventory(newItem.pos)
      window.game.allInvs.push(inv)
      inv.id = window.game.allInvs.length - 1
      window.game.entityLayer.map[newItem.pos.x][newItem.pos.y] = inv.id
      inv.type = Settings.resDB.belt1.id
    } else inv = inv = window.game.allInvs[invID]
    inv.addItem({ id: newItem.inv.item.id, n: 1 })
  }
  
  static moveStack (data) {
    if (data.fromInvID === data.toInvID && data.fromInvKey === data.toInvKey && data.fromStackPos === data.toStackPos) return
  
    const invFrom = window.game.allInvs[data.fromInvID].stack[data.fromInvKey]
    if (invFrom[data.fromStackPos] == undefined) return
  
    const from = invFrom[data.fromStackPos]
  
    if (data.toStackPos == null) data.toStackPos = window.game.allInvs[data.toInvID].stack[data.toInvKey].length - 1
  
    const toStack = window.game.allInvs[data.toInvID].stack
    if (toStack[data.fromStackPos]) {
      window.game.allInvs[data.toInvID].stack[data.toInvKey][data.toStackPos] = from
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
    // s.sendAll(JSON.stringify({msg:"updateInv", data:window.game.allInvs}));
    if (data.fromInvID === 0 || data.toInvID === 0) window.player.setInventory(window.game.allInvs[0])
    if (data.fromInvID === Settings.selEntity?.id || data.toInvID === Settings.selEntity?.id) window.game.updateInventoryMenu(Settings.selEntity)
  }

  constructor (pos, entData) {
    this.stack = {}
    if (pos) this.pos = { x: pos.x, y: pos.y }
    this.stacksize = 1
    this.packsize = {}
    this.packsize.INV = 4
    this.itemsize = 1
    this.name = "Inventory"
    if (entData) Object.assign(this, entData)
  }

  getStackName () {
    return 'INV'
  }

  moveItemTo (item, to, toStackname) {
    if (to == null) return false
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
  addItem (newItem, stackName, prefPackPos) {
    if (newItem == null) return false
    
    if (stackName !== undefined && prefPackPos !== undefined) {
      if (this.stack[stackName] == null) this.stack[stackName] = []

      if (this.stack[stackName][prefPackPos] == null) 
      {
        this.stack[stackName][prefPackPos] = {id: newItem.id, n: newItem.n}
        return
      } else  {
        this.stack[stackName][prefPackPos].n += newItem.n
        return
      }
    }

    if (stackName == null) stackName = 'INV'
    if (this.hasPlaceFor(newItem, stackName) === false) return false
    if (this.stacksize == null) this.stacksize = 1

    if (this.stack[stackName] == null) {
      if (this.getFilledStackSize() < this.stacksize) {
        if (this.packsize[stackName] === 1) { this.stack[stackName] = {} } else { this.stack[stackName] = [] }
      } else return false
    }

    const key = stackName

    for (let iPack = 0; iPack < this.packsize[key]; iPack++) {
      let pack = this.stack[key]
      if (Array.isArray(pack)) pack = pack[iPack]
      if (pack == null) {
        pack = { id: newItem.id, n: 1 }
        this.stack[key].push(pack)
        return true
      } else if (pack.id == null) {
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
    if (newItem == null) return false
    if (stackName == null) stackName = 'INV'
    if (this.stacksize == null) this.stacksize = 1

    if (this.stack[stackName] == null) {
      if (this.getFilledStackSize() >= this.stacksize) return false
    }

    if (this.stack[stackName]?.full === true) return false

    const key = stackName
    for (let iPack = 0; iPack < this.packsize[key]; iPack++) {
      let pack = this.stack[key]
      if (Array.isArray(pack)) pack = pack[iPack]
      if (pack?.id == null) return true
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

  remItem (removingItem, prefStackName, prefPackPos) {
    if (prefStackName !== undefined && prefPackPos !== undefined) {
      this.stack[prefStackName][prefPackPos].n -= removingItem.n
      if (this.stack[prefStackName][prefPackPos].n == 0) this.stack[prefStackName].splice(prefPackPos, 1)
      return true
    }

    if (removingItem == null) return false

    if (this.stack[prefStackName] == null || this.remItemFromStack(removingItem, prefStackName) === false) {
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
    if (this.stack[stackName] == null) this.stack[stackName] = []
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

  hasPack (stackName, searchItem) {
    if (searchItem?.n == null) return

    const stack = this.stack[stackName]
    for (let iPack = 0; iPack < stack.length; iPack++) {
      const pack = stack[iPack]
      if (pack?.id === searchItem.id && pack.n >= searchItem.n) return iPack
    }
  }

  hasItem (searchItem) {
    const keys = Object.keys(this.stack)
    for (let iStack = 0; iStack < keys.length && searchItem; iStack++) {
      const key = keys[iStack]
      if (Array.isArray(this.stack[key])) {
        for (let iPack = 0; iPack < this.stack[key].length && searchItem; iPack++) {
          const pack = this.stack[key][iPack]
          if (pack?.id === searchItem.id) { // Find the pack
            return (pack.n >= searchItem.n || searchItem.n == null)
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
    let key, selectedKey
    if (pref && this.stack[pref]) 
      selectedKey = pref
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
    if (selectedKey == null) return
    let pack = this.stack[selectedKey]
    if (Array.isArray(pack)) pack = pack[0]
    return pack
  }

  draw (ctx) {
    if (ctx == null) return
    ctx.beginPath()
    ctx.fillStyle = 'rgba(120, 120, 120, 0.9)'
    ctx.rect(this.x, this.y, this.w, this.h)
    ctx.fill()
    ctx.font = (Settings.buttonSize.y / 2) + 'px Arial'
    ctx.fillText(this.t, this.x, this.y + 48)
  }
}
