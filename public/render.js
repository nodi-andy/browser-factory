function render(){ 
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.resetTransform();
    context.scale(camera.zoom, camera.zoom);
    context.translate(camera.x, camera.y); //console.log(camera);


    if (city.map) {
        for(let ax = 0; ax < city.map.length; ax++) {
            for(let ay = 0; ay < city.map[ax].length; ay++) {
                let tile = city.map[ax][ay];

                // MAP
                context.beginPath();
                let type = tile[layers.terrain];
                context.fillStyle = "black";//mapType[type];
                context.rect(ax * tileSize, ay * tileSize, tileSize+1, tileSize+1);
                context.fill();

                // RESOURCES
                //context.font = "50px Arial";
                type = tile[layers.res].id;
                let n = tile[layers.res].n;
                //if (n < 8) context.font = n * 4+ "px Arial";
                //context.fillStyle = mapType[type];
                //if (resName[type].emo && n) context.fillText(resName[type].emo, ax*tileSize, ay*tileSize + 8);
                if (resName[type].img) {
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
                if (itemID) {
                    let iForEach = 0;
                    let items = allInvs[itemID].items;
                    context.save();
                    items.forEach(item => {
                        let dx = iForEach * 5;
                        iForEach++;
                        context.translate((ax + 0.5 + dx) * tileSize, (ay + 0.5) *tileSize);
                        if (b) context.rotate(b.dir * Math.PI/2);
                        context.translate(-tileSize / 2, -tileSize / 2);
                        context.scale(0.5, 0.5);
                        context.drawImage(resName[item.id].img, 0, 0)
                        context.scale(2, 2);
                    });
                    context.restore();
                }
            }
        }
    }
    if (city && city.w) {
        city.w.forEach((v) => {
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
    if (pointerButton) {
        let type = pointerButton.id;
        if (resName[type].img) {
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

    if (curResPos && city.map) {
        let inv = city.map[curResPos.x][curResPos.y][layers.inv];
        context.fillStyle = "white";
        if (inv) context.fillText(JSON.stringify(allInvs[inv].items), curResPos.x * tileSize, curResPos.y * tileSize);
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
        context.rect(xpos, ypos, 60, 60);
        context.fill();

        context.fillStyle = "black";
        context.font = "48px Arial";
        if (invObj) {
            context.fillText(Object.entries(resDB)[invObj.id][1].emo, xpos, ypos + 48);
            context.font = "24px Arial";
            context.fillText(invObj.n, xpos, ypos + 24);
            //menu.items.push(invObj.id);
        } 
        xpos +=60;
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