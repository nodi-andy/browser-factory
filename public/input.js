function onPointerDown(e)
{
    dragStart = screenToWorld(getEventLocation(e));

    let worldCordinate = {x: dragStart.x, y: dragStart.y};
    let tileCoordinate = worldToTile(worldCordinate);
    isClicking = true;
    let res = city.map[tileCoordinate.x][tileCoordinate.y][layers.res];
    if (res) workInterval = setInterval(function() { mineToInv({source: tileCoordinate, id:res.id, n: 1}); }, 1000);
    //
}

function onPointerUp(e) {
    clearInterval(workInterval);
    initialPinchDistance = null;
    lastZoom = camera.zoom;
    let picked = undefined;
    let pointerPos = screenToWorld({x: e.offsetX, y: e.offsetY});

    beltMenu.items.forEach(b => {if (b.collision(e)) b.onClick();})
    invMenu.items.forEach(b => {if (b.collision(e)) b.onClick();})
    buildMenu.items.forEach(b => {if (b.collision(e)) b.onClick();})
    if (picked == undefined) picked = {pos: floorTile(pointerPos), type:"tile"};


    /*if (picked.type == "person") { pickedPerson = picked; pickedTiles = [];}
    else {
        if (pickedTiles.length) {
            let lastTile = pickedTiles[pickedTiles.length-1];
            if (picked.pos.x == lastTile.pos.x && picked.pos.y == lastTile.pos.y) {
            ws.send(JSON.stringify({cmd: "addTask", data: {p: pickedPerson.id, t: pickedTiles}}));
            }
        }
        pickedTiles.push(picked);
    }*/

    /*if (e.y < menu.length * 48 && e.x < 200) {
        if (selectedTile) {
            let menuItem = menu[Math.floor(e.y/48)].name;
            selectedTile.type = menuItem;
            ws.send(JSON.stringify({cmd: "addCity", data: selectedTile}));
            console.log(menu[Math.floor(e.y/48)].name)
        } else if (selectedNode) {
            cTask.person = menu[Math.floor(e.y/48)].id;
        }
    } else {
        if (pickedObj) { 
                selectedNode = pickedObj; selectedTile = undefined;
        } else {
            if (cTask.person) {
                if (cTask.from == undefined) cTask.from = roundTile(e);
                else {
                    cTask.dest = roundTile(e); 
                    ws.send(JSON.stringify({cmd: "addTask", data: cTask}));
                    cTask = Object();
                }
            } else { selectedTile = pointerPos; selectedNode = undefined; }
        }
    }*/

    isDragging = false;
    ws.send(JSON.stringify({cmd: "camera", data: camera}));
}

function onPointerMove(e)
{
    if (e.buttons == 1)
    {
        isDragging = true
        isClicking = false;
        camera.x = getEventLocation(e).x / camera.zoom - dragStart.x
        camera.y = getEventLocation(e).y / camera.zoom - dragStart.y
        if (camera.x > 0) camera.x = 0;
        if (camera.y > 0) camera.y = 0;
    }
    if ( getEventLocation(e)) {
        mousePos.x =  getEventLocation(e).x;
        mousePos.y =  getEventLocation(e).y;
        curResPos = worldToGrid(screenToWorld(mousePos));
    }
}