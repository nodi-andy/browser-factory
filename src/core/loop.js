// LOOP
function gameLoop(){

    if (c.gameState == 0) {
        setTimeout(gameLoop, 20);
        return;
    }

    if(c.gameState == 2) {
        c.game.stopped();
        return;
    }

    // SETUP
    /*
    if (c.game.tick == 0) {
        for(let ient = 0; ient < c.allInvs.length; ient++) {
            let entity = c.allInvs[ient];
            if (entity?.setup) entity.setup(c.game.map, entity);
            else c.resName[entity?.type]?.mach?.setup(c.game.map, entity);
        }
    }
    */
    // Game tick increment
    c.game.tick++;

    // Autosave
    if (c.game.tick % 1000 == 0) saveGame();

    // belts excluded
    let belts = [];
    for(let ient = 0; ient < c.allInvs.length; ient++) {
        let entity = c.allInvs[ient];
        if (!entity) continue;
        if(entity?.type == c.resDB.belt1.id) 
        {
            entity.done = false;
            entity.searching = false;
            belts.push(entity);
        } else {
            if( entity.update) {
                entity.update(c.game.map, entity);
            } else entity.draw(context);
        }
    }

    // BELTS SYSTEM
    c.decidingMoving = ((c.game.tick + 0) % 8 == 0);
    c.movingParts = ((c.game.tick + 1) % 8 == 0);

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
            belt.update(c.game.map, belt);
        }
    }

    setTimeout(gameLoop, 20);
}