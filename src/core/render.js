const times = [];
let fps;

function render(){
    let ctx = context;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.resetTransform();
    context.scale(view.camera.zoom, view.camera.zoom);
    context.translate(view.camera.x, view.camera.y); //console.log(camera);
    context.drawImage(canvas.offScreenCanvas,0,0);

    if (c.game.map) {

        // ENTITIES AND PLAYER

        c.allInvs.forEach(e => {if (e) e.drawn = false;});

        let minTile = view.screenToTile({x: 0, y: 0});
        let maxTile = view.screenToTile({x: context.canvas.width, y: context.canvas.height});
        for(let ay = minTile.y; ay < Math.min(maxTile.y + 5, gridSize.y); ay++) {
            for(let ax = minTile.x; ax < Math.min(maxTile.x + 2, gridSize.x); ax++) {
                let tile = c.game.map[ax][ay];

                // ENTITIES
                let invID = tile[layers.inv];
                let b;
                if (invID != undefined) {
                    b = c.allInvs[invID];
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
                    context.drawImage(resName[type].img, Math.min(Math.floor(n / 100), 6) * 64, 2, 60, 60, ax * tileSize, ay * tileSize, 64, 64)
                }

                // ENTITY GROUNDS
                context.save();
                context.translate(ax * tileSize, ay *tileSize);

                if (b?.type && resName[b.type]?.img && b.drawn == false) {
                    let type = resName[b.type];
                    if (type && type.size) {
                        context.translate(type.size[0] / 2 * tileSize, type.size[1] / 2 * tileSize);
                        if (resName[b.type].rotatable != false) context.rotate(b.dir * Math.PI/2);
                        context.translate(-type.size[0] / 2 * tileSize, -type.size[1] / 2 * tileSize);
                    }
                    
                    if (resName[b.type]?.mach?.draw) resName[b.type].mach.draw(context, b);
                    else context.drawImage(resName[b.type].img, 0, 0);
                    b.drawn = true;

                } else {  // ITEMS ON GROUND
                  
                    let itemID = tile[layers.inv];
                    if (itemID != undefined && c.allInvs[itemID]) {
                        let packs = c.allInvs[itemID].stack.INV;
                        if (packs) {
                            context.scale(0.5, 0.5);

                            for (let iitem = 0; iitem < packs.length; iitem++) {
                                let item = packs[iitem];
                                if (item.id != undefined) {
                                    context.drawImage(resName[item.id].img, 0, 0)
                                    if (iitem != 1) {
                                      context.translate(1.0 * tileSize, 0.0 * tileSize);
                                    } else {
                                      context.translate(-1.0 * tileSize, 1 * tileSize);
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

        // ITEMS
        for(let ax = minTile.x; ax < Math.min(maxTile.x + 2, gridSize.x); ax++) {
            for(let ay = minTile.y; ay < Math.min(maxTile.y + 5, gridSize.y); ay++) {
                let tile = c.game.map[ax][ay];
                let b;
                if (tile[layers.inv] != undefined) {
                    b = c.allInvs[tile[layers.inv]];
                }
                if (b?.type && resName[b.type] && resName[b.type]?.mach?.drawItems) {
                    // Build a tree for the belts
                    //if (b.type == c.resDB.belt1.id) continue;
                    context.save();
                    context.translate((ax + 0.5) * tileSize, (ay + 0.5) *tileSize);
                        context.rotate(b.dir * Math.PI/2);
                    context.translate(-tileSize / 2, -tileSize / 2);
                    resName[b.type].mach.drawItems(context, b);
                    context.restore();
                }
                
                // PLAYERS
                for(let ient = 0; c.allMovableEntities && ient <  c.allMovableEntities.length; ient++) {
                    let entity = c.allInvs[c.allMovableEntities[ient]];
                    if (entity.pos && ax-2 == entity.tilePos.x && ay-2 == entity.tilePos.y) {
                        c.player.draw(context, entity);
                    }
                }
            }
        }


        
    }
    
    // ENTITY CANDIDATE
    if (c.pointer?.item && c.pointer.overlay == false) {
        let item = resName[c.pointer.item.id];
        if (item) {
            let size = item.size;
            if (size == undefined) size = [1, 1];
            context.save();

            context.translate(curResPos.x * tileSize, curResPos.y * tileSize);

            context.translate(size[0] / 2 * tileSize, size[1] / 2 * tileSize);
            if (item.type == "entity" && item.rotatable != false) context.rotate(buildDir * Math.PI/2);
            context.translate(-size[0] / 2 * tileSize, -size[1] / 2 * tileSize);

            if (item.mach?.draw) item.mach.draw(context, c.pointer.item);
            else context.drawImage(item.img, 0, 0);
            context.restore();
        }
    }

    // OVERLAY
    context.resetTransform();
    receiptMenu.item = undefined;

    // INVENTORY MENU
    if (invMenu.vis) {
        invMenu.items.forEach(b => b.draw(context));
    }

    // CRAFTING/ENTITY/SELECT ITEM MENU
    drawSelectItemMenu(context);
    
    // RECEIPT MENU
    drawReceiptMenu(context);

    // CONTENT MENU
    drawContentMenu(context);
    
    // POINTER ITEM
    if (c.pointer?.item && c.pointer.overlay) {
        let item = c.pointer.item?.id;
        if (item) {
            context.save();
            context.translate(mousePos.x, mousePos.y);
            if (item.type == "entity" && item.rotatable != false) context.rotate(buildDir * Math.PI/2);
            context.translate(-tileSize / 2, -tileSize / 2);
            if (resName[item]?.mach?.draw) resName[item].mach.draw(context, c.pointer.item);
            else {
                context.drawImage(resName[item].img, 0, 0);
                if (c.pointer.item.n!= undefined) {
                    ctx.font = "24px Arial";
                    ctx.fillStyle = "white";
                    ctx.fillText(c.pointer.item.n, 0, 0 + buttonSize);
                }
            } 
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

function updateOffscreenMap() {
    if (c.game.map == undefined) return;
    canvas.offScreenCanvas.width = gridSize.x * tileSize;
    canvas.offScreenCanvas.height = gridSize.y * tileSize;
    var offScreencontext = canvas.offScreenCanvas.getContext("2d");
    let hadError = false;

    for(let ax = 0; ax < gridSize.x; ax++) {
        for(let ay = 0; ay < gridSize.y; ay++) {
            let tile = c.game.map[ax][ay];

            // MAP
            let type = tile[layers.terrain][0];
            let variant = tile[layers.terrain][1];
            if (resName[type]?.img?.complete) {
                offScreencontext.drawImage(resName[type].img, variant * 64, 0, tileSize, tileSize, ax * tileSize, ay * tileSize, tileSize, tileSize)
            } else {
                if (hadError == false) {
                    hadError = true;
                    setTimeout(updateOffscreenMap, 1000);
                }
            }
        }
    }

}