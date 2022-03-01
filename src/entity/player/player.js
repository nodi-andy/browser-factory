if (typeof window === 'undefined') {
    var c = require('../../common.js');
    var invfuncs = require('../../core/inventory.js'); 
} 


class Player {
    constructor() {
       c.resDB.player.mach = this;
       c.resDB.player.output = [
           c.resDB.wood,
           c.resDB.wooden_stick,
           c.resDB.sharp_stone,
           c.resDB.iron_stick,
           c.resDB.gear,
           c.resDB.hydraulic_piston,
           c.resDB.copper_cable,
           c.resDB.circuit,
           c.resDB.stone_axe,
           c.resDB.iron_axe,
           c.resDB.gun,
           c.resDB.rocket_launcher,
           c.resDB.bullet,
           c.resDB.rocket,
           c.resDB.weak_armor,
           c.resDB.strong_armor,
           c.resDB.chest,
           c.resDB.iron_chest,
           c.resDB.stone_furnace,
           c.resDB.burner_miner,
           c.resDB.electrical_miner,
           c.resDB.belt1,
           c.resDB.belt2,
           c.resDB.belt3,
           c.resDB.inserter_burner,
           c.resDB.inserter_short,
           c.resDB.inserter,
           c.resDB.inserter_long,
           c.resDB.inserter_smart,
           c.resDB.assembling_machine_1,
           c.resDB.assembling_machine_2,
           c.resDB.assembling_machine_3,
           c.resDB.assembling_machine_4,
           c.resDB.pump,
           c.resDB.pipe,
           c.resDB.boiler,
           c.resDB.generator,
           c.resDB.e_pole,
           c.resDB.locomotive,
           c.resDB.rail,
           c.resDB.rail_curved,
           c.resDB.asfalt,
           c.resDB.turret,
           c.resDB.laser_turret,
           c.resDB.car]
    }

    setup(map, ent){
        this.tilePos = {x: c.gridSize.x/2, y: c.gridSize.y/2};

        this.pos = {x: this.tilePos.x * c.tileSize, y: this.tilePos.y * c.tileSize};
        this.dir = {x: 0, y:0};
        this.live = 100;
        this.nextPos = {x: 400, y: 400};
        this.type = c.resID.player;

        //if (c.allInvs.length == 0)
        this.invID = 0; //invfuncs.createInv();
        this.inv = c.allInvs[this.invID];
        if (this.inv == undefined) this.inv = c.allInvs[invfuncs.createInv()];
        
        this.ss = {x:0, y:0};
        if (this.inv.stack.INV == undefined) this.inv.stack.INV = [];
        this.inv.stacksize = 1;
        this.inv.packsize = {};
        this.inv.packsize.INV = 64;
        this.workInterval = undefined;
        this.workProgress = 0;
        this.miningProgress;
    }

    update(map, ent){
        this.tilePos = worldToTile({x: this.pos.x, y: this.pos.y});
        while(this.checkCollision(this.tilePos)) {
            this.tilePos.x++;
            this.pos = {x: this.tilePos.x * c.tileSize, y: this.tilePos.y * c.tileSize};
        }
    }

    checkCollision(pos) {
        if (c.game.map == undefined) return;
        let terrain = c.game.map[pos.x][pos.y][layers.terrain][0];
        let building = c.game.map[pos.x][pos.y][layers.buildings];
        let canWalkOn = true;
        if (building) {
            canWalkOn = false;
            if(resName[c.allEnts[building].type].playerCanWalkOn) canWalkOn  = building.playerCanWalkOn;
        }
         
        return (terrain == resID.deepwater || terrain == resID.water || terrain == resID.hills || canWalkOn == false)
    }

    loop() {
        if (game.map == undefined) return;
        this.unitdir = toUnitV(this.dir);
        let thisTile = worldToTile({x: this.pos.x, y: this.pos.y});

        this.nextPos.x = this.pos.x + 5 * this.unitdir.x;
        let nextXTile = worldToTile({x: this.nextPos.x, y: this.pos.y});
        if (nextXTile.x > 0 && nextXTile.x < gridSize.x - 1 && this.checkCollision({x: nextXTile.x, y: thisTile.y}) == false) this.pos.x = this.nextPos.x;

        this.nextPos.y = this.pos.y + 5 * this.unitdir.y;
        let nextYTile = worldToTile({x: this.pos.x, y: this.nextPos.y});
        if (nextYTile.y > 0 && nextYTile.y < gridSize.y - 1 && this.checkCollision({x: thisTile.x, y: nextYTile.y}) == false) this.pos.y = this.nextPos.y;



        if (this.dir.x < 0) this.ss.x--; else this.ss.x++;
        
        if (this.dir.y == -1 && this.dir.x == -1) this.ss.y = 5;
        if (this.dir.y == -1 && this.dir.x == 0)  this.ss.y = 0;
        if (this.dir.y == -1 && this.dir.x == 1)  this.ss.y = 1;
        if (this.dir.y == 0 && this.dir.x == -1)  this.ss.y = 6;
        if (this.dir.y == 0 && this.dir.x == 1)   this.ss.y = 2;
        if (this.dir.y == 1 && this.dir.x == -1)  this.ss.y = 7;
        if (this.dir.y == 1 && this.dir.x == 0)   this.ss.y = 4; 
        if (this.dir.y == 1 && this.dir.x == 1)   this.ss.y = 3;
        
        this.ss.x += 30;
        this.ss.x %= 30;
        if (this.dir.x == 0 && this.dir.y == 0) this.ss.x = 5;

        if (this.pos) {
            let myMid = {}
            myMid.x = this.pos.x;
            myMid.y = this.pos.y - 66;
            view.setCamOn(myMid);
        }

        //console.log(this.pos, thisTile);
    }

    startMining(tileCoordinate) {
        this.workInterval = setInterval(function() { 
            let res = game.map[tileCoordinate.x][tileCoordinate.y][layers.res];
            mineToInv({source: tileCoordinate, id:res.id, n: 1});
        }, 1000);
        var player = this;
        this.miningProgress = setInterval(function() { player.workProgress += 10; player.workProgress %= 100}, 100);
    }

    stopMining() {
        clearInterval(this.workInterval);
        clearInterval(this.miningProgress);
        this.workProgress = 0;
    }

    setInventory(newInv, newID){
        c.allInvs[this.invID].stack = JSON.parse(JSON.stringify(newInv.stack));;
        c.allInvs[this.invID].packsize = newInv.packsize;
        c.allInvs[this.invID].itemsize = newInv.itemsize;
        
        let currentID = c.allInvs[this.invID].id;
        if (newInv.id != undefined) { this.invID = newInv.id; c.allInvs[this.invID].id = newID; }
        else if (newID != undefined) { this.invID = newID; c.allInvs[this.invID].id = newID; }

        if(c.allInvs[this.invID].id == undefined) c.allInvs[this.invID].id = currentID;
        this.inv = c.allInvs[this.invID];
        if (typeof window !== "undefined") view.updateInventoryMenu(this.inv);
    }

    setInventoryID(newID) {
        this.invID = newID;
        this.inv = c.allInvs[this.invID];
        if (typeof window !== "undefined") view.updateInventoryMenu(this.inv);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.drawImage(c.resDB.player.img, this.ss.x * 96, this.ss.y * 132, 96, 132, - 48, -100, 96, 132)
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.fillRect(-25,-120, 50, 10);
        ctx.fillStyle = "green";
        ctx.fillRect(-25,-120, (this.live / 100) * 50, 10);
        ctx.fillStyle = "yellow";
        ctx.fillRect(-25,-130, (this.workProgress / 100) * 50, 10);
        ctx.restore();
    }
}


if (exports == undefined) var exports = {};
exports.Player = Player;