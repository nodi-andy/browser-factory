const { resDB, layers } = require("./common");
const { getInv, createInv } = require("./inventory");

class Belt {
    constructor() {
       resDB.belt.mach = this;
    }

    update(map, ent){
    }
}

if (exports == undefined) var exports = {};
exports.Shifter = Shifter;