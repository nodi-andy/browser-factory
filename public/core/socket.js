const ws        = new WebSocket('ws://192.168.1.22');
ws.onmessage = function(e) {
    let socketMsg = JSON.parse(e.data);

    if (socketMsg.msg == "updateInv") {
        c.allInvs = JSON.parse(JSON.stringify(socketMsg.data));
    }
    if (socketMsg.msg == "updateEntities") {
        c.allEnts = JSON.parse(JSON.stringify(socketMsg.data));
    }
    if (socketMsg.msg == "updatePlayer") {
        play = socketMsg.data;
        c.player1.invOb = new Inventory(undefined, {x: 0, y:0});
        c.player1.invOb.packsize = socketMsg.data.inv.packsize;
        c.player1.invOb.itemsize = socketMsg.data.inv.itemsize;
        c.player1.invOb.addItems(socketMsg.data.inv.packs);
        c.player1.inv = c.player1.invOb;
        delete c.player1.invOb;

        for (let i = 0; i < c.player1.inv.packs.length; i++) {
            let item = c.player1.inv.packs[i];
            invMenu.items[i].item = item;
        }

        for (let i = c.player1.inv.packs.length; i < invMenu.items.length; i++) {
            invMenu.items[i].item = undefined
        }

        for(let craftItem of craftMenu.items ) {
            let inv = new Inventory();
            inv.packsize = c.player1.inv.packsize;
            inv.itemsize = c.player1.inv.itemsize;
            for(let p of c.player1.inv.packs) inv.addItem(p);
            let cost = resName[craftItem.item.id].cost;
            craftItem.item.n = 0;
            while (inv.remItems(cost)) craftItem.item.n++; // how much can be build

           /* if (craftItem.item.n == 0) { // if we can not build at all, check the missing items
                craftItem.receiptCheck = [];
                for(let c of cost) {
                    let existing = inv.getNumberOfItems(c.id);
                    craftItem.receiptCheck.push({id: c.id, n: existing});
                }
            }*/
        }
    }
    if (socketMsg.msg == "updateMapData") { 
        game.map = socketMsg.data;
        updateMap();
        // TOOOO HACKY
        //while(updateMap()==false) updateMap();
    }

    if (socketMsg.msg == "id") console.log("Received: '" + socketMsg.data + "'");
};
