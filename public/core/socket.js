const ws        = new WebSocket('ws://192.168.1.22');

function updatePlayerInv(newInv) {
    c.player1.invOb = new Inventory(undefined, {x: 0, y:0});
    c.player1.invOb.packsize = newInv.packsize;
    c.player1.invOb.itemsize = newInv.itemsize;
    c.player1.invOb.addItems(newInv.packs);
    c.player1.inv = c.player1.invOb;
    c.player1.inv.stack = JSON.parse(JSON.stringify(newInv.stack["INV"]));
    c.player1.inv.id = newInv.id;
    delete c.player1.invOb;

    for (let i = 0; i < c.player1.inv.packs.length; i++) {
        let item = c.player1.inv.packs[i];
        invMenu.items[i].item = item;
    }
    let keys = Object.keys(c.player1.inv.stack);
    for (let i = 0; i < keys.length; i++) {
        let item = c.player1.inv.stack[keys[i]];
        invMenu.items[i+c.player1.inv.packs.length].item = item;
        invMenu.items[i+c.player1.inv.packs.length].invKey = "INV";
        invMenu.items[i+c.player1.inv.packs.length].stackPos = i;
        invMenu.items[i+c.player1.inv.packs.length].inv = c.player1.inv;
    }

    for (let i = c.player1.inv.packs.length + keys.length; i < invMenu.items.length; i++) {
        invMenu.items[i].item = undefined
        invMenu.items[i].inv = c.player1.inv;
        invMenu.items[i].invKey = "INV";
        invMenu.items[i].stackPos = i;
    }

    for(let craftItem of craftMenu.items ) {
        let inv = new Inventory();
        inv.packsize = c.player1.inv.packsize;
        inv.itemsize = c.player1.inv.itemsize;
        for(let p of c.player1.inv.packs) inv.addItem(p);
        let cost = resName[craftItem.item.id].cost;
        craftItem.item.n = 0;
        while (inv.remItems(cost)) craftItem.item.n++; // how much can be build
    }
}

ws.onmessage = function(e) {
    let socketMsg = JSON.parse(e.data);

    if (socketMsg.msg == "updateInv") {
        c.allInvs = JSON.parse(JSON.stringify(socketMsg.data));
        updatePlayerInv(c.allInvs[0]);
        if (c.selEntity) {
            let inv = socketMsg.data[c.selEntity.invID];
            setShowInventory(inv);
        }
    }
    if (socketMsg.msg == "updateEntities") {
        c.allEnts = JSON.parse(JSON.stringify(socketMsg.data));
    }
    if (socketMsg.msg == "updatePlayer") {
        updatePlayerInv(socketMsg.data.inv);
    }
    if (socketMsg.msg == "updateMapData") { 
        game.map = socketMsg.data;
        updateMap();
    }

    if (socketMsg.msg == "id") console.log("Received: '" + socketMsg.data + "'");
};
