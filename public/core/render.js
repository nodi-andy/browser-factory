function render(){ 
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.resetTransform();
    context.scale(camera.zoom, camera.zoom);
    context.translate(camera.x, camera.y); //console.log(camera);


    if (game.map) {
        for(let ax = 0; ax < game.map.length; ax++) {
            for(let ay = 0; ay < game.map[ax].length; ay++) {
                let tile = game.map[ax][ay];

                // MAP
                context.beginPath();
                let type = tile[layers.terrain];
                context.fillStyle = mapType[type];//"black";//mapType[type];
                context.rect(ax * tileSize, ay * tileSize, tileSize+1, tileSize+1);
                context.fill();

                // RESOURCES
                //context.font = "50px Arial";
                type = tile[layers.res].id;
                let n = tile[layers.res].n;
                //if (n < 8) context.font = n * 4+ "px Arial";
                //context.fillStyle = mapType[type];
                //if (resName[type].emo && n) context.fillText(resName[type].emo, ax*tileSize, ay*tileSize + 8);
                if (type && resName[type].img) {
                    context.drawImage(resName[type].img, ax * tileSize, ay * tileSize)
                }

                // BUILDING
                let entID = tile[layers.buildings];
                var b;
                if (entID != undefined) {
                    b = allEnts[entID];
                    context.save();
                    if (resName[b.type].img) {
                        context.translate((ax + 0.5) * tileSize, (ay + 0.5) *tileSize);
                        context.rotate(b.dir * Math.PI/2);
                        context.translate(-tileSize / 2, -tileSize / 2);
                        context.drawImage(resName[b.type].img, 0, 0)
                    }
                    context.restore();
            }

                // ITEMS
                let itemID = tile[layers.inv];
                if (itemID != undefined) {
                    let iForEach = 0;
                    let items = allInvs[itemID].packs;
                    context.save();
                    context.translate(ax * tileSize, (ay + 0.25) * tileSize);
                    items.forEach(item => {
                        context.translate( iForEach / 8 * tileSize, 0);
                        context.scale(0.5, 0.5);
                        context.drawImage(resName[item.id].img, 0, 0)
                        context.scale(2, 2);
                        iForEach++;
                    });
                    context.restore();
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
    
    // PLAYER
    context.beginPath();
    context.font = "40px Arial";
    context.fillText("🚶", player1.pos.x-6, player1.pos.y);
    context.stroke();

    // BUILDING CANDIDATE
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
        context.font = "12px Arial";
        context.fillStyle = "white";
        context.fillText(curResPos.x + ", " + curResPos.y, curResPos.x * tileSize, curResPos.y * tileSize);
        if (inv != undefined) context.fillText(JSON.stringify(allInvs[inv].packs, null, 1), curResPos.x * tileSize, curResPos.y * tileSize + 24);
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