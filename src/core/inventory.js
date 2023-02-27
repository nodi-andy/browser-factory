import { Settings } from '../common.js'


export class Inventory {

  static mineToInv (minedItem) {
    const newItem = { id: window.classDB[classDBi[minedItem.id].becomes].id, n: 1 }
    const res = game.res.getResource(minedItem.source)
    res.n--
    game.res.updateOffscreenMap(game.res)
  
    if (res.n <= 0) {
      delete game.res.map[minedItem.source.x][minedItem.source.y].id
      window.player.stopMining(game.allInvs[game.playerID])
    }
    game.allInvs[game.playerID].addItem(newItem)
    game.updateInventoryMenu(window.player)
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
        game.updateInventoryMenu(window.player)
      }
      return itemsExist
    })
  }
  

  static createInv (type, newEntity) {
    newEntity.id = game.allInvs.length
    game.allInvs.push(new classDBi[type](newEntity.pos, newEntity))
    return game.allInvs.length - 1
  }
  
  static addInventory (newEntity, updateDir) {
    if (!newEntity) return
    let inv = game.entityLayer.getInv(newEntity.pos.x, newEntity.pos.y)
    if (inv == null || inv?.type === classDB.Empty.id) {
      if (Settings.pointer.stack.INV[0].n > 0) {
        const invID = Inventory.createInv(newEntity.type, newEntity)
        inv = game.allInvs[invID]
        inv.id = invID
        inv.pos = { x: newEntity.pos.x, y: newEntity.pos.y }
        inv.dir = newEntity.dir
        inv.type = newEntity.type
        game.entityLayer.map[newEntity.pos.x][newEntity.pos.y] = inv.id
        if (inv?.updateNB) inv.updateNB()
        if (typeof window !== 'undefined') game.updateInventoryMenu(window.player)
        Settings.pointer.stack.INV[0].n--
        if (Settings.pointer.stack.INV[0].n === 0) delete Settings.pointer.stack.INV
      }
      if (classDBi[newEntity.type].mach && classDBi[newEntity.type].mach.setup) classDBi[newEntity.type].mach.setup(game.entityLayer.map, inv)
    }
  
    // Update Neighbours
    for (const nbV of Settings.nbVec) {
      const nb = game.entityLayer.getInv(newEntity.pos.x + nbV.x, newEntity.pos.y + nbV.y)
      if (nb?.updateNB) nb.updateNB()
    }
  
    if (inv) return inv.id
  }
  
  static addItem (newItem) {
    let inv
    const invID = game.entityLayer.map[newItem.pos.x][newItem.pos.y]
    if (invID == null) {
      inv = new Inventory(newItem.pos)
      game.allInvs.push(inv)
      inv.id = game.allInvs.length - 1
      game.entityLayer.map[newItem.pos.x][newItem.pos.y] = inv.id
    } else inv = inv = game.allInvs[invID]
    inv.addItem({ id: newItem.inv.item.id, n: 1 })
  }
  
  static moveStack (data) {
    if (data.fromInvID === data.toInvID && data.fromInvKey === data.toInvKey && data.fromStackPos === data.toStackPos) return
  
    const invFrom = game.allInvs[data.fromInvID].stack[data.fromInvKey]
    if (invFrom[data.fromStackPos] == undefined) return
  
    const from = invFrom[data.fromStackPos]
  
    if (data.toStackPos == null) data.toStackPos = game.allInvs[data.toInvID].stack[data.toInvKey].length - 1
  
    const toStack = game.allInvs[data.toInvID].stack
    if (toStack[data.fromStackPos]) {
      game.allInvs[data.toInvID].stack[data.toInvKey][data.toStackPos] = from
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
    // s.sendAll(JSON.stringify({msg:"updateInv", data:game.allInvs}));
    if (data.fromInvID === 0 || data.toInvID === 0) window.player.setInventory(game.allInvs[0])
    if (data.fromInvID === window.selEntity?.id || data.toInvID === window.selEntity?.id) game.updateInventoryMenu(window.selEntity)
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

  getNumberOfItems (type) {
    let n = 0
    for(const stackName of Object.keys(this.stack)){
      if (Array.isArray(this.stack[stackName]) ) {
        for(const pack of Object.keys(this.stack[stackName])){
          if (this.stack[stackName][pack]?.id === type) n++
        }
      } else {
        if (this.stack[stackName]?.id === type) n++
      }
    }

    return n
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

  getItem(filterStack, filterItem) {
    if (filterStack) {
      if (this.stack[filterStack]) {
        for(const pack of Object.keys(this.stack[filterStack])) {
          if (filterItem && this.stack[filterStack][pack]?.id !== filterItem) continue
          else return this.stack[filterStack][pack]?.id
        }
        return null
      } else {
        return null
      }
    }

    //iterate all items
    
    for(const stackName of Object.keys(this.stack)){
      if (Array.isArray(this.stack[stackName]) ) {
        for(const pack of Object.keys(this.stack[stackName])){
          if (filterItem && this.stack[stackName][pack]?.id !== filterItem) continue
          else return this.stack[stackName][pack]?.id
        }
      } else {
        if (filterItem && this.stack[stackName]?.id !== filterItem) continue
        if (this.stack[stackName]?.id) return this.stack[stackName]?.id
      }
    }
    return null
  }

  getStack (pref) {
    if (pref && this.stack[pref]) 
      return this.stack[pref]
    else {
      Object.keys(this.stack).forEach(stackName => {
        if (this.stack[stackName][0]?.id) {
          return this.stack[selectedKey]
        }
      })
    }
  }

  getFirstItem () {
    const firstPack = this.getFirstPack()
    if (firstPack?.length) return firstPack[0]
    return firstPack
  }

  getFirstPack (prefStack) {
    let selectedStack = this.getStack(prefStack)
    if (Array.isArray(selectedStack)) 
      return selectedStack[0]
    else
      return null
  }
}
