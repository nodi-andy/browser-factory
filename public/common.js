const tileSize = 64;
const gridSize = {x: 64, y: 64}
const buttonSize = 68;
const SCROLL_SENSITIVITY = 0.0005;
let camera      = {x: 0, y: 0, zoom: 1}

const DIR = {in: true, out: false}

let buildDir = 0;


const resDB = Object();

resDB["E"]              = {name: "Energy"       , type: "Energy"};
resDB["hills"]          = {name: "hills"        , type: "terrain"};
resDB["deepwater"]      = {name: "deep water"   , type: "terrain"};
resDB["water"]          = {name: "water"        , type: "terrain"};
resDB["grassland"]      = {name: "grassland"    , type: "terrain"};

resDB["tree"]           = {name: "tree"          , type: "res"};
resDB["copper_ore"]     = {name: "copper ore"    , type: "res"};
resDB["coal_ore"]       = {name: "coal ore"      , type: "res", E: 500};
resDB["stone_ore"]      = {name: "stone ore"     , type: "res"};
resDB["iron_ore"]       = {name: "iron ore"      , type: "res"};

resDB["coal"]           = {name: "coal"          , packsize: 1, type: "item", from: resDB.coal_ore};
resDB["stone"]          = {name: "stone"         , packsize: 1, type: "item", from: resDB.stone_ore};
resDB["raw_wood"]       = {name: "raw_wood"      ,              type: "item", E: 100, from: resDB.tree};
resDB["iron"]           = {name: "iron"          , packsize: 1, type: "item", E: 100, from: resDB.iron_ore};
resDB["copper"]         = {name: "copper"        , packsize: 1, type: "item", E: 100, from: resDB.copper_ore};
resDB["stone"]          = {name: "stone"         , packsize: 1, type: "item", E: 100, from: resDB.stone_ore};
resDB["iron_plate"]     = {name: "iron plate"    , packsize: 1, type: "item", cost: [{res: resDB.iron, n: 1}, {res: resDB.coal, n:1}, {res: resDB.E, n:100}]};
resDB["copper_plate"]   = {name: "copper plate"  , packsize: 1, type: "item", cost: [{res: resDB.copper, n: 1}, {res: resDB.coal, n:1}]};
resDB["copper_cable"]   = {name: "copper cable"  , packsize: 1, type: "item", cost: [{res: resDB.copper_plate, n: 1}]};
resDB["wood"]           = {name: "wood"          , type: "item", E: 100, cost: [{res: resDB.raw_wood, n: 1}]};
resDB["wooden_stick"]   = {name: "wooden stick"  , type: "item", E: 100, cost: [{res: resDB.wood, n: 1}] };
resDB["sharp_stone"]    = {name: "sharp stone"   , type: "item", E: 100, cost: [{res: resDB.stone, n: 2}]};
resDB["iron_stick"]     = {name: "iron stick"    , type: "item", E: 100, cost: [{res: resDB.iron_plate, n: 1}]};

resDB["stone_furnace"]  = {name: "stone furnace" , packsize: 2, type: "entity", size: [1, 1], cost: [{res: resDB.stone, n: 5}], output: [{res:resDB.iron_plate, n:1}, {res:resDB.copper_plate, n:1}, {res:resDB.stone, n:1}]};
resDB["weak_armor"]     = {name: "weak armor"         , packsize: 1, type: "item", size: [1, 1], cost: [{res: resDB.wood, n: 2}, {res: resDB.iron_plate, n: 2}]};
resDB["strong_armor"]   = {name: "strong armor"         , packsize: 1, type: "item", size: [1, 1], cost: [{res: resDB.wood, n: 2}]};
resDB["iron_chest"]     = {name: "iron chest"         , packsize: 1, type: "item", size: [1, 1], cost: [{res: resDB.wood, n: 2}]};
resDB["chest"]          = {name: "chest"         , packsize: 1, type: "entity", size: [1, 1], cost: [{res: resDB.wood, n: 4}]};
resDB["gear"]           = {name: "gear"         , packsize: 1, type: "item", size: [1, 1], cost: [{res: resDB.iron_plate, n: 2}]};
resDB["hydraulic_piston"]     = {name: "hydraulic_piston"    , packsize: 1, type: "item", size: [1, 1], cost: [{res: resDB.iron_plate, n: 1}, {res: resDB.iron_stick, n: 1}]};
resDB["circuit"]        = {name: "circuit"    , packsize: 1, type: "item", size: [1, 1], cost: [{res: resDB.iron_plate, n: 1}, {res: resDB.copper_cable, n: 3}]};
resDB["stone_axe"]      = {name: "stone_axe"    , packsize: 1, type: "item", size: [1, 1], cost: [{res: resDB.wooden_stick, n: 2}, {res: resDB.sharp_stone, n: 2}]};
resDB["iron_axe"]       = {name: "iron_axe"    , packsize: 1, type: "item", size: [1, 1], cost: [{res: resDB.iron_stick, n: 2}, {res: resDB.iron_plate, n: 2}]};
resDB["gun"]            = {name: "gun"    , packsize: 1, type: "item", size: [1, 1], cost: [{res: resDB.wood, n: 2}]};
resDB["rocket_launcher"]     = {name: "rocket_launcher"    , packsize: 1, type: "item", size: [1, 1], cost: [{res: resDB.wood, n: 2}]};
resDB["bullet"]         = {name: "bullet"    , packsize: 1, type: "item", size: [1, 1], cost: [{res: resDB.wood, n: 2}]};
resDB["rocket"]         = {name: "rocket"    , packsize: 1, type: "item", size: [1, 1], cost: [{res: resDB.wood, n: 2}]};
resDB["extractor"]      = {name: "extractor"     , packsize: 1, type: "entity", size: [1, 1], cost: [{res: resDB.coal, n: 2}]};
resDB["inserter"]       = {name: "inserter"      , packsize: 1,  type: "entity", cost: [{res: resDB.coal.id, n: 2}]};
resDB["burner_miner"]       = {name: "burner mining platform"      , packsize: 1,  type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["electrical_miner"]       = {name: "electrical mining platform"      , packsize: 1,  type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["belt1"]           = {name: "transport belt"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["belt2"]           = {name: "transport belt"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["belt3"]           = {name: "transport belt"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["player"]         = {name: "player"        , type: "entity", P: 100, output: [resDB.wood, resDB.wooden_stick, resDB.sharp_stone, resDB.iron_stick, resDB.gear, resDB.hydraulic_piston, resDB.copper_cable, resDB.circuit, resDB.stone_axe, resDB.iron_axe, resDB.gun, resDB.rocket_launcher, resDB.bullet, resDB.rocket, resDB.weak_armor, resDB.strong_armor, resDB.chest, resDB.iron_chest, resDB.stone_furnace, resDB.burner_miner, resDB.electrical_miner, resDB.belt1, resDB.belt2, resDB.belt3]};

const resID = Object();
const resName = Array();
Object.keys(resDB).forEach((k) => {
    resDB[k].id = resName.length;
    resID[k] = resDB[k].id;
    resName.push(resDB[k]);
})


const dirToVec = [{x: 1, y:0},{x: 0, y:1},{x: -1, y:0},{x: 0, y:-1}];
const  layers = {terrain: 0, floor:1, res: 2, buildings:3, inv:4, inext: 5, vis:6 } 
var allInvs = [];
var allEnts = [];
var game        = {};
var player1;
var pointerButton;
var curResPos = {x: 0, y: 0};
var lastResPos = {x: 0, y: 0};
var canvas = undefined;
var beltMenu = {items:[], pos: {x: 0, y: 0, w: 0, h:0}, vis: true};
var invMenu = {items:[], pos: {x: 0, y: 0, w: 0, h:0}, vis: false};
var craftMenu = {items:[], pos: {x: 0, y: 0, w: 0, h:0}, vis: false};
var receiptMenu = {item: undefined, items:[], pos: {x: 0, y: 0, w: 300, h:50}, vis: false};



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
    let addItem = {};
    for(let minedItem of resName) {
        if (minedItem.from && minedItem.from.id == inv.id) {
            addItem = {res: minedItem, n: inv.n} ;
            break;
        }
    };
    ws.send(JSON.stringify({cmd: "addToInv", data: [addItem]}));
 }
 
 function bookFromInv(inv, items, updateMsg = true) {
    if (!items) return;
    items.forEach(item => {
        let itemsExist = true;
        for(let c = 0; c < item.cost.length && itemsExist; c++) {
            itemsExist = false;
            itemsExist = inv.hasItems(item.cost);
        }
        if (itemsExist) { 
            if (inv.addItem(item)) inv.remItems(item.cost);
            if (updateMsg) {
                let addItem = {res: item, n: 1} ;
                ws.send(JSON.stringify({cmd: "addToInv", data: [addItem]}));
                ws.send(JSON.stringify({cmd: "remFromInv", data: item.cost}));
            }
        }
        return itemsExist;
    })

}



  


if (exports == undefined) var exports = {};
exports.resDB = resDB;
exports.game = game;
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


var c = {};
c.resDB = resDB;
c.resID = resID;
c.game = game;
c.player1 = player1;