function render(){ 
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.resetTransform();
    context.scale(camera.zoom, camera.zoom);
    //console.log(camera);
    context.translate(camera.x, camera.y);

    if (city.map) {
        for(let ax = 0; ax < city.map.length; ax++) {
            for(let ay = 0; ay < city.map[ax].length; ay++) {
                let tile = city.map[ax][ay];

                // MAP
                context.beginPath();
                let type = tile[layers.terrain];
                context.fillStyle = mapType[type];
                context.rect(ax*10, ay*10, 11, 11);
                context.fill();

                // RESOURCES
                context.font = "8px Arial";
                type = tile[layers.res].id;
                let n = tile[layers.res].n;
                if (n < 8) context.font = n + "px Arial";
                context.fillStyle = mapType[type];
                if (resName[type].emo) context.fillText(resName[type].emo, ax*10, ay*10 + 8);

                // BUILDING
                context.font = "8px Arial";
                let entID = tile[layers.buildings];
                if (entID != undefined) {
                    let b = allEnts[entID];
                    if (resName[b.type].emo) context.fillText(resName[b.type].emo, ax*10, ay*10 + 8);
                    if (resName[b.type].svg) {
                        context.translate(ax*10, ay*10);
                        context.scale(0.5, 0.5);
                        v = canvg.Canvg.fromString(context, resName[b.type].svg);
                        v.documentElement.renderChildren(context);
                        context.scale(2, 2);
                        context.translate(-ax*10, -ay*10);
                    }
                }

                // ITEMS
                context.font = "8px Arial";
                let itemID = tile[layers.items];
                if (itemID) {
                    let iForEach = 0;
                    context.font = "4px Arial";
                    let items = allInvs[itemID].items;
                    items.forEach(item => {
                        context.fillText(resName[item.id].emo, ax*10 + (iForEach%2) * 5, ay * 10 + 4 + Math.floor(iForEach/2)*5); iForEach++;
                    });
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
    context.font = "16px Arial";
    context.fillText("🚶", player1.pos.x-6, player1.pos.y);
    context.stroke();

    // BUILDING CANDIDATE
    if (pointerButton) {
        context.font = "8px Arial";
        context.fillStyle = "black";
        let type = pointerButton.id;
        if (resName[type].emo)         context.fillText(resName[pointerButton.id].emo, curResPos.x * tileSize, curResPos.y * tileSize + 8);
        else if (resName[type].svg) {
            context.translate(curResPos.x * tileSize, curResPos.y * tileSize);
            context.scale(0.5, 0.5);
            v = canvg.Canvg.fromString(context, resName[type].svg);
            v.documentElement.renderChildren(context);
            context.scale(2, 2);
            context.translate(-curResPos.x * tileSize, -curResPos.y * tileSize);
        }
    }
    context.stroke();



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