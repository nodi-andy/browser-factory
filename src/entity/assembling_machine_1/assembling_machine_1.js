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

    setup(map, ent) {
        let inv = new inventory.Inventory(c.allInvs, ent.pos);//inventory.getInv(ent.pos.x, ent.pos.y);
        inv.prod = c.resDB.gear.id;

        inventory.setInv(ent.pos.x + 0, ent.pos. y + 1, inv.id);
        inventory.setInv(ent.pos.x + 0, ent.pos. y + 2, inv.id);
        inventory.setInv(ent.pos.x + 1, ent.pos. y + 0, inv.id);
        inventory.setInv(ent.pos.x + 1, ent.pos. y + 1, inv.id);
        inventory.setInv(ent.pos.x + 1, ent.pos. y + 2, inv.id);
        inventory.setInv(ent.pos.x + 2, ent.pos. y + 0, inv.id);
        inventory.setInv(ent.pos.x + 2, ent.pos. y + 1, inv.id);
        inventory.setInv(ent.pos.x + 2, ent.pos. y + 2, inv.id);

        inv.packsize = 1;
        inv.itemsize = 50;
        inv.stack.INPUTA = [];
        inv.stack.INPUTB = [];
        inv.stack.OUTPUT = [];
        inv.stacksize = 4;
        inv.packsize = {};
        inv.packsize.INPUTA = 1;
        inv.packsize.INPUTB = 1;
        inv.packsize.OUTPUT = 1;
        inv.packsize.INV = 1;
        inv.state = 0;
        inv.lastTime = performance.now();
    }


    update(map, ent){
        let invThis = inventory.getInv(ent.pos.x, ent.pos.y, true);
        invThis.need = [];
        invThis.need.push({id: c.resDB.iron_plate.id, n:50});

        if (invThis.stack.INV) {
            if (invThis.stack.INPUTA == undefined) invThis.stack.INPUTA = invThis.stack.INV[0];
            else {
                let inItem = invThis.stack.INV[0];
                let targetSlot = "INPUTA";
//                if (resName[inItem.id].E)  targetSlot = "FUEL";
                invThis.addItem(inItem, targetSlot);
                delete invThis.stack.INV;
            }
        }
        if(invThis.stack.INPUTA.length && invThis.stack.INPUTA[0].n > 1) {
            if (invThis.state == 0) {invThis.lastTime = performance.now(); invThis.state = 1};
            if (invThis.state == 1) {
                let deltaT = performance.now() - invThis.lastTime;
                let becomesThat = c.resDB.gear;
                if (becomesThat && deltaT > 1000) {
                    //if (inv.stack.OUTPUT == undefined || inv.stack.OUTPUT.length == 0) inv.stack.OUTPUT = [c.item(undefined, 0)];
                    if (invThis.stack.OUTPUT[0] == undefined) invThis.stack.OUTPUT[0] = c.item(undefined, 0);
                    if (invThis.stack.OUTPUT[0].n == undefined) invThis.stack.OUTPUT[0].n = 0;
                    invThis.stack.INPUTA[0].n-=2;
                    invThis.stack.OUTPUT[0].id = becomesThat.id;
                    invThis.stack.OUTPUT[0].n++;
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