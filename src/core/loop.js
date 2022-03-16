// LOOP
function gameLoop(){

    if (c.game.imgsLoaded == false || c.gameState == 0) {
         setTimeout(gameLoop, 20);
         return;
    }

    if(c.gameState == 2) {
        c.game.stopped();
        return;
    }
    if (c.game.tick == 0) {
        // SETUP
        for(let ient = 0; ient < c.allInvs.length; ient++) {
            let entity = c.allInvs[ient];
            c.resName[entity?.type]?.mach?.setup(c.game.map, entity);
        }
    }

    c.game.tick++;

    if (c.game.tick % 1000 == 0) saveGame();

    // belts excluded
    for(let ient = 0; ient < c.allInvs.length; ient++) {
        let entity = c.allInvs[ient];
        if (!entity) continue;
        if(entity?.type == c.resDB.belt1.id) continue;
        if(c.resName[entity.type]?.mach) {
            c.resName[entity.type].mach.update(c.game.map, entity);
        }
    }
    // Get all BELTs
    let belts = [];
    for(let ient = 0; ient < c.allInvs.length; ient++) {
        let entity = c.allInvs[ient];
        if (entity?.type == c.resDB.belt1.id) belts.push(entity);
    }

    for(let ibelt = 0; ibelt < belts.length;) {
        let belt = belts[ibelt];
        if (belt.done) ibelt++
        else {
            // go forward until the first belt
            while(belt) {
                let x = belt.pos.x;
                let y = belt.pos.y;

                let nbPos = c.dirToVec[belt.dir];
                let nbTile = c.game.map[x + nbPos.x][y + nbPos.y];
                let nbEntity = c.allInvs[nbTile[c.layers.inv]];
                if (nbEntity?.type == c.resDB.belt1.id && // is it a belt?
                    nbEntity.done == false &&  // already processed?
                    (nbEntity.searching == false || nbEntity.searching == undefined) &&  // circular network?
                    Math.abs(belt.dir - nbEntity.dir)!=2) // not heading to current belt
                {
                    belt.searching = true;
                    belt = nbEntity;
                } else break;
            }
            c.resDB.belt1.mach.update(c.game.map, belt, true);
        }
    }

    for(let ibelt = 0; ibelt < belts.length; ibelt++) {
        belts[ibelt].done = false;
        belts[ibelt].searching = false;
    }

    /*if (c.game.tick % 100 == 0) {
        ws.send(JSON.stringify({cmd: "updatePlayer", data: c.allInvs[c.playerID]}));
    }*/

    setTimeout(gameLoop, 20);
}