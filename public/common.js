const tileSize = 64;
const gridSize = {x: 64, y: 64}
const buttonSize = 68;
const SCROLL_SENSITIVITY = 0.0005;
let camera      = {x: 0, y: 0, zoom: 1}
var tick = 0;
const DIR = {in: true, out: false}

let buildDir = 0;
/*const resID =
{
    none: 0,
    stone: 1,
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
    iron_plate: 21,
    deepwater: 22,
    water: 23,
    hills: 24,
    wood: 25,
    wooden_stick: 26,
    sharp_stone: 27,
    iron_stick: 28,
    gear_wheel: 29,
    hydraulic_piston: 30,
    circuit: 31,
    stone_axe: 32,
    iron_axe: 33,
    gun: 34,
    rocket_launcher: 35,
    bullet: 36,
    rocket: 37,
}*/

const mapType     = ["darkblue", "blue", "sandybrown", "sandybrown", "darkgreen", "green", "green", "green", "green", "green"];
const resDB = Object();

resDB["E"]              = {name: "Energy"       , type: "Energy"};
resDB["hills"]          = {name: "hills"        , type: "terrain"};
resDB["deepwater"]      = {name: "deep water"    , type: "terrain"};
resDB["water"]          = {name: "water"        , type: "terrain"};
resDB["grassland"]      = {name: "grassland"     , type: "terrain"};

resDB["tree"]           = {name: "tree"          , type: "res"};
resDB["copper_ore"]     = {name: "copper ore"    , type: "res"};
resDB["coal_ore"]       = {name: "coal ore"      , type: "res", E: 500};
resDB["stone_ore"]      = {name: "stone ore"     , type: "res"};
resDB["iron_ore"]       = {name: "iron ore"      , type: "res"};

resDB["coal"]           = {name: "coal"          , packsize: 1, type: "item"};
resDB["stone"]          = {name: "stone"         , packsize: 1, type: "item", cost: [{id: resDB.stone_ore.id, n: 1}, {id: resDB.coal.id, n:1}]};
resDB["raw_wood"]       = {name: "raw_wood"      , type: "item", E: 100};
resDB["wood"]           = {name: "raw_wood"      , type: "item", E: 100};
resDB["iron"]           = {name: "iron"          , packsize: 1, type: "item"};
resDB["copper"]         = {name: "copper"        , packsize: 1, type: "item"};
resDB["stone"]          = {name: "stone"         , packsize: 1, type: "item"};
resDB["iron_plate"]     = {name: "iron plate"    , packsize: 1, type: "item", cost: [{id: resDB.iron.id, n: 1}, {id: resDB.coal.id, n:1}, {id: resDB.E.id, n:100}]};
resDB["copper_plate"]   = {name: "copper plate"  , packsize: 1, type: "item", cost: [{id: resDB.copper.id, n: 1}, {id: resDB.coal.id, n:1}]};
resDB["copper_cable"]   = {name: "copper cable"  , packsize: 1, type: "item", cost: [{id: resDB.copper.id, n: 1}]};

resDB["player"]         = {name: "player"        , type: "entity"};
resDB["chest"]          = {name: "chest"         , packsize: 1, type: "entity", size: [1, 1], cost: [{id: resDB.raw_wood.id, n: 2}]};
resDB["belt"]           = {name: "belt"          , packsize: 1, type: "entity", cost: [{id: resDB.coal.id, n: 2}]};
resDB["stone_furnace"]  = {name: "stone furnace" , packsize: 2, type: "entity", size: [1, 1], cost: [{id: resDB.stone.id, n: 5}], output: [{id:resDB.iron_plate.id, n:1}, {id:resDB.copper_plate.id, n:1}, {id:resDB.stone.id, n:1}]};
resDB["extractor"]      = {name: "extractor"     , packsize: 1, type: "entity", size: [1, 1], cost: [{id: resDB.coal.id, n: 2}]};
resDB["inserter"]       = {name: "inserter"      , packsize: 1,  type: "entity", cost: [{id: resDB.coal.id, n: 2}]};

const resID = Object();
const resName = Array();
Object.keys(resDB).forEach((k) => {
    resDB[k].id = resName.length;
    resID[k] = resDB[k].id;
    resName.push(resDB[k]);
})

/*const resName =
{
    0: resDB.none,
    1: resDB.stone,
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
    21: resDB.iron_plate,
    22: resDB.deepwater,
    23: resDB.water,
    24: resDB.hills
}*/

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
var craftMenu = {items:[], pos: {x: 0, y: 0}, vis: false};



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
    if (v.x == 0 && v.y == 0) return {x:0, y:0};
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


  
var c = {};
c.resDB = resDB;
c.resID = resID;
c.game = game;
c.player1 = player1;

if (exports == undefined) var exports = {};
exports.resDB = resDB;
exports.resID = resID;
exports.DIR = DIR;
exports.layers = layers;
exports.gridSize = gridSize;
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