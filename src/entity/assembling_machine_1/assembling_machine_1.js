if (typeof window === 'undefined') {
    c = require("../../common");
    inventory = require("../../core/inventory");
} 


class AssemblingMachine1 {
    constructor() {
      let db = c.resDB.assembling_machine_1;
      db.mach = this;
      if (typeof Image !== 'undefined') {
        const image = new Image(512, 32);
        image.src = "./src/" + db.type + "/assembling_machine_1/platform.png";
        db.anim = image;
      }
      db.size = [3, 3];
      db.output = [
        c.resDB.wooden_stick.id,
        c.resDB.sharp_stone.id,
        c.resDB.iron_stick.id,
        c.resDB.gear.id,
        c.resDB.hydraulic_piston.id,
        c.resDB.copper_cable.id,
        c.resDB.circuit.id,
        c.resDB.stone_axe.id,
        c.resDB.iron_axe.id,
        c.resDB.gun.id,
        c.resDB.rocket_launcher.id,
        c.resDB.bullet.id,
        c.resDB.rocket.id,
        c.resDB.weak_armor.id,
        c.resDB.strong_armor.id,
        c.resDB.chest.id,
        c.resDB.iron_chest.id,
        c.resDB.stone_furnace.id,
        c.resDB.burner_miner.id,
        c.resDB.electrical_miner.id,
        c.resDB.belt1.id,
      ];
    }

    setup(map, inv) {
        inv.prod = c.resDB.gear.id;

        inventory.setInv(inv.pos.x + 0, inv.pos. y + 1, inv.id);
        inventory.setInv(inv.pos.x + 0, inv.pos. y + 2, inv.id);
        inventory.setInv(inv.pos.x + 1, inv.pos. y + 0, inv.id);
        inventory.setInv(inv.pos.x + 1, inv.pos. y + 1, inv.id);
        inventory.setInv(inv.pos.x + 1, inv.pos. y + 2, inv.id);
        inventory.setInv(inv.pos.x + 2, inv.pos. y + 0, inv.id);
        inventory.setInv(inv.pos.x + 2, inv.pos. y + 1, inv.id);
        inventory.setInv(inv.pos.x + 2, inv.pos. y + 2, inv.id);

        inv.packsize = 1;
        inv.itemsize = 50;
        inv.stacksize = 4;
        inv.packsize = {};
        inv.state = 0;
        inv.lastTime = performance.now();
    }

    setOutput(map, inv, out) {
        inv.prod = out;
        let keys = Object.keys(inv.stack);
        for(let iStack = 0; iStack < keys.length; iStack++) {
            let key = keys[iStack];
            if (key == "PROD") continue;
            if (inv.stack[key]?.id) c.player.addItem(inv.stack[key]);
            if (inv.stack[key][0]?.id) c.player.addItems(inv.stack[key]);   
        }

        let cost = resName[inv.prod].cost;
        inv.stack = {};
        inv.packsize = {};
        inv.stack.OUTPUT = [];
        inv.packsize.OUTPUT = 1;
        for(let icost = 0; icost < cost.length; icost++) {
            let item = cost[icost];
            let name = resName[item.id].name;
            inv.stack[name] = [];
            inv.packsize[name] = 1;
        }
    }

    update(map, invThis){

        invThis.need = JSON.parse(JSON.stringify(resName[invThis.prod].cost));
        for(let costItemID = invThis.need.length-1; costItemID >= 0; costItemID--) {
            let costItem = invThis.need[costItemID];
            let existing = invThis.getNumberOfItems(costItem.id);
            if (existing >= costItem.n) {
                invThis.need.splice(costItemID, 1);
            } 
        }

        if (invThis.need.length == 0) invThis.need = JSON.parse(JSON.stringify(resName[invThis.prod].cost));



        let tempInv = new Inventory();
        tempInv.stack = JSON.parse(JSON.stringify(invThis.stack));
        tempInv.packsize = JSON.parse(JSON.stringify(invThis.packsize));
        tempInv.PROD = [];
        tempInv.OUTPUT = [];
        if(invThis.need && tempInv.remItems(invThis.need)) {
            if (invThis.state == 0) {invThis.lastTime = performance.now(); invThis.state = 1};
            if (invThis.state == 1) {
                let deltaT = performance.now() - invThis.lastTime;
                if (invThis.prod && deltaT > 1000) {
                    if (!invThis.stack.OUTPUT?.length) invThis.stack.OUTPUT = [c.item(invThis.prod, 0)];
                    if (invThis.stack.OUTPUT[0] == undefined) invThis.stack.OUTPUT[0] = c.item(invThis.prod, 0);
                    if (invThis.stack.OUTPUT[0].n == undefined) invThis.stack.OUTPUT[0].n = 0;
                    invThis.stack.OUTPUT[0].n++;
                    invThis.remItems(resName[invThis.prod].cost);
                    invThis.lastTime = performance.now();
                }
            }
        }
    }

    draw(ctx, ent) {
        let db = c.resDB.assembling_machine_1;
        ctx.drawImage(db.anim, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize);
    }
}

if (exports == undefined) var exports = {};
exports.AssemblingMachine1 = AssemblingMachine1;