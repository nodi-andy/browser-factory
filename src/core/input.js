let mousePos    = {x: 0, y: 0}
let isDragging = false;
let dragStart = { x: 0, y: 0 }
let isDragStarted = false;
let isBuilding = false;




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
        canvas.addEventListener("wheel", (e) => view.onZoom(e.deltaY * view.scrollFactor))
    }

   

    onPointerDown(e)
    {
        let overlayClicked = false;
        beltMenu.items.forEach  (b => {if (b.collision(e)) { overlayClicked = true; }})
        invMenu.items.forEach   (b => {if (b.collision(e)) { overlayClicked = true; }})
        craftMenu.items.forEach (b => {if (b.collision(e)) { overlayClicked = true; }})
        entityMenu.items.forEach (b => {if (b.collision(e)) { overlayClicked = true; }})
        
        if (overlayClicked == false) {
            let worldCordinate = view.screenToWorld(getEventLocation(e));

            dragStart = worldCordinate;
            let tileCoordinate = worldToTile(worldCordinate);
            let res = game.map[tileCoordinate.x][tileCoordinate.y][layers.res];
            let d = dist(c.player1.pos, worldCordinate);
            if (res && d < 5*tileSize) c.player1.startMining(tileCoordinate);

            if (pointerButton && pointerButton.item && pointerButton.item.id) {
                pointerButton.type = resName[pointerButton.item.id].type;
                if (pointerButton.type == "entity") {
                    if (pointerButton.item) wssend({cmd: "addEntity", data: {pos: {x: tileCoordinate.x, y: tileCoordinate.y}, dir: buildDir, type: pointerButton.item.id}});
                } else {
                    wssend({cmd: "addItem", data: {pos: tileCoordinate, dir: buildDir, inv: {item: pointerButton.item}}});
                }
                isDragStarted = false;
                isBuilding = true;
            } else {
                isDragStarted = true;
                isBuilding = false;
            }
            
        }
    }


    onPointerUp(e) {
        c.player1.stopMining();
        

        let overlayClicked = false;
        beltMenu.items.forEach  (b => {if (b.collision(e) && b.onClick) { b.onClick(); overlayClicked = true; }})
        invMenu.items.forEach   (b => {if (b.collision(e) && b.onClick) { b.onClick(); overlayClicked = true; }})
        craftMenu.items.forEach (b => {if (b.collision(e) && b.onClick) { b.onClick(); overlayClicked = true; }})
        entityMenu.items.forEach (b => {if (b.collision(e) && b.onClick) { b.onClick(); overlayClicked = true; }})

        let worldPos = view.screenToWorld({x: e.offsetX, y: e.offsetY});
        let tilePos = worldToTile(worldPos);
        let entity = inventory.getEnt(tilePos.x, tilePos.y);
        
        if (overlayClicked == false) {

            let picked = undefined;
            if ((pointerButton == undefined || pointerButton.item == undefined) && entity) {
                let invID = inventory.getInv(tilePos.x, tilePos.y).id;
                c.selEntity = {entID: entity.id, inv: c.allInvs[invID], invID: invID};

                setShowInventory(c.selEntity.inv);

                if (entity) {entityMenu.vis = invMenu.vis = true; craftMenu.vis = false; }
                else {entityMenu.vis = invMenu.vis = false; craftMenu.vis = true;}
                //if (picked == undefined) picked = {pos: floorTile(pointerPos), type:"tile"}
            }

            if (entity == undefined) entityMenu.vis = false;

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
        if (pointerButton) pointerButton.overlay = isOverlay;
        receiptMenu.pos.x = mousePos.x;
        receiptMenu.pos.y = mousePos.y;

        if (isOverlay) {
        } else {
            let tileCoordinate = view.screenToTile(mousePos);
            curResPos.x = tileCoordinate.x;
            curResPos.y = tileCoordinate.y;

            if (e.buttons == 1) {
                if (isBuilding) {
                    if (lastResPos.x != curResPos.x || lastResPos.y != curResPos.y) {
                        if (pointerButton.type == "entity") {
                            wssend({cmd: "addEntity", data: {pos: {x: tileCoordinate.x, y: tileCoordinate.y}, dir: buildDir, type: pointerButton.item.id}});
                        } else {
                            wssend({cmd: "addItem", data: {pos: tileCoordinate, dir: buildDir, inv: {item: pointerButton.item}}});
                        }
                    }
                } else  {
                    isDragging = true
                    if (DEV) {
                        view.setCamPos(mousePos.x, mousePos.y);
                    }
                }
            }
            lastResPos.x = curResPos.x;
            lastResPos.y = curResPos.y;
        }
    }

}

if (exports == undefined) var exports = {};
exports.InputModule = InputModule;