import { Grassland } from '../terrain/grassland/grassland.js'
import { Tree } from '../res/tree/tree.js'

export class Inventory {
  static DEFAULT_PACKSIZE = 50
  static DEFAULT_MAXLEN = 1

  static normalizePack (pack) {
    if (!pack || typeof pack !== 'object') return null
    const id = pack.id
    const hasId = id !== undefined && id !== null
    let n = Number.isFinite(pack.n) ? pack.n : (hasId ? 1 : 0)
    if (!Number.isFinite(n)) n = hasId ? 1 : 0
    return { id, n }
  }

  static normalizeAllow (allow, packsize) {
    if (allow == null) return undefined
    if (Array.isArray(allow)) {
      const normalized = {}
      allow.forEach(id => {
        if (id != null) normalized[id] = packsize || 1
      })
      return normalized
    }
    if (typeof allow === 'object') return allow
    const normalized = {}
    normalized[allow] = packsize || 1
    return normalized
  }

  static createStack (options = {}) {
    const packsize = Number.isFinite(options.packsize) ? options.packsize : Inventory.DEFAULT_PACKSIZE
    let maxlen = Number.isFinite(options.maxlen) ? options.maxlen : Inventory.DEFAULT_MAXLEN
    if (!Number.isFinite(maxlen) || maxlen <= 0) maxlen = Inventory.DEFAULT_MAXLEN
    const stack = { packs: [], maxlen, packsize }
    if (options.allow != null) stack.allow = options.allow
    if (options.visible === false) stack.visible = false
    if (options.reserved != null) stack.reserved = options.reserved
    if (options.moving != null) stack.moving = options.moving
    if (options.full != null) stack.full = options.full
    return stack
  }

  static normalizeStack (raw, defaults = {}) {
    if (raw == null) return Inventory.createStack(defaults)

    const packsize = Number.isFinite(raw.packsize)
      ? raw.packsize
      : Number.isFinite(defaults.packsize)
        ? defaults.packsize
        : Inventory.DEFAULT_PACKSIZE

    let maxlen = Number.isFinite(raw.maxlen)
      ? raw.maxlen
      : Number.isFinite(raw.size)
        ? raw.size
        : Number.isFinite(defaults.maxlen)
          ? defaults.maxlen
          : Inventory.DEFAULT_MAXLEN

    if (!Number.isFinite(maxlen) || maxlen <= 0) maxlen = Inventory.DEFAULT_MAXLEN

    let packs = []
    if (Array.isArray(raw)) {
      packs = raw.map(Inventory.normalizePack).filter(pack => pack)
    } else if (Array.isArray(raw.packs)) {
      packs = raw.packs.map(Inventory.normalizePack).filter(pack => pack)
    } else if (raw.id != null || raw.n != null) {
      const pack = Inventory.normalizePack(raw)
      if (pack) packs = [pack]
    }

    if (packs.length > maxlen) maxlen = packs.length

    const stack = { packs, maxlen, packsize }
    const allow = Inventory.normalizeAllow(raw.allow ?? defaults.allow, packsize)
    if (allow != null) stack.allow = allow
    const visible = raw.visible ?? defaults.visible
    if (visible === false) stack.visible = false
    if (raw.reserved != null) stack.reserved = raw.reserved
    if (raw.moving != null) stack.moving = raw.moving
    if (raw.full != null) stack.full = raw.full

    return stack
  }

  static ensureStack (stackMap, key, defaults = {}) {
    if (!stackMap || !key) return null
    stackMap[key] = Inventory.normalizeStack(stackMap[key], defaults)
    return stackMap[key]
  }

  static normalizeEntityStacks (entity) {
    if (!entity || typeof entity !== 'object') return
    if (!entity.stack || typeof entity.stack !== 'object') entity.stack = {}
    for (const key of Object.keys(entity.stack)) {
      entity.stack[key] = Inventory.normalizeStack(entity.stack[key])
    }
  }

  static isAllowed (stack, id) {
    if (!stack?.allow) return true
    if (typeof stack.allow !== 'object') return stack.allow === id
    return Object.prototype.hasOwnProperty.call(stack.allow, id)
  }

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
      if (newClass) {
        Inventory.normalizeEntityStacks(newClass)
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
    } else {
      inv = game.allInvs[invID]
    }
    inv.addItem({ id: newItem.inv.item.id, n: 1 })
  }
  
  static moveStack (data) {
    if (!data) return
    if (data.fromInvID === data.toInvID && data.fromInvKey === data.toInvKey && data.fromStackPos === data.toStackPos) return

    const fromInv = game.allInvs[data.fromInvID]
    const toInv = game.allInvs[data.toInvID]
    if (!fromInv || !toInv) return

    const fromStack = Inventory.ensureStack(fromInv.stack, data.fromInvKey)
    const toStack = Inventory.ensureStack(toInv.stack, data.toInvKey)

    const from = fromStack?.packs?.[data.fromStackPos]
    if (!from) {
      console.warn('[moveStack] no source pack', data)
      return
    }

    const itemId = from.id
    const itemCount = Number.isFinite(from.n) ? from.n : 0
    if (itemId == null || itemCount <= 0) return

    let transferedItems = 0
    const destPacks = toStack?.packs || (toStack.packs = [])
    const packsize = Number.isFinite(toStack?.packsize) ? toStack.packsize : Inventory.DEFAULT_PACKSIZE
    const maxlen = Number.isFinite(toStack?.maxlen) ? toStack.maxlen : Inventory.DEFAULT_MAXLEN

    if (!Inventory.isAllowed(toStack, itemId) || toStack?.full === true) {
      transferedItems = 0
    } else if (data.toStackPos != null) {
      if (data.toStackPos < maxlen) {
        const destPack = destPacks[data.toStackPos]
        if (!destPack || destPack.id == null) {
          transferedItems = Math.min(itemCount, packsize)
          destPacks[data.toStackPos] = { id: itemId, n: transferedItems }
        } else if (destPack.id === itemId) {
          transferedItems = Math.min(itemCount, packsize - destPack.n)
          if (transferedItems > 0) destPack.n += transferedItems
        }
      }
    } else {
      for (const destPack of destPacks) {
        if (destPack?.id === itemId && destPack.n < packsize) {
          transferedItems = Math.min(itemCount, packsize - destPack.n)
          if (transferedItems > 0) destPack.n += transferedItems
          break
        }
      }

      if (transferedItems === 0 && destPacks.length < maxlen) {
        transferedItems = Math.min(itemCount, packsize)
        destPacks.push({ id: itemId, n: transferedItems })
      }
    }

    if (transferedItems <= 0) {
      const reasons = []
      if (!toStack) reasons.push('missing-destination-stack')
      if (toStack?.full) reasons.push('destination-stack-full')
      if (toStack?.allow && !Inventory.isAllowed(toStack, itemId)) reasons.push('item-not-allowed')
      const matchingPack = destPacks.find(pack => pack?.id === itemId)
      if (matchingPack && matchingPack.n >= packsize) reasons.push('matching-pack-full')
      if (!matchingPack && destPacks.length >= maxlen) reasons.push('destination-stack-full')
      const info = {
        data,
        from,
        destStack: toStack ? { maxlen: toStack.maxlen, packsize: toStack.packsize, allow: toStack.allow } : null,
        destPackCount: Array.isArray(destPacks) ? destPacks.length : null,
        reasons
      }
      window.lastMoveStackFailure = info
      console.warn('[moveStack] transfer failed', info)
      return
    }

    fromInv.remItem({id: itemId, n: transferedItems}, data.fromInvKey, data.fromStackPos)
    // s.sendAll(JSON.stringify({msg:"updateInv", data:game.allInvs}));
    //if (data.fromInvID === 0 || data.toInvID === 0) window.player.setInventory(game.allInvs[0])
    //if (data.fromInvID === window.selEntity?.id || data.toInvID === window.selEntity?.id) game.updateInventoryMenu(window.selEntity)
  }

  static name = "Inventory"
  constructor (pos, entData) {
    this.stack = { INV: Inventory.createStack({ maxlen: 1, packsize: Inventory.DEFAULT_PACKSIZE }) }
    if (pos) this.pos = { x: pos.x, y: pos.y }
    if (entData) Object.assign(this, entData)
    Inventory.normalizeEntityStacks(this)
    if (!this.stack.INV) this.stack.INV = Inventory.createStack({ maxlen: 1, packsize: Inventory.DEFAULT_PACKSIZE })
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
    for (const stackName of Object.keys(this.stack)) {
      const stack = this.stack[stackName]
      if (!stack?.packs) continue
      for (const pack of stack.packs) {
        if (pack?.id === type) n += pack.n
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
      if (this.stack[key]?.packs?.some(pack => pack?.id != null)) ret++
    }
    return ret
  }

  // use this.hasPlaceFor()
  addItem (newItem, stackName = 'INV', prefPackPos) {
    const debug = typeof window !== 'undefined' && window.debugAddItem
    const reportFailure = (reason, details = {}) => {
      if (typeof window !== 'undefined') {
        window.lastAddItemFailure = { reason, item: newItem, stackName, prefPackPos, details }
      }
      if (debug) console.warn('[addItem]', reason, { item: newItem, stackName, prefPackPos, ...details })
    }
    if (newItem == null) {
      reportFailure('missing-item')
      return false
    }

    let stack = Inventory.ensureStack(this.stack, stackName)
    if (!stack) {
      reportFailure('missing-stack')
      return false
    }
    if (!Inventory.isAllowed(stack, newItem.id)) {
      reportFailure('not-allowed', { allow: stack.allow })
      return false
    }
    if (stack.full === true) {
      reportFailure('stack-full-flag', { full: stack.full })
      return false
    }

    let packs = stack.packs
    let packsize = Number.isFinite(stack.packsize) ? stack.packsize : Inventory.DEFAULT_PACKSIZE
    let maxlen = Number.isFinite(stack.maxlen) ? stack.maxlen : Inventory.DEFAULT_MAXLEN

    if (prefPackPos !== undefined) {
      if (prefPackPos >= maxlen) {
        reportFailure('pref-pack-out-of-range', { maxlen })
        return false
      }
      const prefPack = packs[prefPackPos]
      if (prefPack == null || prefPack.id == null) {
        packs[prefPackPos] = { id: newItem.id, n: newItem.n }
        return true
      }
      if (prefPack.id === newItem.id && prefPack.n + newItem.n <= packsize) {
        prefPack.n += newItem.n
        return true
      }
      reportFailure('pref-pack-mismatch-or-full', { existing: prefPack, packsize })
      return false
    }

    if (this.hasPlaceFor(newItem, stackName) === false) {
      reportFailure('no-space', { maxlen, packsize, packCount: packs.length })
      return false
    }
    stack = this.stack[stackName]
    packs = stack.packs
    packsize = Number.isFinite(stack.packsize) ? stack.packsize : Inventory.DEFAULT_PACKSIZE
    maxlen = Number.isFinite(stack.maxlen) ? stack.maxlen : Inventory.DEFAULT_MAXLEN

    for (let iPack = 0; iPack < packs.length; iPack++) {
      const pack = packs[iPack]
      if (!pack || pack.id == null) {
        packs[iPack] = { id: newItem.id, n: newItem.n }
        return true
      } else if (pack.id === newItem.id && pack.n + newItem.n <= packsize) {
        pack.n += newItem.n
        return true
      }
    }

    if (packs.length < maxlen) {
      packs.push({ id: newItem.id, n: newItem.n })
      return true
    }

    reportFailure('stack-at-capacity', { maxlen, packCount: packs.length })
    return false
  }

  hasPlaceFor (newItem, stackName = 'INV', prefPackPos) {
    if (newItem == null) return false
    const stack = Inventory.ensureStack(this.stack, stackName)
    if (!stack || !Inventory.isAllowed(stack, newItem.id)) return false

    if (stack.full === true) return false
    if (stack.full === false) return true

    const packs = stack.packs
    const packsize = Number.isFinite(stack.packsize) ? stack.packsize : Inventory.DEFAULT_PACKSIZE
    const maxlen = Number.isFinite(stack.maxlen) ? stack.maxlen : Inventory.DEFAULT_MAXLEN

    if (prefPackPos !== undefined) {
      if (prefPackPos >= maxlen) return false
      const prefPack = packs[prefPackPos]
      if (prefPack == null || prefPack.id == null) return true
      return prefPack.id === newItem.id && prefPack.n + newItem.n <= packsize
    }

    for (let iPack = 0; iPack < packs.length; iPack++) {
      const pack = packs[iPack]
      if (pack?.id == null) return true
      if (pack.id === newItem.id && pack.n + newItem.n <= packsize) return true
    }

    return packs.length < maxlen
  }

  addItems (newItems) {
    let ret = true
    for (let i = 0; i < newItems.length; i++) {
      ret = ret && this.addItem(newItems[i])
    }
    return ret
  }

  remItemFromStack (removingItem, stackName) {
    const stack = this.stack?.[stackName]
    if (!stack?.packs) return false
    for (let iPack = 0; iPack < stack.packs.length && removingItem; iPack++) {
      const pack = stack.packs[iPack]
      if (pack?.id && pack.id === removingItem.id) {
        const n = pack.n - removingItem.n
        if (n > 0) {
          pack.n = n
          return true
        } else if (n === 0) {
          stack.packs.splice(iPack, 1)
          return true
        } else {
          return false
        }
      }
    }
    return false
  }

  remItem (removingItem, prefStackName, prefPackPos) {
    if (prefStackName !== undefined && prefPackPos !== undefined) {
      const stack = this.stack?.[prefStackName]
      const pack = stack?.packs?.[prefPackPos]
      if (!pack) return false
      pack.n -= removingItem.n
      if (pack.n <= 0) stack.packs.splice(prefPackPos, 1)
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
    const stack = this.stack?.[stackName]
    if (stack?.packs?.[packPos]) stack.packs.splice(packPos, 1)
  }

  addPack (stackName, packPos, pack) {
    const stack = Inventory.ensureStack(this.stack, stackName)
    if (!stack) return
    const normalized = Inventory.normalizePack(pack) || pack
    if (packPos == null) stack.packs.push(normalized)
    else stack.packs.splice(packPos, 0, normalized)
  }

  addPacks (stackName, packs) {
    const stack = Inventory.ensureStack(this.stack, stackName)
    if (!stack || !Array.isArray(packs)) return
    for (let pack of packs) {
      const normalized = Inventory.normalizePack(pack)
      if (normalized) stack.packs.push(normalized)
    }
  }

  addStack (stackName, newStack) {
    if (!newStack) return
    if (newStack?.packs) {
      this.addPacks(stackName, newStack.packs)
      return
    }
    const keys = Object.keys(newStack)
    for (let pack of keys) {
      if (newStack[pack]?.packs) this.addPacks(stackName, newStack[pack].packs)
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

    const stack = this.stack?.[stackName]
    if (!stack?.packs) return
    for (let iPack = 0; iPack < stack.packs.length; iPack++) {
      const pack = stack.packs[iPack]
      if (pack?.id === searchItem.id && pack.n >= searchItem.n) return iPack
    }
  }

  hasItem (searchItem) {
    const keys = Object.keys(this.stack)
    for (let iStack = 0; iStack < keys.length && searchItem; iStack++) {
      const key = keys[iStack]
      const stack = this.stack[key]
      if (!stack?.packs) continue
      for (let iPack = 0; iPack < stack.packs.length && searchItem; iPack++) {
        const pack = stack.packs[iPack]
        if (pack?.id === searchItem.id) {
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
      const stack = this.stack?.[filterStack]
      if (!stack?.packs) return null
      for (const pack of stack.packs) {
        if (!pack) continue
        if (filterItem && pack.id !== filterItem) continue
        return pack.id
      }
      return null
    }

    //iterate all items
    
    for (const stackName of Object.keys(this.stack)) {
      const stack = this.stack[stackName]
      if (!stack?.packs) continue
      for (const pack of stack.packs) {
        if (!pack) continue
        if (filterItem && pack.id !== filterItem) continue
        if (pack.id != null) return pack.id
      }
    }
    return null
  }

  getStack (pref) {
    if (pref && this.stack?.[pref]) return this.stack[pref]
    for (const stackName of Object.keys(this.stack)) {
      const stack = this.stack[stackName]
      if (stack?.packs?.[0]?.id != null) return stack
    }
    return null
  }

  getFirstItem () {
    return this.getFirstPack()
  }

  getFirstPack (prefStack) {
    const selectedStack = this.getStack(prefStack)
    return selectedStack?.packs?.[0] || null
  }
}

if (typeof window !== 'undefined') {
  window.debugInventory = function debugInventory (inv = window.player, options = {}) {
    if (!inv) {
      console.warn('[debugInventory] No inventory provided.')
      return null
    }
    const stackSummary = {}
    const stacks = inv.stack || {}
    Object.keys(stacks).forEach(key => {
      const stack = stacks[key]
      const packs = Array.isArray(stack?.packs) ? stack.packs : []
      const items = packs
        .filter(pack => pack?.id != null)
        .map(pack => ({ id: pack.id, n: pack.n }))
      stackSummary[key] = {
        maxlen: stack?.maxlen,
        packsize: stack?.packsize,
        full: stack?.full,
        allow: stack?.allow ?? null,
        allowCount: stack?.allow ? Object.keys(stack.allow).length : 0,
        packCount: packs.length,
        items
      }
      if (options.raw === true) stackSummary[key].packs = packs
    })
    const summary = {
      id: inv.id,
      name: inv.name,
      type: inv.type,
      stack: stackSummary
    }
    console.log('[debugInventory]', summary)
    return summary
  }
}
