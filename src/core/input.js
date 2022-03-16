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
        document.addEventListener("keydown", this.onKeyDown);
        document.addEventListener("keyup", this.onKeyUp);
    }

   

    onPointerDown(e)
    {
        let overlayClicked = false;
        selectItemMenu.items.forEach   (b => {if (b.collision(e, b)) { overlayClicked = true; }})
        invMenu.items.forEach   (b => {if (b.collision(e, b)) { overlayClicked = true; }})
        craftMenu.items.forEach (b => {if (b.collision(e, b)) { overlayClicked = true; }})
        entityMenu.items.forEach (b => {if (b.collision(e, b)) { overlayClicked = true; }})
        
        if (overlayClicked == false) {
            let worldCordinate = view.screenToWorld(getEventLocation(e));
            let tileCoordinate = worldToTile(worldCordinate);
            if (e.buttons == 1) {

                dragStart = worldCordinate;
                let res = c.game.map[tileCoordinate.x][tileCoordinate.y][layers.res];
                let d = dist(c.allInvs[c.playerID].pos, worldCordinate);

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
                    if (res?.id && d < 5*tileSize) c.playerClass.startMining(tileCoordinate, c.allInvs[c.playerID]);
                }
            } else if (e.buttons == 2) {
                let inv = c.game.map[tileCoordinate.x][tileCoordinate.y][layers.inv];
                if (inv) c.allInvs[inv] = undefined
                c.game.map[tileCoordinate.x][tileCoordinate.y][layers.inv] = null;
                c.allInvs[c.playerID].addItem(c.allInvs[ent]);
            }            
        }
    }


    onPointerUp(e) {
        c.playerClass.stopMining(c.allInvs[c.playerID]);

        let overlayClicked = false;
        selectItemMenu.items.forEach (b => {if (b.collision(e) && b.onClick) { b.onClick(e.which, b); overlayClicked = true; }})
        invMenu.items.forEach   (b => {if (b.collision(e) && b.onClick) { b.onClick(e.which, b); overlayClicked = true; }})
        craftMenu.items.forEach (b => {if (b.collision(e) && b.onClick) { b.onClick(e.which, b); overlayClicked = true; }})
        entityMenu.items.forEach (b => {if (b.collision(e) && b.onClick) { b.onClick(e.which, b); overlayClicked = true; }})

        let worldPos = view.screenToWorld({x: e.offsetX, y: e.offsetY});
        let tilePos = worldToTile(worldPos);
        let inv = inventory.getInv(tilePos.x, tilePos.y);
        
        if (overlayClicked == false) {
            if (e.buttons == 0) {
                // SHOW ENTITY
                if (c.pointer?.item?.id == undefined && inv) {
                    let invID = inventory.getInv(tilePos.x, tilePos.y).id;
                    c.selEntity = c.allInvs[invID];

                    view.updateEntityMenu(c.selEntity, true);

                    if (inv) {entityMenu.vis = invMenu.vis = true; craftMenu.vis = false; }
                    else {entityMenu.vis = invMenu.vis = false; craftMenu.vis = true;}
                }

                if (inv == undefined) entityMenu.vis = false;

                isDragging = false;
                dragStart = undefined;
                isBuilding = false;
            }
        }
    }

    onPointerMove(e)
    {
        let pointer = getEventLocation(e);
        if ( pointer == undefined) return;
        mousePos.x =  pointer.x;
        mousePos.y =  pointer.y;

        let isOverlay = false;
        invMenu.items.forEach  (b => {b.hover = b.collision(e); if (b.hover) { isOverlay = true; }})
        craftMenu.items.forEach  (b => {b.hover = b.collision(e); if (b.hover) { isOverlay = true; }})
        entityMenu.items.forEach  (b => {b.hover = b.collision(e); if (b.hover) { isOverlay = true; }})
        if (c.pointer) c.pointer.overlay = isOverlay;
        receiptMenu.rect.x = mousePos.x + 16;
        receiptMenu.rect.y = mousePos.y;

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

    onKeyDown(e){
        //ws.send(JSON.stringify({cmd: "keydown", data: e.code}));
        if(e.code == "KeyW") c.playerClass.setDir({y : -1});
        if(e.code == "KeyS") c.player.dir.y =1;
        if(e.code == "KeyD") c.player.dir.x = 1;
        if(e.code == "KeyA") c.player.dir.x = -1;
        if(e.code == "Escape") {
            if (c.pointer.item) {
                c.player.addItem(c.pointer.item);
            }
            c.pointer.item = undefined;
            invMenu.vis = false;
            entityMenu.vis = false;
            craftMenu.vis = false;
        }
        c.playerClass.stopMining(c.allInvs[c.playerID]);
    }

    onKeyUp(e){
        if(e.code == "KeyW") c.player.dir.y = 0;
        if(e.code == "KeyS") c.player.dir.y = 0;
        if(e.code == "KeyD") c.player.dir.x = 0;
        if(e.code == "KeyA") c.player.dir.x = 0;
        if(e.code == "KeyR") buildDir = (buildDir+1)%4;
        if(e.code == "KeyE") { 
            invMenu.vis = !invMenu.vis; 
            craftMenu.vis = invMenu.vis;
            if (invMenu.vis == false) entityMenu.vis = false;
        }
        c.playerClass.stopMining(c.allInvs[c.playerID]);
    }


}

if (exports == undefined) var exports = {};
exports.InputModule = InputModule;