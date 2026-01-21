import { Settings } from '../common.js'
import { Grassland } from '../terrain/grassland/grassland.js'
import { Tree } from '../res/tree/tree.js'

export class Inventory {

  static mineToInv (minedItem) {
    const newItem = { id: window.classDB[classDBi[minedItem.id].becomes].id, n: 1 }
    const res = game.res.getResource(minedItem.source)
    res.n--
    game.res.updateOffscreenMap()
  
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
  
  static getFootprint (entity) {
    let size = classDBi?.[entity?.type]?.size
    if (!Array.isArray(size) || size.length < 2) size = [1, 1]
    let width = size[0]
    let height = size[1]
    if (!Number.isFinite(width)) width = 1
    if (!Number.isFinite(height)) height = 1
    if (entity?.dir != null && Math.abs(entity.dir) % 2 === 1) {
      const tmp = width
      width = height
      height = tmp
    }
    return { width, height }
  }

  static checkFreeSpace(entity) {
    const footprint = this.getFootprint(entity)
    for (let i = 0; i < footprint.width; i++) {
      for (let j = 0; j < footprint.height; j++) {
        const x = entity.pos.x + i
        const y = entity.pos.y + j
        if (x < 0 || y < 0) return false
        if (x >= game.terrain.map.length || y >= game.terrain.map[0].length) return false

        let full = game.entityLayer.getInv(x, y)
        if (full && full.type === classDB.Empty.id) full = false
        const terrainTile = game.terrain.map[x][y]
        const resTile = game.res?.getResourceXY(x, y)
        if (full ||
            terrainTile?.[0] != Grassland.id ||
            resTile?.id == Tree.id) {
          return false
        }
      }
    }
    return true
  }

  static createInv (newEntity) {
    newEntity.id = game.allInvs.length

    if (this.checkFreeSpace(newEntity)) {
      let newClass = new classDBi[newEntity.type](newEntity.pos, newEntity)
      if (newClass){
        game.allInvs.push(newClass)
        return game.allInvs.length - 1
      } else {
        return null
      }
    }
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
    let transferedItems = 0
    if (data.fromInvID === data.toInvID && data.fromInvKey === data.toInvKey && data.fromStackPos === data.toStackPos) return
  
    const invFrom = game.allInvs[data.fromInvID].stack[data.fromInvKey]
    if (invFrom?.packs?.[data.fromStackPos] == undefined) {
      console.warn('[moveStack] no source pack', data)
      return
    }
  
    const from = invFrom.packs[data.fromStackPos]
  
    if (data.toStackPos == null) data.toStackPos = game.allInvs[data.toInvID].stack[data.toInvKey].packs.length - 1
  
    const toStack = game.allInvs[data.toInvID].stack
    if (toStack[data.fromStackPos]) {
      game.allInvs[data.toInvID].stack[data.toInvKey].packs[data.toStackPos] = from
      transferedItems = from.n
    } else {
      if (toStack[data.toInvKey] == null) toStack[data.toInvKey] = []
  
      const destStack = toStack[data.toInvKey]
      const destPacks = destStack?.packs
      const packsize = destStack?.packsize ?? 50
      const maxlen = destStack?.maxlen
  
      // add items into stack
      if (destPacks?.[data.toStackPos]?.id === from.id) {
        transferedItems = from.n
        if (destPacks[data.toStackPos].n + transferedItems > packsize) transferedItems = packsize - destPacks[data.toStackPos].n
        if (transferedItems > 0) destPacks[data.toStackPos].n += transferedItems
  
      // add new stack
      } else {
        const hasAllow = destStack?.allow
        const allowOk = !hasAllow || destStack.allow.hasOwnProperty(from.id)
        const atCapacity = Array.isArray(destPacks) && Number.isFinite(maxlen) && destPacks.length >= maxlen
        if (allowOk && !atCapacity && Array.isArray(destPacks)) {
          transferedItems = from.n
          if (transferedItems > packsize) transferedItems = packsize
          destPacks.push({id: from.id, n: transferedItems})
        }
      }
    }

    if (transferedItems <= 0) {
      const destStack = toStack?.[data.toInvKey]
      const destPacks = destStack?.packs
      const reasons = []
      if (!destStack) reasons.push('missing-destination-stack')
      if (destStack?.allow && !destStack.allow.hasOwnProperty(from.id)) reasons.push('item-not-allowed')
      const packsize = destStack?.packsize ?? 50
      const matchingPack = Array.isArray(destPacks) ? destPacks.find(pack => pack?.id === from.id) : null
      if (matchingPack && matchingPack.n >= packsize) reasons.push('matching-pack-full')
      if (!matchingPack && Array.isArray(destPacks) && Number.isFinite(destStack?.maxlen) && destPacks.length >= destStack.maxlen) {
        reasons.push('destination-stack-full')
      }
      const info = {
        data,
        from,
        destStack: destStack ? { maxlen: destStack.maxlen, packsize: destStack.packsize, allow: destStack.allow } : null,
        destPackCount: Array.isArray(destPacks) ? destPacks.length : null,
        reasons
      }
      window.lastMoveStackFailure = info
      console.warn('[moveStack] transfer failed', info)
      return
    }
  
    game.allInvs[data.fromInvID].remItem({id: from.id, n: transferedItems}, data.fromInvKey, data.fromStackPos)
    // s.sendAll(JSON.stringify({msg:"updateInv", data:game.allInvs}));
    //if (data.fromInvID === 0 || data.toInvID === 0) window.player.setInventory(game.allInvs[0])
    //if (data.fromInvID === window.selEntity?.id || data.toInvID === window.selEntity?.id) game.updateInventoryMenu(window.selEntity)
  }

  static name = "Inventory"
  constructor (pos, entData) {
    this.stack = {INV: {packs: [], maxlen: 1, packsize: 50}}
    if (pos) this.pos = { x: pos.x, y: pos.y }
    if (entData) Object.assign(this, entData)
  }

  static getLabel() {
    if (this.label) return this.label
    if(this.name) return this.name
  }

  getStackName () {
    return 'INV'
  }

  getNumberOfItems (type) {
    let n = 0
    for(const stackName of Object.keys(this.stack)){
      if (this.stack[stackName].packs) {
        for(const pack of this.stack[stackName].packs){
          if (pack.id === type) n += pack.n
        }
      } else {
        let pack = this.stack[stackName]
        if (pack.id === type) n += pack.n
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
      if (this.stack[key]?.id || this.stack[key].packs[0]?.id) ret++
    }
    return ret
  }

  // use this.hasPlaceFor()
  addItem (newItem, stackName, prefPackPos) {
    if (newItem == null) return false
    
    if (stackName !== undefined && prefPackPos !== undefined) {
      if (this.stack[stackName] == null) this.stack[stackName] = []

      if (this.stack[stackName].packs[prefPackPos] == null) 
      {
        this.stack[stackName].packs[prefPackPos] = {id: newItem.id, n: newItem.n}
        return
      } else  {
        this.stack[stackName].packs[prefPackPos].n += newItem.n
        return
      }
    }

    if (stackName == null) stackName = 'INV'
    if (this.hasPlaceFor(newItem, stackName) === false) return false
    if (this.stacksize == null) this.stacksize = 1

    if (this.stack[stackName] == null) {
      if (this.getFilledStackSize() < this.stacksize) {
        if (this[stackName].packsize === 1) { this.stack[stackName] = {} } else { this.stack[stackName] = [] }
      } else return false
    }

    const key = stackName

    for (let iPack = 0; iPack < this.stack[key].maxlen; iPack++) {
      let pack;
      if (this.stack[key].packs) pack = this.stack[key].packs[iPack]
      else pack = this.stack[key]

      if (pack == null) {
        pack = { id: newItem.id, n: newItem.n }
        this.stack[key].packs.push(pack)
        return true
      } else if (pack.id == null) {
        if (pack.reserved === true) return false
        this.stack[key].id = newItem.id
        this.stack[key].n = newItem.n
        return true
      } else if (pack.id === newItem.id && pack.n + newItem.n <= this.stack[key].packsize) {
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
    else if (this.stack[stackName]?.full === false) return true
    else {
      const key = stackName
      for (let iPack = 0; iPack < this.stack[key].maxlen; iPack++) {
        let pack;
        if (this.stack[key].packs) pack = this.stack[key].packs[iPack]
        else pack = this.stack[key]
        if (pack?.id == null) return true
        if (pack.id === newItem.id) {
          if (pack.n + newItem.n <= this.stack[key].packsize) {
            return true
          }
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
    for (let iPack = 0; iPack < this.stack[stackName].maxlen && removingItem; iPack++) {
      let pack;
      if (this.stack[stackName].packs) pack = this.stack[stackName].packs[iPack]
      else pack = this.stack[stackName]

      if (pack?.id && pack.id === removingItem.id) { // Find the pack
        const n = pack.n - removingItem.n
        if (n > 0) {
          pack.n = n
          return true
        } else if (n === 0) {
          if (this.stack[stackName].packs) {
            this.stack[stackName].packs.splice(iPack, 1) // Remove empty pack
            iPack--
          } else {
            pack.n--
            delete pack.id
          }
          return true
        } else return false
      }
    }
  }

  remItem (removingItem, prefStackName, prefPackPos) {
    if (prefStackName !== undefined && prefPackPos !== undefined) {
      this.stack[prefStackName].packs[prefPackPos].n -= removingItem.n
      if (this.stack[prefStackName].packs[prefPackPos].n == 0) this.stack[prefStackName].packs.splice(prefPackPos, 1)
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
    if (stack?.packs) {
      stack.packs.splice(packPos, 0, pack)
    }
  }

  addPacks (stackName, packs) {
    const stack = this.stack[stackName]
    for (let pack of packs) {
      stack.packs.push(pack)
    }
  }

  addStack (stackName, newStack) {
    const keys = Object.keys(newStack)
    for (let pack of keys) {
      this.addPacks(stackName, newStack[pack].packs)
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
      for (let iPack = 0; iPack < this.stack[key].maxlen && searchItem; iPack++) {
        let pack;
        if (this.stack[key].packs) pack = this.stack[key].packs[iPack]
        else pack = this.stack[key]
        if (pack?.id === searchItem.id) { // Find the pack
          return (pack.n >= searchItem.n || searchItem.n == null)
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
          if (filterItem && this.stack[filterStack].packs[pack]?.id !== filterItem) continue
          else return this.stack[filterStack].packs[pack]?.id
        }
        return null
      } else {
        return null
      }
    }

    //iterate all items
    
    for(const stackName of Object.keys(this.stack)){
        if (this.stack[stackName].packs) {
          for(const pack of this.stack[stackName].packs){
            if (filterItem && pack.id !== filterItem) continue
            else return pack.id
          }
        } else {
          let pack = this.stack[stackName]
          if (filterItem && pack.id !== filterItem) continue
          else if (pack.id) return pack.id
        }
    }
    return null
  }

  getStack (pref) {
    if (pref && this.stack[pref]) 
      return this.stack[pref]
    else {
      Object.keys(this.stack).forEach(stackName => {
        if (this.stack[stackName].packs[0]?.id) {
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
