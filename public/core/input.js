class InputModule {
    constructor(doc) {
        this.doc = doc;
        doc.addEventListener('pointerdown', this.onPointerDown);
        doc.addEventListener('pointermove', this.onPointerMove);
        doc.addEventListener('pointerup', this.onPointerUp);
    }

    onPointerDown(e)
    {
        let overlayClicked = false;
        beltMenu.items.forEach  (b => {if (b.collision(e) && b.onClick) { b.onClick();overlayClicked = true; }})
        invMenu.items.forEach   (b => {if (b.collision(e) && b.onClick) { b.onClick();overlayClicked = true; }})
        buildMenu.items.forEach (b => {if (b.collision(e) && b.onClick) { b.onClick();overlayClicked = true; }})
        
        if (overlayClicked == false) {
            dragStart = screenToWorld(getEventLocation(e));

            let worldCordinate = {x: dragStart.x, y: dragStart.y};
            let tileCoordinate = worldToTile(worldCordinate);
            let res = game.map[tileCoordinate.x][tileCoordinate.y][layers.res];
            let d = dist(player1.pos, worldCordinate);
            if (res && d < 80) workInterval = setInterval(function() { mineToInv({source: tileCoordinate, id:res.id, n: 1}); }, 1000);
                if (pointerButton && pointerButton.item && pointerButton.item.id) {
                    isBuilding = true;
                    if (resName[pointerButton.item.id].type == "machine") {
                        ws.send(JSON.stringify({cmd: "addEntity", data: {pos: {x: tileCoordinate.x, y: tileCoordinate.y}, dir: buildDir, type: pointerButton.item.id}}));
                    } else {
                        ws.send(JSON.stringify({cmd: "addItem", data: {pos: tileCoordinate, dir: buildDir, inv: pointerButton}}));
                    }
                }
        }
    }

    onPointerUp(e) {
        clearInterval(workInterval);

        let picked = undefined;
        let pointerPos = screenToWorld({x: e.offsetX, y: e.offsetY});

        if (picked == undefined) picked = {pos: floorTile(pointerPos), type:"tile"}

        isDragging = false;
        dragStart = undefined;
        isBuilding = false;
        //ws.send(JSON.stringify({cmd: "camera", data: camera}));
    }

    onPointerMove(e)
    {
        let pointer = getEventLocation(e);
        if ( pointer != undefined) {
            mousePos.x =  pointer.x;
            mousePos.y =  pointer.y;
            let p = worldToTile(screenToWorld(mousePos));
            curResPos.x = p.x;
            curResPos.y = p.y;

            if (e.buttons == 1 && dragStart) {
                if (isBuilding) {
                    if (lastResPos.x != curResPos.x || lastResPos.y != curResPos.y) {
                        if (resName[pointerButton.item.id].type == "machine") {
                            ws.send(JSON.stringify({cmd: "addEntity", data: {pos: {x: curResPos.x, y: curResPos.y}, dir: buildDir, type: pointerButton.item.id}}));
                        } else {
                            ws.send(JSON.stringify({cmd: "addItem", data: {pos: curResPos, dir: buildDir, inv: pointerButton}}));
                        }
                    }
                } else  {
                    isDragging = true
                    camera.x = mousePos.x / camera.zoom - dragStart.x
                    camera.y = mousePos.y / camera.zoom - dragStart.y
                    if (camera.x > 0) camera.x = 0;
                    if (camera.y > 0) camera.y = 0;
                }
            }
            lastResPos.x = curResPos.x;
            lastResPos.y = curResPos.y;
        }
    }

}

if (exports == undefined) var exports = {};
exports.InputModule = InputModule;