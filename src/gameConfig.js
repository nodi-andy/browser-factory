const DEFAULT_SETUP_ID = 'factorio'
const STORAGE_KEY = 'browserfactory.setup'

const FACTORIO_CRAFTABLE = [
  'Wood',
  'StoneFurnace',
  'BurnerMiner',
  'Chest',
  'IronStick',
  'Gear',
  'HydraulicPiston',
  'Belt1',
  'Belt2',
  'Belt3',
  'Inserter',
  'InserterLong',
  'InserterSmart',
  'CopperCable',
  'Circuit',
  'AssemblingMachine1',
  'AssemblingMachine2',
  'AssemblingMachine3',
  'Car'
]

const FACTORIO_ENTITIES = [
  'StoneFurnace',
  'BurnerMiner',
  'Chest',
  'Belt1',
  'Belt2',
  'Belt3',
  'Inserter',
  'InserterLong',
  'InserterSmart',
  'AssemblingMachine1',
  'AssemblingMachine2',
  'AssemblingMachine3',
  'Car'
]

const FACTORIO_RESOURCES = ['Tree', 'CoalOre', 'CopperOre', 'IronOre', 'StoneOre']

export const gameSetups = {
  factorio: {
    label: 'Factorio',
    world: {
      gridSize: { x: 160, y: 90 },
      terrain: {
        mode: 'perlin',
        floorTile: 'Grassland',
        wallTile: 'Hills',
        borderWalls: false
      }
    },
    resources: {
      enabled: true,
      types: FACTORIO_RESOURCES
    },
    entities: {
      available: FACTORIO_ENTITIES
    },
    player: {
      inventorySlots: 64,
      craftable: FACTORIO_CRAFTABLE,
      startingInventory: []
    },
    ui: {
      inventory: { columns: 8 },
      crafting: { columns: 8, rows: 8 }
    }
  },
  kitchen: {
    label: 'Workshop',
    world: {
      gridSize: { x: 12, y: 12 },
      terrain: {
        mode: 'flat',
        floorTile: 'WorkshopFloor',
        wallTile: 'WorkshopWall',
        borderWalls: true
      }
    },
    resources: {
      enabled: false,
      types: [],
      fixedDeposits: []
    },
    entities: {
      available: ['InputUnit', 'WorkshopBench', 'Chest', 'Belt1', 'Inserter']
    },
    player: {
      inventorySlots: 8,
      craftable: [],
      startingInventory: []
    },
    ui: {
      inventory: { columns: 4 },
      crafting: { columns: 4, rows: 2 }
    }
  }
}

function toPositiveInt (value, fallback) {
  if (Number.isFinite(value) && value > 0) return Math.round(value)
  return fallback
}

function normalizeGridSize (raw) {
  return {
    x: toPositiveInt(raw?.x, 160),
    y: toPositiveInt(raw?.y, 90)
  }
}

function cloneObject (value) {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return value
  }
}

function normalizeSetup (id, raw) {
  const setup = raw || gameSetups[DEFAULT_SETUP_ID]
  const worldGrid = normalizeGridSize(setup?.world?.gridSize)
  const inventorySlots = toPositiveInt(setup?.player?.inventorySlots, 64)
  const inventoryColumns = toPositiveInt(setup?.ui?.inventory?.columns, 8)
  const craftingColumns = toPositiveInt(setup?.ui?.crafting?.columns, 8)
  const craftingRows = toPositiveInt(setup?.ui?.crafting?.rows, 8)

  return {
    id,
    label: setup?.label || id,
    world: {
      gridSize: worldGrid,
      terrain: {
        mode: setup?.world?.terrain?.mode === 'flat' ? 'flat' : 'perlin',
        floorTile: setup?.world?.terrain?.floorTile || 'Grassland',
        wallTile: setup?.world?.terrain?.wallTile || 'Hills',
        borderWalls: setup?.world?.terrain?.borderWalls === true
      }
    },
    resources: {
      enabled: setup?.resources?.enabled !== false,
      types: Array.isArray(setup?.resources?.types) ? [...setup.resources.types] : [],
      fixedDeposits: Array.isArray(setup?.resources?.fixedDeposits) ? cloneObject(setup.resources.fixedDeposits) : []
    },
    entities: {
      available: Array.isArray(setup?.entities?.available) ? [...setup.entities.available] : []
    },
    player: {
      inventorySlots,
      craftable: Array.isArray(setup?.player?.craftable) ? [...setup.player.craftable] : [...FACTORIO_CRAFTABLE],
      startingInventory: Array.isArray(setup?.player?.startingInventory) ? cloneObject(setup.player.startingInventory) : []
    },
    ui: {
      inventory: {
        columns: inventoryColumns,
        rows: Math.max(1, Math.ceil(inventorySlots / inventoryColumns))
      },
      crafting: {
        columns: craftingColumns,
        rows: craftingRows
      }
    }
  }
}

function getRequestedSetupId () {
  if (typeof window === 'undefined') return DEFAULT_SETUP_ID
  const querySetup = new URLSearchParams(window.location.search).get('setup')
  if (querySetup && gameSetups[querySetup]) {
    window.localStorage?.setItem(STORAGE_KEY, querySetup)
    return querySetup
  }
  window.localStorage?.setItem(STORAGE_KEY, DEFAULT_SETUP_ID)
  return DEFAULT_SETUP_ID
}

function classByName (name) {
  if (typeof window === 'undefined') return null
  if (name == null) return null
  if (typeof name === 'number') return window.classDBi?.[name] || null
  if (window.classDB?.[name]) return window.classDB[name]
  if (typeof name === 'string' && window.classDB?.[name.toLowerCase()]) return window.classDB[name.toLowerCase()]
  return null
}

const activeSetupId = getRequestedSetupId()
export const gameSetup = normalizeSetup(activeSetupId, gameSetups[activeSetupId])

export function getInventoryLayout () {
  return {
    slots: gameSetup.player.inventorySlots,
    columns: gameSetup.ui.inventory.columns,
    rows: gameSetup.ui.inventory.rows
  }
}

export function getCraftingLayout () {
  return {
    columns: gameSetup.ui.crafting.columns,
    rows: gameSetup.ui.crafting.rows
  }
}

export function getPlayerCraftableList () {
  return [...gameSetup.player.craftable]
}

export function isEntityAllowed (entityType) {
  const allowed = gameSetup.entities.available
  if (!Array.isArray(allowed) || allowed.length === 0) return true

  const entity = classByName(entityType)
  if (!entity) return false
  const typeName = entity?.name || ''

  return allowed.includes(typeName)
}

export function isResourceAllowed (resourceType) {
  if (gameSetup.resources.enabled === false) return false
  const allowed = gameSetup.resources.types
  if (!Array.isArray(allowed) || allowed.length === 0) return true

  const resource = classByName(resourceType)
  if (!resource) return false
  return allowed.includes(resource.name)
}

export function applyStartingInventory (inv) {
  if (!inv || !Array.isArray(gameSetup.player.startingInventory)) return
  for (const item of gameSetup.player.startingInventory) {
    const entry = classByName(item?.id)
    if (entry?.id == null) continue
    const n = toPositiveInt(item?.n, 1)
    inv.addItem({ id: entry.id, n })
  }
}

if (typeof window !== 'undefined') {
  window.gameSetup = gameSetup
  window.gameSetups = gameSetups
  window.setGameSetup = function setGameSetup (id) {
    if (!id || !gameSetups[id]) return false
    window.localStorage?.setItem(STORAGE_KEY, id)
    window.location.reload()
    return true
  }
}
