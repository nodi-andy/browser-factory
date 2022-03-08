const tileSize = 64;
const gridSize = {x: 160, y: 90}
const buttonSize = 68;

let DEV = true;

let buildDir = 0;

const resDB = Object();

resDB["player"]                  = {name: "player"      , type: "entity"};

resDB["hills"]                  = {name: "hills"        , type: "terrain"};
resDB["deepwater"]              = {name: "deep water"   , type: "terrain"};
resDB["water"]                  = {name: "water"        , type: "terrain"};
resDB["grassland"]              = {name: "grassland"    , type: "terrain"};


resDB["iron_plate"]             = {name: "iron plate"    ,  type: "item"};
resDB["copper_plate"]           = {name: "copper plate"  ,  type: "item"};

resDB["coal"]                   = {name: "coal"          ,  type: "item", E: 100};
resDB["stone"]                  = {name: "stone"         ,  type: "item"};
resDB["iron"]                   = {name: "iron"          ,  type: "item", W: 500, becomes: resDB.iron_plate};
resDB["copper"]                 = {name: "copper"        ,  type: "item", W: 500, becomes: resDB.copper_plate};
resDB["raw_wood"]               = {name: "raw_wood"      ,              type: "item"};

resDB["iron_ore"]               = {name: "iron ore"      , type: "res", W: 500, becomes: resDB.iron};
resDB["stone_ore"]              = {name: "stone ore"     , type: "res", W: 500, becomes: resDB.stone};
resDB["tree"]                   = {name: "tree"          , type: "res", E: 500, becomes: resDB.raw_wood};
resDB["copper_ore"]             = {name: "copper ore"    , type: "res", W: 500, becomes: resDB.copper};
resDB["coal_ore"]               = {name: "coal ore"      , type: "res", W: 500, becomes: resDB.coal};

resDB["copper_cable"]           = {name: "copper cable"  ,  type: "item", cost: [{res: resDB.copper_plate, n: 1}], lock: 1};
resDB["wood"]                   = {name: "wood"          , type: "item", E: 100, cost: [{res: resDB.raw_wood, n: 1}]};
resDB["wooden_stick"]           = {name: "wooden stick"  , type: "item", E: 100, cost: [{res: resDB.wood, n: 1}], lock: 1};
resDB["sharp_stone"]            = {name: "sharp stone"   , type: "item", E: 100, cost: [{res: resDB.stone, n: 2}], lock: 1};
resDB["iron_stick"]             = {name: "iron stick"    , type: "item", E: 100, cost: [{res: resDB.iron_plate, n: 1}]};

resDB["stone_furnace"]          = {name: "stone furnace" };
resDB["weak_armor"]             = {name: "weak armor"           , type: "item", lock: 1};
resDB["strong_armor"]           = {name: "strong armor"         , type: "item", lock: 1};
resDB["iron_chest"]             = {name: "iron chest"           , type: "item", lock: 1};
resDB["chest"]                  = {name: "chest"                , type: "entity", cost: [{res: resDB.wood, n: 4}]};
resDB["gear"]                   = {name: "gear"                 , type: "item", cost: [{res: resDB.iron_plate, n: 2}]};
resDB["hydraulic_piston"]       = {name: "hydraulic_piston"     , type: "item", cost: [{res: resDB.iron_plate, n: 1}, {res: resDB.iron_stick, n: 1}]};
resDB["circuit"]                = {name: "circuit"              , type: "item", size: [1, 1], cost: [{res: resDB.iron_plate, n: 1}, {res: resDB.copper_cable, n: 3}], lock: 1};
resDB["stone_axe"]              = {name: "stone_axe"            , type: "item", cost: [{res: resDB.wooden_stick, n: 2}, {res: resDB.sharp_stone, n: 2}], lock: 1};
resDB["iron_axe"]               = {name: "iron_axe"             , type: "item", cost: [{res: resDB.iron_stick, n: 2}, {res: resDB.iron_plate, n: 2}], lock: 1};
resDB["gun"]                    = {name: "gun"                  , type: "item", lock: 1};
resDB["rocket_launcher"]        = {name: "rocket_launcher"      , type: "item", lock: 1};
resDB["bullet"]                 = {name: "bullet"               , type: "item", lock: 1};
resDB["rocket"]                 = {name: "rocket"               , type: "item", lock: 1};
resDB["inserter"]               = {name: "inserter"             , type: "entity", lock: 1};
resDB["burner_miner"]           = {name: "coal mining platform"};
resDB["electrical_miner"]       = {name: "electrical mining platform"   ,   type: "entity", cost: [{res: resDB.coal, n: 2}], lock: 1};
resDB["belt1"]                  = {name: "transport belt"               ,  type: "entity"};
resDB["belt2"]                  = {name: "transport belt"               ,  type: "entity", lock: 1};
resDB["belt3"]                  = {name: "transport belt"               ,  type: "entity", lock: 1};
resDB["inserter_burner"]        = {name: "burner inserter"              , type: "entity", cost: [{res: resDB.iron_plate, n: 1}, {res: resDB.gear, n: 1}, {res: resDB.hydraulic_piston, n: 1}]};
resDB["inserter_short"]         = {name: "short inserter"          ,  type: "entity", cost: [{res: resDB.coal, n: 2}], lock: 1};
resDB["inserter"]               = {name: "inserter"          ,  type: "entity", cost: [{res: resDB.coal, n: 2}], lock: 1};
resDB["inserter_long"]          = {name: "long inserter"          ,  type: "entity", cost: [{res: resDB.coal, n: 2}], lock: 1};
resDB["inserter_smart"]         = {name: "smart inserter"          ,  type: "entity", cost: [{res: resDB.coal, n: 2}], lock: 1};
resDB["assembling_machine_1"]   = {name: "assembling machine 1"          , type: "entity", cost: [{res: resDB.coal, n: 2}]};
resDB["assembling_machine_2"]   = {name: "assembling machine 2"          , type: "entity", lock: 1};
resDB["assembling_machine_3"]   = {name: "assembling machine 3"          , type: "entity", lock: 1};
resDB["assembling_machine_4"]   = {name: "assembling machine 4"          , type: "entity", lock: 1};
resDB["pump"]                   = {name: "pump"                          , type: "entity", lock: 1};
resDB["pipe"]                   = {name: "pipe"          , type: "entity", lock: 1};
resDB["u_pipe"]                 = {name: "u_pipe"          , type: "entity", lock: 1};
resDB["boiler"]                 = {name: "boiler"          , type: "entity", lock: 1};
resDB["generator"]              = {name: "generator"          , type: "entity", lock: 1};
resDB["e_pole"]                 = {name: "electrical pole"          , type: "entity", lock: 1};
resDB["locomotive"]             = {name: "locomotive"          , type: "entity", lock: 1};
resDB["rail"]                   = {name: "rail"          , type: "entity", lock: 1};
resDB["rail_curved"]            = {name: "rail_curved"          , type: "entity", lock: 1};
resDB["asfalt"]                 = {name: "asfalt"          , type: "entity", lock: 1};
resDB["turret"]                 = {name: "turret"          , type: "entity", lock: 1};
resDB["laser_turret"]           = {name: "laser_turret"          , type: "entity", lock: 1};
resDB["car"]                    = {name: "car"          , type: "entity", lock: 1};

resDB["player"]                 = {name: "player"        , type: "entity", P: 100};

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
var allMovableEntities = [];
var game        = {};
var pointer; // Inventory on pointer
var selEntity;
var curResPos;
var lastResPos;
var canvas;
var playerID;
var player1;


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


if (exports == undefined) var exports = {};
exports.tileSize = tileSize;
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
exports.player1 = player1;
exports.playerID = playerID;
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
c.layers = layers;
c.allEnts = allEnts;
c.allInvs = allInvs;
c.selEntity = selEntity;
c.item = item;
c.dirToVec = dirToVec;
c.dirToAng = dirToAng;
c.playerID = playerID;
c.allMovableEntities = allMovableEntities;
