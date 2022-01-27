function onPointerDown(e)
{
    dragStart = screenToWorld(getEventLocation(e));

    let worldCordinate = {x: dragStart.x, y: dragStart.y};
    let tileCoordinate = worldToTile(worldCordinate);
    isClicking = true;
    let res = city.map[tileCoordinate.x][tileCoordinate.y][layers.res];
    let d = dist(player1.pos, worldCordinate);
    if (res && d < 80) workInterval = setInterval(function() { mineToInv({source: tileCoordinate, id:res.id, n: 1}); }, 1000);
    if (pointerButton && resName[pointerButton.id].type == "building") {
        let newEntity = new Entity(tileCoordinate.x, tileCoordinate.y, 1, 1, pointerButton.id);
        ws.send(JSON.stringify({cmd: "addBuilding", data: {x: newEntity.x, y: newEntity.y, id: newEntity.id}}));
     } else {
        //ws.send(JSON.stringify({cmd: "addItem", data: {pos: tileCoordinate, inv: {id: pointerButton.t, n: pointerButton.n}}}));
     }
}

function onPointerUp(e) {
    clearInterval(workInterval);
    initialPinchDistance = null;
    lastZoom = camera.zoom;
    let picked = undefined;
    let pointerPos = screenToWorld({x: e.offsetX, y: e.offsetY});

    beltMenu.items.forEach  (b => {if (b.collision(e) && b.onClick) b.onClick();})
    invMenu.items.forEach   (b => {if (b.collision(e) && b.onClick) b.onClick();})
    buildMenu.items.forEach (b => {if (b.collision(e) && b.onClick) b.onClick();})
    if (picked == undefined) picked = {pos: floorTile(pointerPos), type:"tile"}

    isDragging = false;
    ws.send(JSON.stringify({cmd: "camera", data: camera}));
}

function onPointerMove(e)
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

function onKeyDown(e){
    ws.send(JSON.stringify({cmd: "keydown", data: e.code}));
}

function onKeyUp(e){
    ws.send(JSON.stringify({cmd: "keyup", data: e.code}));
}