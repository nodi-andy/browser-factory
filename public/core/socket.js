const ws        = new WebSocket('ws://192.168.1.22');

function updatePlayerInv(newInv) {
    c.player1.inv.stack = JSON.parse(JSON.stringify(newInv.stack));
//    let invOb = new Inventory(undefined, {x: 0, y:0});
    c.player1.inv.packsize = newInv.packsize;
    c.player1.inv.itemsize = newInv.itemsize;
    //c.player1.inv = c.player1.invOb;
    c.player1.inv.id = newInv.id;

    let pack = c.player1.inv.stack["INV"];
    
    for (let i = 0; i < pack.length; i++) {
        let item = pack[i];
        invMenu.items[i].item = item;
        invMenu.items[i].inv = c.player1.inv;
        invMenu.items[i].invKey = "INV";
        invMenu.items[i].stackPos = i;
    }

    for (let i = pack.length; i < invMenu.items.length; i++) {
        invMenu.items[i].item = undefined
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
