
var beltMenu = {items:[], pos: {x: 0, y: 0, w: 0, h:0}, vis: true};
var invMenu = {items:[], pos: {x: 0, y: 0, w: 0, h:0}, vis: false};
var craftMenu = {items:[], pos: {x: 0, y: 0, w: 0, h:0}, vis: false};
var entityMenu = {items:[], pos: {x: 0, y: 0}, w: 600, h:300, vis: false};
var receiptMenu = {item: undefined, items:[], pos: {x: 0, y: 0, w: 300, h:50}, vis: false};

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
        beltMenu.pos = {x:canvas.width / 2 - 300, y:canvas.height - tileSize};
        invMenu.pos = {x:canvas.width / 2 - buttonSize * 8, y:canvas.height / 2 - buttonSize * 4};
        craftMenu.pos = {x:canvas.width / 2 + buttonSize / 2, y:canvas.height / 2 - buttonSize * 4};
        entityMenu.pos = {x:canvas.width / 2 + buttonSize / 2, y:canvas.height / 2 - buttonSize * 4};
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
                myMid.x = c.player1.pos.x;
                myMid.y = c.player1.pos.y - 66;
                this.setCamOn(myMid);
            }

            //ws.send(JSON.stringify({cmd: "camera", data: camera}));
        }
    }
    updateInventoryMenu(inv) {
        let pack = inv.stack["INV"];

        if (pack == undefined) return;
    
        for (let i = 0; i < pack.length; i++) {
            let item = pack[i];
            invMenu.items[i].item = item;
            invMenu.items[i].inv = c.player1.inv;
            invMenu.items[i].invKey = "INV";
            invMenu.items[i].stackPos = i;
        }

        for (let i = pack.length; i < invMenu.items.length; i++) {
            invMenu.items[i].item = undefined
            invMenu.items[i].inv = c.player1.inv;
            invMenu.items[i].invKey = "INV";
            invMenu.items[i].stackPos = i;
        }

        for(let craftItem of craftMenu.items ) {
            let inv = new Inventory();
            inv.stack = JSON.parse(JSON.stringify(c.player1.inv.stack));
            inv.packsize = c.player1.inv.packsize;
            inv.itemsize = c.player1.inv.itemsize;
            let cost = resName[craftItem.item.id].cost;
            craftItem.item.n = 0;
            while (inv.remStackItems(cost)) craftItem.item.n++; // how much can be build
        }
    }
}