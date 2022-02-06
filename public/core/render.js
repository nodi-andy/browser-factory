function render(){ 
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.resetTransform();
    context.scale(camera.zoom, camera.zoom);
    context.translate(camera.x, camera.y); //console.log(camera);


    if (game.map) {
        let minTile = worldToTile(screenToWorld({x: 0, y: 0}));
        let maxTile = worldToTile(screenToWorld({x: context.canvas.width, y: context.canvas.height}));
        for(let ax = minTile.x; ax < Math.min(maxTile.x + 1, gridSize.x); ax++) {
            for(let ay = minTile.y; ay < Math.min(maxTile.y + 1, gridSize.y); ay++) {
                let tile = game.map[ax][ay];

                // MAP
                context.beginPath();
                let type = tile[layers.terrain][0];
                let variant = tile[layers.terrain][1];
/*                context.fillStyle = mapType[type];//"black";
                context.rect(ax * tileSize, ay * tileSize, tileSize+1, tileSize+1);
                context.fill();*/
                context.drawImage(resName[type].img, variant * 64, 0, tileSize, tileSize, ax * tileSize, ay * tileSize, tileSize, tileSize)

                // PLAYER
                if (ax-2 == Math.floor(c.player1.pos.x / tileSize) && ay-2 == Math.floor(c.player1.pos.y / tileSize)) {
                    context.drawImage(resDB.player.img, c.player1.ss.x * 96, c.player1.ss.y * 132, 96, 132, c.player1.pos.x, c.player1.pos.y, 96, 132)
                }
                /*context.fillStyle = "#03A062";
                context.font = "16px Arial";
                context.fillText(tile[layers.terrain], ax * tileSize, ay * tileSize);*/
    
                // RESOURCES
                type = tile[layers.res].id;
                let n = tile[layers.res].n;
                //if (n < 8) context.font = n * 4+ "px Arial";
                //context.fillStyle = mapType[type];
                //if (resName[type].emo && n) context.fillText(resName[type].emo, ax*tileSize, ay*tileSize + 8);
                if (type && resName[type].img && n) {
                    context.drawImage(resName[type].img, Math.min(Math.floor(n / 200), 7) * 64, 2, 60, 60, ax * tileSize, ay * tileSize, 64, 64)
                }

                // ENTITY
                let entID = tile[layers.buildings];
                var b;
                if (entID != undefined) {
                    b = allEnts[entID];
                    context.save();
                    if (b && b.type && resName[b.type].img) {
                        context.translate((ax + 0.5) * tileSize, (ay + 0.5) *tileSize);
                        context.rotate(b.dir * Math.PI/2);
                        context.translate(-tileSize / 2, -tileSize / 2);
                        context.drawImage(resName[b.type].img, 0, 0)
                    }
                    context.restore();
                }
            }
        }


        for(let ax = 0; ax < game.map.length; ax++) {
            for(let ay = 0; ay < game.map[ax].length; ay++) {
            let tile = game.map[ax][ay];
            let entID = tile[layers.buildings];
            var b, dirV;
            if (entID != undefined) b = allEnts[entID];
            if (b) {
                    dirV = dirToVec[b.dir];
                    // ITEMS
                    let itemID = tile[layers.inv];
                    if (itemID != undefined && allInvs[itemID]) {
                        let packs = allInvs[itemID].packs;
                        context.save();
                        let dx = ax + 0.3 + (0.0 * Math.abs(dirV.y)) - (0.25 * dirV.x) ;
                        let dy = ay + 0.3 * Math.abs(dirV.x) - 0.25 * dirV.y;

                        context.translate(dx * tileSize, dy * tileSize);
                        context.scale(0.5, 0.5);

                        for (let iitem = 0; iitem < packs.length; iitem++) {
                            let item = packs[iitem];
                            if (item.id != undefined) {
                                context.drawImage(resName[item.id].img, 0, 0)
                            }
                            context.translate(tileSize * 0.5 * dirV.x, tileSize * 0.5 * dirV.y);
                        }
                        context.scale(2, 2);
                        context.restore();
                    }
                }
            }
        }
    }
    if (game && game.w) {
        game.w.forEach((v) => {
            context.beginPath();
            context.font = "10px Arial";
            context.fillText(resDB[v.type].emo, v.x - 1, v.y + 8);
            context.stroke();

        });
    }
    


    // ENTITY CANDIDATE
    if (pointerButton.item) {
        let type = pointerButton.item.id;
        if (type && resName[type].img) {
            context.save();
            if (resName[type].img) {
                context.translate((curResPos.x + 0.5) * tileSize, (curResPos.y + 0.5) *tileSize);
                context.rotate(buildDir * Math.PI/2);
                context.translate(-tileSize / 2, -tileSize / 2);
                context.drawImage(resName[type].img, 0, 0)
            }
            context.restore();
        }
    }

    if (curResPos && game.map) {
        let inv = game.map[curResPos.x][curResPos.y][layers.inv];
        let res = game.map[curResPos.x][curResPos.y][layers.res];
        context.font = "12px Arial";
        context.fillStyle = "white";
        context.fillText(curResPos.x + ", " + curResPos.y, curResPos.x * tileSize, curResPos.y * tileSize);
        if (inv != undefined && allInvs[inv]) context.fillText(JSON.stringify(allInvs[inv].packs, null, 1), curResPos.x * tileSize, curResPos.y * tileSize + 24);
        if (res != undefined) context.fillText(JSON.stringify(res, null, 1), curResPos.x * tileSize, curResPos.y * tileSize + 48);
        context.stroke();
    }



    // OVERLAY
    context.resetTransform();

    var xpos = beltMenu.pos.x;
    var ypos = beltMenu.pos.y;

    for (let i = 0; i < 11; i++) {
        let invObj = player1.inv[i];
        context.beginPath();
        context.fillStyle = "rgba(120, 120, 120, 0.9)";
        context.rect(xpos, ypos, tileSize, tileSize);
        context.fill();

        context.fillStyle = "black";
        context.font = "48px Arial";
        if (invObj) {
            context.fillText(Object.entries(resDB)[invObj.id][1].emo, xpos, ypos + 48);
            context.font = "24px Arial";
            context.fillText(invObj.n, xpos, ypos + 24);
            //menu.items.push(invObj.id);
        } 
        xpos +=tileSize;
    }        

    beltMenu.items.forEach(b => b.draw(context));

    if (invMenu.vis) {
        invMenu.items.forEach(b => b.draw(context));
    }
    if (buildMenu.vis) {
        buildMenu.items.forEach(b => b.draw(context));
    }


    requestAnimationFrame( render );
}