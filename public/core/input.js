let mousePos    = {x: 0, y: 0}
function adjustZoom(zoomFactor)
{
    if (!isDragging)
    {
        //console.log(zoomFactor)
        zoomFactor *= -1;

        let zoomAmount = (1 + zoomFactor);
        camera.zoom *= zoomAmount;
       
        //camera.zoom = Math.min( camera.zoom, MAX_ZOOM )
        camera.zoom = Math.max( camera.zoom, Math.max(canvas.width / (gridSize.x * tileSize), canvas.height / (gridSize.y * tileSize)))

        camera.x += (mousePos.x / camera.zoom) - (mousePos.x / (camera.zoom / zoomAmount));
        camera.y += (mousePos.y / camera.zoom) - (mousePos.y / (camera.zoom / zoomAmount));
        if (camera.x > 0) camera.x = 0;
        if (camera.y > 0) camera.y = 0;
        let boundary = screenToWorld({x: canvas.width, y: canvas.height});
        if (boundary.x > gridSize.x * tileSize) camera.x = canvas.width / camera.zoom - (gridSize.x * tileSize);
        if (boundary.y > gridSize.y * tileSize) camera.y = canvas.height / camera.zoom - (gridSize.y * tileSize);
        //ws.send(JSON.stringify({cmd: "camera", data: camera}));
    }
}

// Gets the relevant location from a mouse or single touch event
function getEventLocation(e) {
    if (e.touches && e.touches.length == 1)
    {
        return { x:e.touches[0].clientX, y: e.touches[0].clientY }
    }
    else if (e.clientX && e.clientY)
    {
        return { x: e.clientX, y: e.clientY }
    }
}

class InputModule {
    constructor(canvas) {
        this.canvas = canvas;
        canvas.addEventListener('pointerdown', this.onPointerDown);
        canvas.addEventListener('pointermove', this.onPointerMove);
        canvas.addEventListener('pointerup', this.onPointerUp);
        canvas.addEventListener("wheel", (e) => adjustZoom(e.deltaY* SCROLL_SENSITIVITY))
    }

   

    onPointerDown(e)
    {
        let overlayClicked = false;
        beltMenu.items.forEach  (b => {if (b.collision(e)) { overlayClicked = true; }})
        invMenu.items.forEach   (b => {if (b.collision(e)) { overlayClicked = true; }})
        craftMenu.items.forEach (b => {if (b.collision(e)) { overlayClicked = true; }})
        
        if (overlayClicked == false) {
            dragStart = screenToWorld(getEventLocation(e));

            let worldCordinate = {x: dragStart.x, y: dragStart.y};
            let tileCoordinate = worldToTile(worldCordinate);
            let res = game.map[tileCoordinate.x][tileCoordinate.y][layers.res];
            let d = dist(c.player1.pos, worldCordinate);
            if (res && d < 5*tileSize) workInterval = setInterval(function() { mineToInv({source: tileCoordinate, id:res.id, n: 1}); }, 1000);

            if (pointerButton && pointerButton.id) {
                isBuilding = true;
                if (pointerButton.type == "entity") {
                    ws.send(JSON.stringify({cmd: "addEntity", data: {pos: {x: tileCoordinate.x, y: tileCoordinate.y}, dir: buildDir, type: pointerButton.id}}));
                } else {
                    ws.send(JSON.stringify({cmd: "addItem", data: {pos: tileCoordinate, dir: buildDir, inv: {item: pointerButton}}}));
                }
            }
        }
    }

    onPointerUp(e) {
        clearInterval(workInterval);

        let overlayClicked = false;
        beltMenu.items.forEach  (b => {if (b.collision(e) && b.onClick) { b.onClick(); overlayClicked = true; }})
        invMenu.items.forEach   (b => {if (b.collision(e) && b.onClick) { b.onClick(); overlayClicked = true; }})
        craftMenu.items.forEach (b => {if (b.collision(e) && b.onClick) { b.onClick(); overlayClicked = true; }})
        
        if (overlayClicked == false) {

            let picked = undefined;
            let pointerPos = screenToWorld({x: e.offsetX, y: e.offsetY});
            let worldPos = worldToTile(screenToWorld(getEventLocation(e)));
            if (pointerButton == undefined || pointerButton.id == undefined) {
                let entity = inventory.getEnt(worldPos.x, worldPos.y);
                if (entity) {
                    c.selEntity = entity;
                    c.selEntity.inv = c.allInvs[c.selEntity.invID];
                    c.buttons ={};
                    let dx = 200;
                    let dy = 16;
                    for(let s of Object.keys(c.selEntity.inv.stack)) {
                        c.buttons[s] = [];
                        for(let item in  c.selEntity.inv.stack[s]) {
                            let button = new Button(dx , dy, {id:3, n:19}, entityMenu);
                            c.buttons[s].push(button);
                            entityMenu.items.push(button);
                        }
                    }
                    //entityMenu.items.push();
                    if (entity) {entityMenu.vis = invMenu.vis = true; craftMenu.vis = false; }
                    else {entityMenu.vis = invMenu.vis = false; craftMenu.vis = true;}
                    if (picked == undefined) picked = {pos: floorTile(pointerPos), type:"tile"}
                }
            }

            isDragging = false;
            dragStart = undefined;
            isBuilding = false;
        }
    }

    onPointerMove(e)
    {
        let pointer = getEventLocation(e);
        if ( pointer == undefined) return;
        mousePos.x =  pointer.x;
        mousePos.y =  pointer.y;

        let isOverlay = false;
        beltMenu.items.forEach (b => {b.hover = b.collision(e); if (b.hover) { isOverlay = true; }})
        invMenu.items.forEach  (b => {b.hover = b.collision(e); if (b.hover) { isOverlay = true; }})
        craftMenu.items.forEach  (b => {b.hover = b.collision(e); if (b.hover) { isOverlay = true; }})
        entityMenu.items.forEach  (b => {b.hover = b.collision(e); if (b.hover) { isOverlay = true; }})
        pointerButton.overlay = isOverlay;
        receiptMenu.pos.x = mousePos.x;
        receiptMenu.pos.y = mousePos.y;

        if (isOverlay) {
        } else {
            let p = worldToTile(screenToWorld(mousePos));
            curResPos.x = p.x;
            curResPos.y = p.y;


            if (e.buttons == 1 && dragStart) {
                if (isBuilding) {
                    if (lastResPos.x != curResPos.x || lastResPos.y != curResPos.y) {
                        if (pointerButton.type == "entity") {
                            ws.send(JSON.stringify({cmd: "addEntity", data: {pos: {x: curResPos.x, y: curResPos.y}, dir: buildDir, type: pointerButton.id}}));
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
                    let boundary = screenToWorld({x: this.width, y: this.height});
                    if (boundary.x > gridSize.x * tileSize) camera.x = this.width / camera.zoom - (gridSize.x * tileSize);
                    if (boundary.y > gridSize.y * tileSize) camera.y = this.height / camera.zoom - (gridSize.y * tileSize);
                }
            }
            lastResPos.x = curResPos.x;
            lastResPos.y = curResPos.y;
        }
    }

}

if (exports == undefined) var exports = {};
exports.InputModule = InputModule;