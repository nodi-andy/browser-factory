const tileSize = 64;
const gridSize = {x: 160, y: 90}
const buttonSize = 68;

let DEV = false;

let buildDir = 0;


const resDB = Object();

resDB["hills"]          = {name: "hills"        , type: "terrain"};
resDB["deepwater"]      = {name: "deep water"   , type: "terrain"};
resDB["water"]          = {name: "water"        , type: "terrain"};
resDB["grassland"]      = {name: "grassland"    , type: "terrain"};

resDB["tree"]           = {name: "tree"          , type: "res", E: 500, becomes: resDB.raw_wood};
resDB["copper_ore"]     = {name: "copper ore"    , type: "res", W: 500, becomes: resDB.copper};
resDB["coal_ore"]       = {name: "coal ore"      , type: "res", W: 500, becomes: resDB.coal};

resDB["iron_plate"]     = {name: "iron plate"    , packsize: 1, type: "item"};
resDB["copper_plate"]   = {name: "copper plate"  , packsize: 1, type: "item"};

resDB["coal"]           = {name: "coal"          , packsize: 1, type: "item", E: 100};
resDB["stone"]          = {name: "stone"         , packsize: 1, type: "item"};
resDB["iron"]           = {name: "iron"          , packsize: 1, type: "item", W: 500, becomes: resDB.iron_plate};
resDB["copper"]         = {name: "copper"        , packsize: 1, type: "item", W: 500, becomes: resDB.copper_plate};
resDB["raw_wood"]       = {name: "raw_wood"      ,              type: "item"};

resDB["iron_ore"]       = {name: "iron ore"      , type: "res", W: 500, becomes: resDB.iron};
resDB["stone_ore"]      = {name: "stone ore"     , type: "res", W: 500, becomes: resDB.stone};

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
resDB["inserter"]               = {name: "inserter"      , packsize: 1,  type: "entity", cost: [{res: resDB.coal.id, n: 2}]};
resDB["burner_miner"]           = {name: "burner mining platform"      , packsize: 1,  type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["electrical_miner"]       = {name: "electrical mining platform"      , packsize: 1,  type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["belt1"]                  = {name: "transport belt"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["belt2"]                  = {name: "transport belt"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["belt3"]                  = {name: "transport belt"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["inserter_burner"]        = {name: "burner inserter"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["inserter_short"]         = {name: "short inserter"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["inserter"]               = {name: "inserter"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["inserter_long"]          = {name: "long inserter"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["inserter_smart"]         = {name: "smart inserter"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["assembling_machine_1"]   = {name: "assembling machine 1"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["assembling_machine_2"]   = {name: "assembling machine 2"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["assembling_machine_3"]   = {name: "assembling machine 3"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
/*resDB["assembling_machine_4"]   = {name: "assembling machine 3"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["pump"]   = {name: "assembling machine 3"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["pipe"]   = {name: "assembling machine 3"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["u_pipe"]   = {name: "assembling machine 3"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["boiler"]   = {name: "assembling machine 3"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["generator"]   = {name: "assembling machine 3"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["e_pole"]   = {name: "assembling machine 3"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["locomotive"]   = {name: "assembling machine 3"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["rail"]   = {name: "assembling machine 3"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["rail_curved"]   = {name: "assembling machine 3"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["asfalt"]   = {name: "assembling machine 3"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["tower"]   = {name: "assembling machine 3"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["turret"]   = {name: "assembling machine 3"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["laser_turret"]   = {name: "assembling machine 3"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["wall"]   = {name: "assembling machine 3"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["car"]   = {name: "assembling machine 3"          , packsize: 1, type: "entity", cost: [{res: resDB.coal, n: 2}]};*/

resDB["player"]         = {name: "player"        , type: "entity", P: 100, output: [resDB.wood, resDB.wooden_stick, resDB.sharp_stone, resDB.iron_stick, resDB.gear, resDB.hydraulic_piston, resDB.copper_cable, resDB.circuit, resDB.stone_axe, resDB.iron_axe, resDB.gun, resDB.rocket_launcher, resDB.bullet, resDB.rocket, resDB.weak_armor, resDB.strong_armor, resDB.chest, resDB.iron_chest, resDB.stone_furnace, resDB.burner_miner, resDB.electrical_miner, resDB.belt1, resDB.belt2, resDB.belt3, resDB.inserter_burner, resDB.inserter_short, resDB.inserter, resDB.inserter_long, resDB.inserter_smart, resDB.assembling_machine_1, resDB.assembling_machine_2, resDB.assembling_machine_3]};

const resID = Object();
const resName = Array();
Object.keys(resDB).forEach((k) => {
    resDB[k].id = resName.length;
    resID[k] = resDB[k].id;
    resName.push(resDB[k]);
})


const dirToVec = [{x: 1, y:0},{x: 0, y:1},{x: -1, y:0},{x: 0, y:-1}];
const dirToAng = [0, 90, 180, 270];
const  layers = {terrain: 0, floor:1, res: 2, buildings:3, inv:4, inext: 5, vis:6 } 
var allInvs = [];
var allEnts = [];
var game        = {};
var player1;
var pointerButton;
var selEntity;
var curResPos;
var lastResPos;
var canvas = undefined;


function item(type, n) {return {id: type, n: n}}

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


function showInventory(inv) {
    if (inv == undefined) return;
    let showStack = inv.stack;
  
    entityMenu.vis = true;
    let init = entityMenu.invID != inv.id;
    entityMenu.invID = inv.id;
    if (init) {
        entityMenu.buttons = {};
        entityMenu.items = [];
    }

    let dx = 200;
    let dy = 64;
    for(let s of Object.keys(showStack)) {
        dx = 200;
        if (init) entityMenu.buttons[s] = [];
        for(let stackPos in showStack[s]) {
            let item = showStack[s][stackPos];
            let button;
            if (init) button = new Button(dx , dy, item, entityMenu, c.selEntity.inv);
            else button = entityMenu.buttons[s][stackPos];
            dx += buttonSize;
            button.invKey = s;
            button.stackPos = stackPos;
            button.item = item;

            if (init) entityMenu.items.push(button);
            if (init) entityMenu.buttons[s].push(button);

        }
        dy += buttonSize;
    }
}


if (exports == undefined) var exports = {};
exports.resDB = resDB;
exports.game = game;
exports.resID = resID;
exports.layers = layers;
exports.gridSize = gridSize;
exports.dist = dist;
exports.distV = distV;
exports.toUnitV = toUnitV;
exports.getNbOccur = getNbOccur;      
exports.worldToTile = worldToTile;
exports.allInvs = allInvs;
exports.allEnts = allEnts;

exports.resName = resName;
exports.dirToVec = dirToVec;
exports.item = item;


var c = {};
c.isServer = (typeof window === "undefined");
c.isBrowser = !c.isServer;
c.tileSize = tileSize;
c.gridSize = gridSize;
c.resDB = resDB;
c.resID = resID;
c.resName = resName;
c.game = game;
c.player1 = player1;
c.layers = layers;
c.allEnts = allEnts;
c.allInvs = allInvs;
c.selEntity = selEntity;
c.item = item;
c.dirToVec = dirToVec;
c.dirToAng = dirToAng;