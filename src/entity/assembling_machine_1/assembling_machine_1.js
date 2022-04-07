if (typeof window === 'undefined') {
    c = require("../../common");
    inventory = require("../../core/inventory");
} 


class AssemblingMachine1 extends Inventory {
    constructor(pos, data) {
        super(data.pos, data);
        data.pos = pos;
        this.setup(undefined, data);
    }

    setup(map, inv) {
        this.prod = inv.prod;
        if (this.prod == undefined) this.prod = c.resDB.gear.id;

        inventory.setInv(inv.pos.x + 0, inv.pos. y + 1, inv.id);
        inventory.setInv(inv.pos.x + 0, inv.pos. y + 2, inv.id);
        inventory.setInv(inv.pos.x + 1, inv.pos. y + 0, inv.id);
        inventory.setInv(inv.pos.x + 1, inv.pos. y + 1, inv.id);
        inventory.setInv(inv.pos.x + 1, inv.pos. y + 2, inv.id);
        inventory.setInv(inv.pos.x + 2, inv.pos. y + 0, inv.id);
        inventory.setInv(inv.pos.x + 2, inv.pos. y + 1, inv.id);
        inventory.setInv(inv.pos.x + 2, inv.pos. y + 2, inv.id);

        this.packsize = 1;
        this.itemsize = 50;
        this.stacksize = 4;
        this.packsize = {};
        this.state = 0;
        this.lastTime = performance.now();
        this.setOutput(this.prod, false);
    }

    setOutput(out, transferInputToPlayer) {
        this.prod = out;
        if (this.stack && transferInputToPlayer) {
            let keys = Object.keys(this.stack);
            for(let iStack = 0; iStack < keys.length; iStack++) {
                let key = keys[iStack];
                if (key == "PROD") continue;
                if (this.stack[key]?.id) c.player?.addItem(this.stack[key]);
                if (this.stack[key][0]?.id) c.player?.addItems(this.stack[key]);   
            }
        }

        let cost = resName[this.prod].cost;
        if (this.stack == undefined && inv.stack) this.stack = inv.stack;
        if (this.stack == undefined) this.stack = {};
        this.packsize = {};
        if (this.stack.OUTPUT == undefined) this.stack.OUTPUT = [];
        this.stack.OUTPUT.itemsize = 50;
        this.packsize.OUTPUT = 1;
        for(let icost = 0; icost < cost.length; icost++) {
            let item = cost[icost];
            let name = resName[item.id].name;
            if (this.stack[name] == undefined) this.stack[name] = [];
            this.packsize[name] = 1;
        }
    }

    update(map, invThis){

        this.preneed = JSON.parse(JSON.stringify(resName[this.prod].cost));
        delete this.preneed.OUTPUT;
        delete this.preneed.PROD;

        this.need = [];
        for(let costItemID = 0; costItemID < this.preneed.length; costItemID++) {
            let costItem = this.preneed[costItemID];
            let existing = getNumberOfItems(c.allInvs[this.id], costItem.id);
            if (existing >= costItem.n) {
                this.need.push(costItem);
            } else {
                this.need.unshift(costItem);
            }
        }


        let tempInv = new Inventory();
        tempInv.stack = JSON.parse(JSON.stringify(this.stack));
        tempInv.packsize = JSON.parse(JSON.stringify(this.packsize));
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
                    if (this.stack.OUTPUT[0].n < this.itemsize) {
                        invThis.stack.OUTPUT[0].n++;
                        invThis.remItems(resName[invThis.prod].cost);
                        invThis.lastTime = performance.now();
                    }
                }
            }
        }
    }

    draw(ctx, ent) {
        let db = c.resDB.assembling_machine_1;
        ctx.drawImage(db.anim, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize);
    }

    getStackName(type) {
        return c.resName[type].name;
    }
}
db = c.resDB.assembling_machine_1;
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
    c.resDB.inserter_burner.id
];
db.mach = AssemblingMachine1;
if (exports == undefined) var exports = {};
exports.AssemblingMachine1 = AssemblingMachine1;