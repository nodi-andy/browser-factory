const tileSize = 64;
const gridSize = {x: 64, y: 64}
const SCROLL_SENSITIVITY = 0.0005;
let camera      = {x: 0, y: 0, zoom: 1}
var tick = 0;
const DIR = {in: true, out: false}

let buildDir = 0;
const resID =
{
    none: 0,
    stone_brick: 1,
    steel_plate: 2,
    copper_plate: 3,
    inserter: 4,
    copper_cable: 5,
    extractor: 6,
    belt: 7,
    grassland: 8,
    coal_ore: 9,
    stone_ore: 10,
    copper_ore: 11,
    iron_ore: 12,
    chest: 13,
    player: 14,
    furnace: 15,
    tree: 16,
    coal: 17,
    iron: 18,
    copper: 19,
    stone: 20,
    iron_plate: 21
}




const mapType     = ["darkblue", "blue", "sandybrown", "sandybrown", "darkgreen", "green", "green", "green", "green", "green"];
const resDB =
{
    copper_ore      : {id: resID.copper_ore     , name: "copper ore"    , type: "ore"},
    coal_ore        : {id: resID.coal_ore       , name: "coal ore"      , type: "ore"},
    stone_ore       : {id: resID.stone_ore      , name: "stone ore"     , type: "ore"},
    iron_ore        : {id: resID.iron_ore       , name: "iron ore"      , type: "ore"},
    grassland       : {id: resID.grassland      , name: "grassland"     , type: "ore"},
    player          : {id: resID.player         , name: "player"        , type: "machine"},
    steel_plate     : {id: resID.steel_plate   , name: "steel plate"    , packsize: 1, open: 1   , type: "res", cost: [{id: resID.chest, n: 1}, {id: resID.coal, n:1}]},
    chest           : {id: resID.chest         , name: "chest"          , packsize: 1, open: 1   , type: "machine", size: [1, 1], cost: [{id: resID.tree, n: 2}]},
    extractor       : {id: resID.extractor     , name: "extractor"      , packsize: 1, open: 1   , type: "machine", size: [1, 1], cost: [{id: resID.coal, n: 2}], svg: undefined},
    inserter        : {id: resID.inserter       , name: "inserter"      , packsize: 1, open: 1   , type: "machine", cost: [{id: resID.coal, n: 2}], svg: undefined},
    belt            : {id: resID.belt          , name: "belt"           , packsize: 1, open: 1   , type: "machine", cost: [{id: resID.coal, n: 2}], svg: undefined},
    furnace         : {id: resID.furnace       , name: "furnace"        , packsize: 2, open: 1   , type: "machine", size: [1, 1], cost: [{id: resID.stone, n: 5}], output: [{id:resID.iron_plate, n:1}, {id:resID.copper_plate, n:1}, {id:resID.stone_brick, n:1}, {id:resID.steel_plate, n:1}]},
    tree            : {id: resID.tree          , name: "tree"           , packsize: 1, open: 1   , type: "res"},
    coal            : {id: resID.coal          , name: "coal"           , packsize: 1, open: 1   , type: "res"   , emo: undefined  },
    iron            : {id: resID.iron          , name: "iron"           , packsize: 1, open: 1   , type: "res"},
    copper          : {id: resID.copper        , name: "copper"         , packsize: 1, open: 1   , type: "res"},
    stone           : {id: resID.stone         , name: "stone"          , packsize: 1, open: 1   , type: "res"},
    iron_plate      : {id: resID.iron_plate    , name: "iron plate"     , packsize: 1, open: 1   , type: "res", cost: [{id: resID.iron, n: 1}, {id: resID.coal, n:1}]},
    copper_plate    : {id: resID.copper_plate  , name: "copper plate"   , packsize: 1, open: 1   , type: "res", cost: [{id: resID.copper, n: 1}, {id: resID.coal, n:1}]},
    copper_cable    : {id: resID.copper_cable  , name: "copper cable"   , packsize: 1, open: 1   , type: "res", cost: [{id: resID.copper, n: 1}]},
    stone_brick     : {id: resID.stone_brick   , name: "stone brick"    , packsize: 1, open: 1   , type: "res", cost: [{id: resID.stone, n: 1}, {id: resID.coal, n:1}]},
}

const resName =
{
    0: resDB.none,
    1: resDB.stone_brick,
    2: resDB.steel_plate,
    3: resDB.copper_plate,
    4: resDB.inserter,
    5: resDB.copper_cable,
    6: resDB.extractor,
    7: resDB.belt,
    8: resDB.grassland,
    9: resDB.coal_ore,
    10: resDB.stone_ore,
    11: resDB.copper_ore,
    12: resDB.iron_ore,
    13: resDB.chest,
    14: resDB.player,
    15: resDB.furnace,
    16: resDB.tree,
    17: resDB.coal,
    18: resDB.iron,
    19: resDB.copper,
    20: resDB.stone,
    21: resDB.iron_plate
}

const dirToVec = [{x: 1, y:0},{x: 0, y:1},{x: -1, y:0},{x: 0, y:-1}];
const  layers = {terrain: 0, floor:1, res: 2, buildings:3, inv:4, inext: 5, vis:6 } 
var allInvs = [];
var allEnts = [];
let game        = {};
let player1;
var pointerButton;
var curResPos = {x: 0, y: 0};
var lastResPos = {x: 0, y: 0};
var canvas = undefined;
var beltMenu = {items:[], pos: {x: 0, y: 0}, vis: true};
var invMenu = {items:[], pos: {x: 0, y: 0}, vis: false};
var buildMenu = {items:[], pos: {x: 0, y: 0}, vis: false};



function floorTile(p) {return {x: Math.floor(p.x/10)*10, y: Math.floor(p.y/10)*10}};
function ceilTile(p) {return {x: Math.ceil(p.x/10), y: Math.ceil(p.y/10)}};
function worldToTile(p) {
    return (
        {x: Math.min(Math.floor(p.x/tileSize), gridSize.x), 
         y: Math.min(Math.floor(p.y/tileSize), gridSize.y)});
}
function dist(a, b) {return Math.hypot(a.x-b.x, a.y-b.y);}
function getDistance(b1, b2) {
    var d = {x: b1.x - b2.x, y: b1.y - b2.y}
    var distance = Math.sqrt(d.x * d.x + d.y * d.y);
    if (b2.r == undefined) b2.r = 0;
    return distance - (b1.r + b2.r);
}
function distV(a, b) {return {x: a.x-b.x, y: a.y-b.y};}
function toUnitV(v) {
    let len = Math.hypot(v.x, v.y);
    return {x: v.x / len, y: v.y / len}
}

function getNbOccur(arr, val) {
    var occurs = 0;
    
    for (var i=0; i<arr.length; i++) {
        if ( 'job' in arr[i] && arr[i].job === val ) occurs++;
    }

    return occurs;
}

function screenToWorld(p) { return {x: p.x/camera.zoom - camera.x, y: p.y/camera.zoom - camera.y}; }

function mineToInv(inv) {
    ws.send(JSON.stringify({cmd: "mineToInv", data: inv}));
 }
 
 function bookFromInv(inv, items, updateMsg = true) {
    if (!items) return;
    items.forEach(item => {
        let itemsExist = true;
        for(let c = 0; c < resName[item.id].cost.length && itemsExist; c++) {
            itemsExist = false;
            itemsExist = inv.hasItems(resName[item.id].cost);
        }
        if (itemsExist) { 
            if (inv.addItem(item)) inv.remItems(resName[item.id].cost);
            if (updateMsg) ws.send(JSON.stringify({cmd: "craftToInv", data: item}));
        }
        return itemsExist;
    })

}


  
var c = Object()
c.resID = resID;
c.game = game;

if (exports == undefined) var exports = {};
exports.resDB = resDB;
exports.resID = resID;
exports.DIR = DIR;
exports.layers = layers;
exports.gridSize = gridSize;
exports.player1 = player1;
exports.dist = dist;
exports.distV = distV;
exports.toUnitV = toUnitV;
exports.getNbOccur = getNbOccur;      
exports.worldToTile = worldToTile;
exports.allInvs = allInvs;
exports.allEnts = allEnts;
exports.bookFromInv = bookFromInv;
exports.resName = resName;
exports.dirToVec = dirToVec;
exports.tick = tick;
exports.c = c;
