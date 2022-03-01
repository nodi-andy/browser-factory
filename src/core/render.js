const times = [];
let fps;

function render(){
    let ctx = context;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.resetTransform();
    context.scale(view.camera.zoom, view.camera.zoom);
    context.translate(view.camera.x, view.camera.y); //console.log(camera);
    context.drawImage(canvas.offScreenCanvas,0,0);

    if (game.map) {

        // ENTITIES AND PLAYER

        c.allEnts.forEach(e => {e.drawn = false;});

        let minTile = view.screenToTile({x: 0, y: 0});
        let maxTile = view.screenToTile({x: context.canvas.width, y: context.canvas.height});
        for(let ay = minTile.y; ay < Math.min(maxTile.y + 5, gridSize.y); ay++) {
            for(let ax = minTile.x; ax < Math.min(maxTile.x + 2, gridSize.x); ax++) {
                let tile = game.map[ax][ay];

                // ENTITY
                let entID = tile[layers.buildings];
                let b;
                if (entID != undefined) {
                    b = c.allEnts[entID];
                }

                // PLAYER
                if (c.player1.pos && ax-2 == Math.floor(c.player1.pos.x / tileSize) && ay-2 == Math.floor(c.player1.pos.y / tileSize)) {
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

                // ENTITY GROUNDS
                context.save();
                context.translate(ax * tileSize, ay *tileSize);

                if (b?.type && resName[b.type].img && b.drawn == false) {
                    let type = resName[b.type];
                    if (type && type.size) {
                        context.translate(type.size[0] / 2 * tileSize, type.size[1] / 2 * tileSize);
                        context.rotate(b.dir * Math.PI/2);
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

        for(let ax = minTile.x; ax < Math.min(maxTile.x + 2, gridSize.x); ax++) {
            for(let ay = minTile.y; ay < Math.min(maxTile.y + 5, gridSize.y); ay++) {
                let tile = game.map[ax][ay];
                // ENTITY
                let entID = tile[layers.buildings];
                let b;
                if (entID != undefined) {
                    b = c.allEnts[entID];
                }
                context.save();
                context.translate((ax + 0.5) * tileSize, (ay + 0.5) *tileSize);
                if (b?.type && resName[b.type] && resName[b.type]?.mach?.drawItems) {
                    context.rotate(b.dir * Math.PI/2);
                    context.translate(-tileSize / 2, -tileSize / 2);
                    resName[b.type].mach.drawItems(context, b);
                }
                context.restore();
            }
        }


        
    }
    
    // ENTITY CANDIDATE
    if (c.pointer?.item && c.pointer.overlay == false) {
        let type = resName[c.pointer.item.id];
        if (type && type.size) {
            context.save();

            context.translate(curResPos.x * tileSize, curResPos.y * tileSize);

            context.translate(type.size[0] / 2 * tileSize, type.size[1] / 2 * tileSize);
            context.rotate(buildDir * Math.PI/2);
            context.translate(-type.size[0] / 2 * tileSize, -type.size[1] / 2 * tileSize);

            if (type.mach?.draw) type.mach.draw(context, c.pointer.item);
            else context.drawImage(type.img, 0, 0);
            context.restore();
        }
    }


    // OVERLAY
    context.resetTransform();
    receiptMenu.item = undefined;

    beltMenu.items.forEach(b => b.draw(context));

    // INVENTORY MENU
    if (invMenu.vis) {
        invMenu.items.forEach(b => b.draw(context));
    }


    // ENTITY MENU
    if(entityMenu.vis) {
        let dy = 96;
        context.beginPath();
        context.fillStyle = "rgba(150, 150, 150, 0.95)";
        context.fillRect(entityMenu.pos.x , entityMenu.pos.y, entityMenu.w , entityMenu.h);
        context.font = "24px Arial";
        context.fillStyle = "black";
        context.fillText(resName[c.allEnts[c.selEntity.entID].type].name, entityMenu.pos.x + 16, entityMenu.pos.y + 32);
        let selInv = c.allInvs[c.selEntity.invID]//inventory.getInv(selPos.x, selPos.y);
        if (selInv) {
            for(f in selInv.stack) {
                context.font = "24px Arial";
                context.fillStyle = "black";
                context.fillText(JSON.stringify(f).replaceAll('"', ''), craftMenu.pos.x + 16, craftMenu.pos.y + dy);
                if (entityMenu.buttons[f]) {
                    entityMenu.buttons[f].forEach(b => {b.draw(context)});
                }
                dy += 64;
            }
        }
    } else if (craftMenu.vis) {
        craftMenu.items.forEach(b => b.draw(context));
    }

    // RECEIPT MENU
    if (receiptMenu.item) {
        context.beginPath();
        context.fillStyle = "rgba(150, 150, 0, 0.95)";
        context.fillRect(receiptMenu.pos.x, receiptMenu.pos.y, receiptMenu.pos.w, receiptMenu.pos.h);
        context.font = "24px Arial";
        context.fillStyle = "black";
        let title = resName[receiptMenu.item.id].name;
        if (resName[receiptMenu.item.id].lock) title += " (developing...)";
        context.fillText(title, receiptMenu.pos.x + 6, receiptMenu.pos.y + 24);
        let dy = 0;
        if (resName[receiptMenu.item.id].cost) {
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
    }


    if (curResPos && game.map) {
        let inv = inventory.getInv(curResPos.x, curResPos.y);
        let res = game.map[curResPos.x][curResPos.y][layers.res];
        let ent = inventory.getEnt(curResPos.x, curResPos.y);

        if (DEV) {
            //console.log(JSON.stringify(game.map[curResPos.x][curResPos.y]), inv);
            context.font = "24px Arial";
            context.fillStyle = "white";
            context.fillText(curResPos.x + ", " + curResPos.y, mousePos.x, mousePos.y);
            if (res != undefined) context.fillText(JSON.stringify(res, null, 1), mousePos.x, mousePos.y + 24);
            if (inv != undefined) context.fillText(JSON.stringify(inv.stack, null, 1), mousePos.x , mousePos.y + 48);
            if (ent != undefined) context.fillText(JSON.stringify(ent, null, 1), mousePos.x , mousePos.y + 72);
            context.stroke();
        }

        // CONTENT MENU
        context.save();
        context.beginPath();
        context.fillStyle = "rgba(150, 150, 190, 0.75)";
        let menuPos = {x: canvas.width - 200, y: canvas.height / 2 - 100}
        context.translate(menuPos.x, menuPos.y);
        context.fillRect(0, 0, 200 , 100);
        context.font = "24px Arial";
        context.fillStyle = "black";
        if (ent) {
        context.fillText(resName[ent.type].name, 0, 30);
        } else if (res?.id) {
            context.fillText(resName[res.id].name + " " + res.n, 0, 30);
        }
        context.restore();
    }
    
    // POINTER ITEM
    if (c.pointer?.item && c.pointer.overlay) {
        let type = c.pointer.item?.id;
        if (type) {
            context.save();
            context.translate(mousePos.x, mousePos.y);
            context.rotate(buildDir * Math.PI/2);
            context.translate(-tileSize / 2, -tileSize / 2);
            if (resName[type]?.mach?.draw) resName[type].mach.draw(context, c.pointer.item);
            else {
                context.drawImage(resName[type].img, 0, 0);
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