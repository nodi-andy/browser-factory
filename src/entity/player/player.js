if (typeof window === 'undefined') {
    var c = require('../../common.js');
    var invfuncs = require('../../core/inventory.js'); 
} 


class Player {
    constructor() {
        let db = c.resDB.player;
        db.mach = this;
        db.output = [
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
        if (ent.tilePos == undefined) ent.tilePos = {x: c.gridSize.x/2, y: c.gridSize.y/2};
        ent.pos = {x: ent.tilePos.x * c.tileSize, y: ent.tilePos.y * c.tileSize};
        ent.dir = {x: 0, y:0};
        ent.live = 100;
        ent.nextPos = {x: 0, y: 0};
        ent.type = c.resID.player;
        ent.movable = true;

        if (ent.invID == undefined) ent.invID = invfuncs.createInv();
        ent.inv = c.allInvs[ent.invID];
        
        ent.ss = {x:0, y:0};
        if (ent.inv.stack.INV == undefined) ent.inv.stack.INV = [];
        ent.inv.stacksize = 1;
        ent.inv.packsize = {};
        ent.inv.packsize.INV = 64;
        ent.inv.itemsize = 1000;
        ent.workInterval = undefined;
        ent.workProgress = 0;
        ent.miningProgress;

        /*playerEnt.inv.stack["INV"].push({id: c.resDB.stone.id, n: 100});
        playerEnt.inv.stack["INV"].push({id: c.resDB.iron.id, n: 100});
        playerEnt.inv.stack["INV"].push({id: c.resDB.copper.id, n: 100});
        playerEnt.inv.stack["INV"].push({id: c.resDB.raw_wood.id, n: 100});
        playerEnt.inv.stack["INV"].push({id: c.resDB.coal.id, n: 50});
        playerEnt.inv.stack["INV"].push({id: c.resDB.coal.id, n: 50});
        playerEnt.inv.stack["INV"].push({id: c.resDB.coal.id, n: 50});
        playerEnt.inv.stack["INV"].push({id: c.resDB.iron_plate.id, n: 170});
        playerEnt.inv.stack["INV"].push({id: c.resDB.belt1.id, n: 1000});*/
        
    }

    update(map, ent){
        ent.tilePos = worldToTile({x: ent.pos.x, y: ent.pos.y});
        while(this.checkCollision(ent.tilePos)) {
            ent.tilePos.x++;
            ent.pos = {x: ent.tilePos.x * c.tileSize, y: ent.tilePos.y * c.tileSize};
        }

        if (game.map == undefined) return;
        ent.unitdir = toUnitV(ent.dir);
        let entTile = worldToTile({x: ent.pos.x, y: ent.pos.y});

        ent.nextPos.x = ent.pos.x + 5 * ent.unitdir.x;
        let nextXTile = worldToTile({x: ent.nextPos.x, y: ent.pos.y});
        if (nextXTile.x > 0 && nextXTile.x < gridSize.x - 1 && this.checkCollision({x: nextXTile.x, y: entTile.y}) == false) ent.pos.x = ent.nextPos.x;

        ent.nextPos.y = ent.pos.y + 5 * ent.unitdir.y;
        let nextYTile = worldToTile({x: ent.pos.x, y: ent.nextPos.y});
        if (nextYTile.y > 0 && nextYTile.y < gridSize.y - 1 && this.checkCollision({x: entTile.x, y: nextYTile.y}) == false) ent.pos.y = ent.nextPos.y;



        if (ent.dir.x < 0) ent.ss.x--; else ent.ss.x++;
        
        if (ent.dir.y == -1 && ent.dir.x == -1) ent.ss.y = 5;
        if (ent.dir.y == -1 && ent.dir.x == 0)  ent.ss.y = 0;
        if (ent.dir.y == -1 && ent.dir.x == 1)  ent.ss.y = 1;
        if (ent.dir.y == 0 && ent.dir.x == -1)  ent.ss.y = 6;
        if (ent.dir.y == 0 && ent.dir.x == 1)   ent.ss.y = 2;
        if (ent.dir.y == 1 && ent.dir.x == -1)  ent.ss.y = 7;
        if (ent.dir.y == 1 && ent.dir.x == 0)   ent.ss.y = 4; 
        if (ent.dir.y == 1 && ent.dir.x == 1)   ent.ss.y = 3;
        
        ent.ss.x += 30;
        ent.ss.x %= 30;
        if (ent.dir.x == 0 && ent.dir.y == 0) ent.ss.x = 5;

        if (ent.pos && ent.id == c.playerID) {
            let myMid = {}
            myMid.x = ent.pos.x;
            myMid.y = ent.pos.y - 66;
            view.setCamOn(myMid);
            if (ent.dir.x != 0 || ent.dir.y != 0) {
                ent.needUpdate = true;
            } else {
                ws.send(JSON.stringify({cmd: "updateEntity", data: {id: c.playerID, ent: c.allEnts[c.playerID]}}));
                ent.needUpdate = false;
            }
            if (ent.needUpdate) ws.send(JSON.stringify({cmd: "updateEntity", data: {id: c.playerID, ent: c.allEnts[c.playerID]}}));

        }

        //console.log(ent.pos, entTile);
    }

    setDir(dir) {
        if (dir.y) c.allEnts[c.playerID].dir.y = dir.y;
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

    startMining(tileCoordinate, ent) {
        this.workInterval = setInterval(function() { 
            let res = game.map[tileCoordinate.x][tileCoordinate.y][layers.res];
            mineToInv({source: tileCoordinate, id:res.id, n: 1});
        }, 1000);
        this.miningProgress = setInterval(function() { ent.workProgress += 10; ent.workProgress %= 100}, 100);
    }

    stopMining(ent) {
        clearInterval(this.workInterval);
        clearInterval(this.miningProgress);
        ent.workProgress = 0;
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

    draw(ctx, ent) {
        ctx.save();
        ctx.translate(ent.pos.x, ent.pos.y);
        ctx.drawImage(c.resDB.player.img, ent.ss.x * 96, ent.ss.y * 132, 96, 132, - 48, -100, 96, 132)
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.fillRect(-25,-120, 50, 10);
        ctx.fillStyle = "green";
        ctx.fillRect(-25,-120, (ent.live / 100) * 50, 10);
        ctx.fillStyle = "yellow";
        ctx.fillRect(-25,-130, (ent.workProgress / 100) * 50, 10);
        ctx.restore();
    }
}


if (exports == undefined) var exports = {};
exports.Player = Player;