class ViewModule {
    constructor(windowElement) {
        this.win = windowElement;
        this.win.addEventListener("resize", () => {
            this.resize();
        });
        this.resize();
    }

    resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        beltMenu.pos = {x:canvas.width / 2 - 300, y:canvas.height - tileSize};
        invMenu.pos = {x:canvas.width / 2 - buttonSize * 8, y:canvas.height / 2 - buttonSize * 4};
        craftMenu.pos = {x:canvas.width / 2 + buttonSize / 2, y:canvas.height / 2 - buttonSize * 4};
        entityMenu.pos = {x:canvas.width / 2 + buttonSize / 2, y:canvas.height / 2 - buttonSize * 4};
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