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
            if (res?.id && d < 5*tileSize) c.player1.startMining(tileCoordinate);

            if (c.pointer?.item?.id) {
                c.pointer.type = resName[c.pointer.item.id].type;
                if (c.pointer.type == "entity") {
                    wssend({cmd: "addEntity", data: {pos: {x: tileCoordinate.x, y: tileCoordinate.y}, dir: buildDir, type: c.pointer.item.id}});
                } else {
                    wssend({cmd: "addItem", data: {pos: tileCoordinate, dir: buildDir, inv: {item: c.pointer.item}}});
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
        beltMenu.items.forEach  (b => {if (b.collision(e) && b.onClick) { b.onClick(e.which); overlayClicked = true; }})
        invMenu.items.forEach   (b => {if (b.collision(e) && b.onClick) { b.onClick(e.which); overlayClicked = true; }})
        craftMenu.items.forEach (b => {if (b.collision(e) && b.onClick) { b.onClick(e.which); overlayClicked = true; }})
        entityMenu.items.forEach (b => {if (b.collision(e) && b.onClick) { b.onClick(e.which); overlayClicked = true; }})

        let worldPos = view.screenToWorld({x: e.offsetX, y: e.offsetY});
        let tilePos = worldToTile(worldPos);
        let entity = inventory.getEnt(tilePos.x, tilePos.y);
        
        if (overlayClicked == false) {

            // SHOW ENTITY
            if (c.pointer?.item == undefined && entity) {
                let invID = inventory.getInv(tilePos.x, tilePos.y).id;
                c.selEntity = {entID: entity.id, inv: c.allInvs[invID], invID: invID};

                showInventory(c.selEntity.inv, true);

                if (entity) {entityMenu.vis = invMenu.vis = true; craftMenu.vis = false; }
                else {entityMenu.vis = invMenu.vis = false; craftMenu.vis = true;}
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
        if (c.pointer) c.pointer.overlay = isOverlay;
        receiptMenu.pos.x = mousePos.x;
        receiptMenu.pos.y = mousePos.y;

        if (isOverlay == false) {
            let tileCoordinate = view.screenToTile(mousePos);
            curResPos = {x: tileCoordinate.x, y: tileCoordinate.y};

            if (e.buttons == 1) {
                if (isBuilding) {
                    if ((lastResPos.x != curResPos.x || lastResPos.y != curResPos.y) && c.pointer?.item?.id) {
                        if (c.pointer.type == "entity") {
                            wssend({cmd: "addEntity", data: {pos: {x: tileCoordinate.x, y: tileCoordinate.y}, dir: buildDir, type: c.pointer.item.id}});
                        } else {
                            wssend({cmd: "addItem", data: {pos: tileCoordinate, dir: buildDir, inv: {item: c.pointer.item}}});
                        }
                    }
                } else  {
                    isDragging = true;
                }
            }
            lastResPos = {x: curResPos.x, y: curResPos.y};
        }
    }

}

if (exports == undefined) var exports = {};
exports.InputModule = InputModule;