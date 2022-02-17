const times = [];
let fps;

function render(){
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.resetTransform();
    context.scale(camera.zoom, camera.zoom);
    context.translate(camera.x, camera.y); //console.log(camera);
    context.drawImage(canvas.offScreenCanvas,0,0);

    if (game.map) {

        // ENTITIES AND PLAYER

        let minTile = worldToTile(screenToWorld({x: 0, y: 0}));
        let maxTile = worldToTile(screenToWorld({x: context.canvas.width, y: context.canvas.height}));
        for(let ax = minTile.x; ax < Math.min(maxTile.x + 2, gridSize.x); ax++) {
            for(let ay = minTile.y; ay < Math.min(maxTile.y + 5, gridSize.y); ay++) {
                let tile = game.map[ax][ay];

                // PLAYER
                if (ax-2 == Math.floor(c.player1.pos.x / tileSize) && ay-2 == Math.floor(c.player1.pos.y / tileSize)) {
                    c.player1.draw(context);
                }
                // context.fillStyle = "#03A062";
                // context.font = "16px Arial";
                // context.fillText(tile[layers.terrain], ax * tileSize, ay * tileSize);
    
                // RESOURCES
                type = tile[layers.res].id;
                let n = tile[layers.res].n;
                //if (n < 8) context.font = n * 4+ "px Arial";
                //context.fillStyle = mapType[type];
                //if (resName[type].emo && n) context.fillText(resName[type].emo, ax*tileSize, ay*tileSize + 8);
                if (type && resName[type].img && n) {
                    context.drawImage(resName[type].img, Math.min(Math.floor(n / 100), 7) * 64, 2, 60, 60, ax * tileSize, ay * tileSize, 64, 64)
                }

                // ENTITY
                let entID = tile[layers.buildings];
                let b;
                if (entID != undefined) {
                    b = c.allEnts[entID];
                }
                context.save();
                context.translate((ax + 0.5) * tileSize, (ay + 0.5) *tileSize);

                if (b && b.type && resName[b.type].img) {
                    context.rotate(b.dir * Math.PI/2);
                    context.translate(-tileSize / 2, -tileSize / 2);
                    if (resName[b.type].mach) resName[b.type].mach.draw(context, b);
                    else context.drawImage(resName[b.type].img, 0, 0);
                } else {  // ITEMS ON GROUND
                  
                    let itemID = tile[layers.inv];
                    if (itemID != undefined && c.allInvs[itemID]) {
                        let packs = c.allInvs[itemID].stack.INV;
                        if (packs) {
                            context.scale(0.5, 0.5);

                            context.translate(-1 * tileSize, -0.0 * tileSize);
                            for (let iitem = 0; iitem < packs.length; iitem++) {
                                let item = packs[iitem];
                                if (item.id != undefined) {
                                    context.drawImage(resName[item.id].img, 0, 0)
                                    if (iitem != 1) {
                                      context.translate(1.0 * tileSize, 0.0 * tileSize);
                                    } else {
                                      context.translate(-1.0 * tileSize, -1 * tileSize);
                                    }
                                }
                            }
                            context.scale(2, 2);
                        }
                    }
                }
                context.restore();
            }
        }


        
    }
    
    // ENTITY CANDIDATE
    if (pointerButton && pointerButton.overlay == false) {
        let type = pointerButton.item.id;
        if (pointerButton.item.id) {
            context.save();
            context.translate((curResPos.x + 0.5) * tileSize, (curResPos.y + 0.5) *tileSize);
            context.rotate(buildDir * Math.PI/2);
            context.translate(-tileSize / 2, -tileSize / 2);
            if (resName[type].mach) resName[type].mach.draw(context, pointerButton.item);
            else context.drawImage(resName[type].img, 0, 0);
            context.restore();
        }
    }

    // DEBUG
    if (curResPos && game.map) {
        let inv = game.map[curResPos.x][curResPos.y][layers.inv];
        let res = game.map[curResPos.x][curResPos.y][layers.res];
        context.font = "12px Arial";
        context.fillStyle = "white";
        context.fillText(curResPos.x + ", " + curResPos.y, curResPos.x * tileSize, curResPos.y * tileSize);
        if (inv != undefined && c.allInvs[inv]) context.fillText(JSON.stringify(c.allInvs[inv].stack, null, 1), curResPos.x * tileSize, curResPos.y * tileSize + 24);
        if (res != undefined) context.fillText(JSON.stringify(res, null, 1), curResPos.x * tileSize, curResPos.y * tileSize + 48);
        context.stroke();
    }



    // OVERLAY

    context.resetTransform();
    receiptMenu.item = undefined;

    beltMenu.items.forEach(b => b.draw(context));

    if (invMenu.vis) {
        invMenu.items.forEach(b => b.draw(context));
    }
    if (craftMenu.vis) {
        craftMenu.items.forEach(b => b.draw(context));
    }

    if (receiptMenu.item) {
        context.beginPath();
        context.fillStyle = "rgba(150, 150, 0, 0.95)";
        context.fillRect(receiptMenu.pos.x, receiptMenu.pos.y, receiptMenu.pos.w, receiptMenu.pos.h);
        context.font = "24px Arial";
        context.fillStyle = "black";
        context.fillText(resName[receiptMenu.item.id].name, receiptMenu.pos.x + 6, receiptMenu.pos.y + 24);
        let dy = 0;
        for(let costItem of resName[receiptMenu.item.id].cost) {
            context.fillRect(receiptMenu.pos.x + 6, receiptMenu.pos.y + 64 + dy, 32, 32)
            context.drawImage(costItem.res.img, receiptMenu.pos.x + 6, receiptMenu.pos.y + 64 + dy, 32, 32)
            let missingItems = "";
            if (receiptMenu.item.n == 0) {
                let existing = c.player1.inv.getNumberOfItems(costItem.res.id);
                if (existing < costItem.n) {
                    missingItems = existing + " / ";
                    context.fillStyle = "red";
                } else  context.fillStyle = "black";
            }
            else         context.fillStyle = "black";
            context.fillText(missingItems + costItem.n + "x " + costItem.res.name, receiptMenu.pos.x + 46, receiptMenu.pos.y + 84 + dy);
            dy += 64;
            receiptMenu.pos.h = dy + 100;
        }
    }

    if(c.selEntity) {
        let dy = 96;
        context.beginPath();
        context.fillStyle = "rgba(150, 150, 150, 0.95)";
        context.fillRect(entityMenu.pos.x , entityMenu.pos.y, entityMenu.w , entityMenu.h);
        context.font = "24px Arial";
        context.fillStyle = "black";
        context.fillText(resName[c.allEnts[c.selEntity.entID].type].name, entityMenu.pos.x + 16, entityMenu.pos.y + 32);
        let selInv = c.allInvs[c.selEntity.invID]//inventory.getInv(selPos.x, selPos.y);
        if (selInv && entityMenu.vis) {
            for(f in selInv.stack) {
                context.font = "24px Arial";
                context.fillStyle = "black";
                context.fillText(JSON.stringify(f).replaceAll('"', ''), craftMenu.pos.x + 16, craftMenu.pos.y + dy);
                if (entityMenu.buttons[f]) {
                    entityMenu.buttons[f].forEach(b => {b.draw(context)});
                    //c.buttons[f][1].draw(context);
                }
                dy += 64;
            }
        }
    }
    
    // MOVING RESOURCES
    if (pointerButton && pointerButton.overlay == true) {
        let type = pointerButton.item.id;
        if (pointerButton.item.id) {
            context.save();
            context.translate(mousePos.x, mousePos.y);
            context.rotate(buildDir * Math.PI/2);
            context.translate(-tileSize / 2, -tileSize / 2);
            if (resName[type].mach) resName[type].mach.draw(context, pointerButton);
            else context.drawImage(resName[type].img, 0, 0);
            context.restore();
        }
    }
    // FPS
    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }
    times.push(now);
    fps = times.length;
    context.fillStyle = "black";
    context.font = "48px Arial";
    context.fillText("FPS: " + fps, 0, 48);

    requestAnimationFrame( render );
}

function imgLoaded(imgElement) {
    return imgElement.complete && imgElement.naturalHeight !== 0;
}

function updateMap() {
    if (game.map == undefined) return;
    canvas.offScreenCanvas.width = gridSize.x * tileSize;
    canvas.offScreenCanvas.height = gridSize.y * tileSize;
    var offScreencontext = canvas.offScreenCanvas.getContext("2d");


    for(let ax = 0; ax < gridSize.x; ax++) {
        for(let ay = 0; ay < gridSize.y; ay++) {
            let tile = game.map[ax][ay];

            // MAP
            let type = tile[layers.terrain][0];
            let variant = tile[layers.terrain][1];
            offScreencontext.drawImage(resName[type].img, variant * 64, 0, tileSize, tileSize, ax * tileSize, ay * tileSize, tileSize, tileSize)
        }
    }

}