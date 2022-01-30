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
            isClicking = true;
            let res = city.map[tileCoordinate.x][tileCoordinate.y][layers.res];
            let d = dist(player1.pos, worldCordinate);
            if (res && d < 80) workInterval = setInterval(function() { mineToInv({source: tileCoordinate, id:res.id, n: 1}); }, 1000);
            if (pointerButton) {
                if (resName[pointerButton.id].type == "building") {
                    ws.send(JSON.stringify({cmd: "addEntity", data: {pos: {x: tileCoordinate.x, y: tileCoordinate.y}, dir: buildDir, type: pointerButton.id}}));
                } else {
                    ws.send(JSON.stringify({cmd: "addItem", data: {pos: tileCoordinate, dir: buildDir, inv: pointerButton}}));
                }
            }
        }
    }

    onPointerUp(e) {
        clearInterval(workInterval);
        //initialPinchDistance = null;
        //lastZoom = camera.zoom;
        let picked = undefined;
        let pointerPos = screenToWorld({x: e.offsetX, y: e.offsetY});

        if (picked == undefined) picked = {pos: floorTile(pointerPos), type:"tile"}

        isDragging = false;
        ws.send(JSON.stringify({cmd: "camera", data: camera}));
    }

    onPointerMove(e)
    {
        if (e.buttons == 1)
        {
            isDragging = true
            camera.x = getEventLocation(e).x / camera.zoom - dragStart.x
            camera.y = getEventLocation(e).y / camera.zoom - dragStart.y
            if (camera.x > 0) camera.x = 0;
            if (camera.y > 0) camera.y = 0;
        }
        if ( getEventLocation(e)) {
            mousePos.x =  getEventLocation(e).x;
            mousePos.y =  getEventLocation(e).y;
            let p = worldToGrid(screenToWorld(mousePos));
            curResPos.x = p.x;
            curResPos.y = p.y;
        }
    }

}

if (exports == undefined) var exports = {};
exports.InputModule = InputModule;