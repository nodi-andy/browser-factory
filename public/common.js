const tileSize = 10;
const SCROLL_SENSITIVITY = 0.0005;
const resDB = 
    {   none        : {id: 0    , name: "none"      , color: "darkgray" , emo: ""     , open: 0   , type: 0},
        water       : {id: 1    , name: "water"     , color: "blue"     , emo: "💧"   , open: 1   , type: "raw"},
        food        : {id: 2    , name: "food"      , color: "blue"     , emo: "🦌"  , open: 0  , type: "raw"},
        grass       : {id: 3    , name: "grass"     , color: "blue"     , emo: "🥛"   , open: 0   , type: "raw"},
        oil         : {id: 4    , name: "oil"       , color: "blue"     , emo: "🥛"   , open: 0   , type: "raw"},
        gold        : {id: 5    , name: "gold"      , color: "blue"     , emo: "🥛"   , open: 0   , type: "raw"},
        forest      : {id: 6    , name: "forest"    , color: "blue"     , emo: "🦌"   , open: 1   , type: "raw"},
        loam        : {id: 7    , name: "loam"      , color: "blue"     , emo: "🥛"   , open: 0   , type: "raw"},
        wool        : {id: 8    , name: "wool"      , color: "blue"     , emo: "🐑"   , open: 0   , type: "raw"},
        building    : {id: 9    , name: "building"  , color: "blue"     , emo: "🏠"   , open: 0   , type: "raw"},
        idea        : {id: 10   , name: "idea"      , color: "blue"     , emo: "💡"   , open: 1   , type: "raw"},
        input       : {id: 11   , name: "input"     , color: "red"      , emo: "📥"   , open: 0   , type: "building"},
        output      : {id: 12   , name: "output"    , color: "red"      , emo: "📤"   , open: 0   , type: "building"},
        chest       : {id: 13   , name: "chest"     , color: "red"      , emo: "📦"   , open: 1   , type: "building", size: [1, 1], cost: [{id: 16, n: 2}]},
        miner       : {id: 14   , name: "miner"     , color: "red"      , emo: "📤"   , open: 1   , type: "building"},
        furnace     : {id: 15   , name: "miner"     , color: "red"      , emo: "🍙"   , open: 1   , type: "building", size: [1, 1], cost: [{id: 20, n: 5}]},
        tree        : {id: 16   , name: "tree"      , color: "red"      , emo: "🌳"   , open: 1   , type: "building"},
        coal        : {id: 17   , name: "coal"      , color: "red"      , emo: "🌑"   , open: 1   , type: "raw"},
        iron        : {id: 18   , name: "iron"      , color: "red"      , emo: "⛰️"   , open: 1   , type: "raw"},
        copper      : {id: 19   , name: "copper"    , color: "red"      , emo: "🌕"   , open: 1   , type: "raw"},
        stone       : {id: 20   , name: "copper"    , color: "red"      , emo: "🧱"   , open: 1   , type: "raw"},
    }

const  layers = {terrain: 0, floor:1, res: 2, vis:3 } 

let player1             = {pos: {x: 200, y: 200}, inv: [], belt: []};
var canvas = undefined;
var beltMenu = {items:[], pos: {x: 0, y: 0}};
var invMenu = {items:[], pos: {x: 0, y: 0}};
var buildMenu = {items:[], pos: {x: 0, y: 0}};



function floorTile(p) {return {x: Math.floor(p.x/10)*10, y: Math.floor(p.y/10)*10}};
function ceilTile(p) {return {x: Math.ceil(p.x/10), y: Math.ceil(p.y/10)}};
function worldToTile(p) {return ({x: Math.floor(p.x/tileSize), y:Math.floor(p.y/tileSize)})}
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
function worldToGrid(p) { return {x: Math.floor(p.x), y: Math.floor(p.y)}; }

if (exports == undefined) var exports = {};
exports.resDB = resDB;
exports.layers = layers;
exports.player1 = player1;
exports.dist = dist;
exports.distV = distV;
exports.toUnitV = toUnitV;
exports.getNbOccur = getNbOccur;      
exports.worldToTile = worldToTile;