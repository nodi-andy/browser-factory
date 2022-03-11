var invMenu = new Dialog();
var craftMenu = new Dialog();
var entityMenu = new Dialog();
var receiptMenu = new Dialog();
var selectItemMenu = new Dialog();



class ViewModule {
    constructor(windowElement) {
        this.win = windowElement;
        this.win.addEventListener("resize", () => {
            this.resize();
        });
        this.resize();
        this.camera = {x: 0, y: 0, zoom: 1};
        this.size = {x: canvas.width, y: canvas.height};
        this.scrollFactor = 0.0005;
        this.zoomLimit = {min: 0.5, max:2};

                // INV MENU
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let newButton = new Button (j * (buttonSize), i * (buttonSize), undefined, invMenu);
                invMenu.items.push(newButton);
            }
        }
    }

    dragcamera(dragStart) {
        let camPos = {x: 0, y: 0};
        camPos.x = pos.x / this.camera.zoom - dragStart.x
        camPos.y = pos.y / this.camera.zoom - dragStart.y
        this.setCamPos(camPos);
    }

    setCamOn(pos) {
        this.setCamPos({x: -pos.x + (this.size.x / 2 / this.camera.zoom), y: -pos.y + (this.size.y / 2 / this.camera.zoom)});
    }

    secureBoundaries() {
        if (this.camera.x > 0) this.camera.x = 0;
        if (this.camera.y > 0) this.camera.y = 0;
        let boundary = view.screenToWorld({x: this.width, y: this.height});
        if (boundary.x > gridSize.x * tileSize) this.camera.x = this.width / this.camera.zoom - (gridSize.x * tileSize);
        if (boundary.y > gridSize.y * tileSize) this.camera.y = this.height / this.camera.zoom - (gridSize.y * tileSize);
    }
    setCamPos(pos) {
        this.camera.x = pos.x;
        this.camera.y = pos.y;
        //console.log(this.camera);
        this.secureBoundaries();
    }

    resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        invMenu.rect.x = canvas.width / 2 - buttonSize * 8;
        invMenu.rect.y = canvas.height / 2 - buttonSize * 4;

        craftMenu.rect.x = canvas.width / 2 + buttonSize / 2;
        craftMenu.rect.y = canvas.height / 2 - buttonSize * 4;
        craftMenu.rect.w = 8 * buttonSize;
        craftMenu.rect.h = 8 * buttonSize;

        entityMenu.rect.x = craftMenu.rect.x;
        entityMenu.rect.y = craftMenu.rect.y;
        entityMenu.rect.w = craftMenu.rect.w;
        entityMenu.rect.h = craftMenu.rect.h;
        
        receiptMenu.rect.w = craftMenu.rect.w / 2;
        receiptMenu.rect.h = craftMenu.rect.h;

        selectItemMenu.rect.x = craftMenu.rect.x;
        selectItemMenu.rect.y = craftMenu.rect.y;
        selectItemMenu.rect.w = craftMenu.rect.w;
        selectItemMenu.rect.h = craftMenu.rect.h;
    }

    screenToWorld(p) { 
        return {x: p.x/this.camera.zoom - this.camera.x, y: p.y/this.camera.zoom - this.camera.y};
    }

    screenToTile(p) {
        return worldToTile(this.screenToWorld(p));
    }

    onZoom(zoomFactor)
    {
        if (!isDragging)
        {
            let zoomAmount = (1 - zoomFactor);
            let newZoom = this.camera.zoom * zoomAmount;
            //console.log(newZoom)           
            /*if (DEV) {
                this.camera.zoom = Math.max( this.camera.zoom, Math.max(canvas.width / (gridSize.x * tileSize), canvas.height / (gridSize.y * tileSize)))
                this.camera.x += (mousePos.x / this.camera.zoom) - (mousePos.x / (this.camera.zoom / zoomAmount));
                this.camera.y += (mousePos.y / this.camera.zoom) - (mousePos.y / (this.camera.zoom / zoomAmount));
                this.secureBoundaries();
            } else */
            {
                this.camera.zoom = Math.min(this.zoomLimit.max, Math.max( newZoom, this.zoomLimit.min));
                let myMid = {}
                myMid.x = c.allInvs[c.playerID].pos.x;
                myMid.y = c.allInvs[c.playerID].pos.y - 66;
                this.setCamOn(myMid);
            }

            //ws.send(JSON.stringify({cmd: "camera", data: camera}));
        }
    }

    // CRAFT MENU
    updateCraftingMenu() {
        let items = resDB.player.output;
        let pos = 0;
        items.forEach(i => {
            let newButton = new Button ((pos % 8) * (buttonSize), Math.floor(pos/8) * (buttonSize), {id: i.id, n: 0} , craftMenu);
            newButton.onClick = () => {
                if (resName[i.id].lock == undefined) craftToInv(c.player, [i]);
            };
            newButton.type = "craft";
            craftMenu.items.push(newButton)
            pos++;
            if (newButton.x + newButton.w > craftMenu.rect.w) craftMenu.rect.w = newButton.x + newButton.w;
            if (newButton.y + newButton.h > craftMenu.rect.h) craftMenu.rect.h = newButton.y + newButton.h;
        });
    }

    // SELECT ITEM MENU
    updateSelectItemMenu(ent) {
        let items = c.resName[ent.type].output;
        let pos = 0;
        items.forEach(i => {
            let newButton = new Button ((pos % 8) * (buttonSize), Math.floor(pos/8) * (buttonSize), {id: i} , selectItemMenu);
            newButton.onClick = (which, button) => {
                c.assemblyMachine1.setOutput(c.game.map, c.selEntity, button.item.id);
                c.selEntity.vis = true;
                selectItemMenu.vis = false;
            };
            selectItemMenu.items.push(newButton)
            pos++;
            if (newButton.x + newButton.w > selectItemMenu.rect.w) selectItemMenu.rect.w = newButton.x + newButton.w;
            if (newButton.y + newButton.h > selectItemMenu.rect.h) selectItemMenu.rect.h = newButton.y + newButton.h;
        });
    }

    updateInventoryMenu(inv) {
        let pack = inv.stack["INV"];

        if (pack == undefined) return;
    
        for (let i = 0; i < pack.length; i++) {
            let item = pack[i];
            invMenu.items[i].item = item;
            invMenu.items[i].inv = c.player;
            invMenu.items[i].invKey = "INV";
            invMenu.items[i].stackPos = i;
        }

        for (let i = pack.length; i < invMenu.items.length; i++) {
            invMenu.items[i].item = undefined
            invMenu.items[i].inv = c.player;
            invMenu.items[i].invKey = "INV";
            invMenu.items[i].stackPos = i;
        }

        for(let craftItem of craftMenu.items ) {
            let inv = new Inventory();
            inv.stack = JSON.parse(JSON.stringify(c.player.stack));
            inv.stack.INV.size = 64;
            inv.packsize = c.player.packsize;
            inv.itemsize = c.player.itemsize;
            let cost = resName[craftItem.item.id].cost;
            craftItem.item.n = 0;
            if (cost) {
                while (inv.remItems(cost)) craftItem.item.n++; // how much can be build
            }
        }
    }

    updateEntityMenu(inv, forceUpdate = false) {
        if (inv == undefined) return;
        let showStack = inv.stack;
      
        entityMenu.vis = true;
        let init = entityMenu.invID != inv.id;
        var refresh = init || forceUpdate;
        entityMenu.invID = inv.id;
        if (refresh) {
            entityMenu.buttons = {};
            entityMenu.items = [];
        }
    
        let dx = 128;
        let dy = 64;
        if (inv.prod) {
            let button;
            if (refresh) {
                entityMenu.buttons.PROD = [];
                button = new Button(dx , dy, undefined, entityMenu, c.selEntity);
                button.onClick = () => {
                    view.updateSelectItemMenu(c.selEntity);
                    selectItemMenu.vis = true;
                }
                dy += buttonSize;
            } else button = entityMenu.buttons.PROD;
            button.invKey = "PROD";
            button.stackPos = 0;
            button.item = item;
    
            if (refresh) entityMenu.items.push(button);
            if (refresh) entityMenu.buttons.PROD.push(button);
        }
    
        for(let s of Object.keys(showStack)) {
            dx = 128;
            if (refresh) entityMenu.buttons[s] = [];
            for(let stackPos = 0; stackPos < inv.packsize[s]; stackPos++) {
                let item = showStack[s][stackPos];
                let button;
                if (refresh) button = new Button(dx , dy, item, entityMenu, c.selEntity);
                else button = entityMenu.buttons[s][stackPos];
                dx += buttonSize;
                button.invKey = s;
                button.stackPos = stackPos;
                button.item = item;
    
                if (refresh) entityMenu.items.push(button);
                if (refresh) entityMenu.buttons[s].push(button);
    
            }
            dy += buttonSize;
        }
    }
}