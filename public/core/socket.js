const ws        = new WebSocket('ws://192.168.1.22');
ws.onmessage = function(e) {
    let socketMsg = JSON.parse(e.data);

    if (socketMsg.msg == "updateInv") {
        allInvs = JSON.parse(JSON.stringify(socketMsg.data));
    }
    if (socketMsg.msg == "updateEntities") {
        allEnts = JSON.parse(JSON.stringify(socketMsg.data));
    }
    if (socketMsg.msg == "updatePlayer") {
        player1 = socketMsg.data;
        player1.invOb = new Inventory(undefined, {x: 0, y:0});
        player1.invOb.packsize = 10;
        player1.invOb.addItems(player1.inv.packs);
        player1.inv = player1.invOb;
        delete player1.invOb;

        for (let i = 0; i < player1.inv.packs.length; i++) {
            let item = player1.inv.packs[i];
            invMenu.items[i].item = item;
        }

        for (let i = player1.inv.packs.length; i < invMenu.items.length; i++) {
            invMenu.items[i].item = undefined
        }
    }
    if (socketMsg.msg == "updateMap") { game = socketMsg.data; }
    if (socketMsg.msg == "updateMapData") { game.map = socketMsg.data; updateMap();}

    if (socketMsg.msg == "id") console.log("Received: '" + socketMsg.data + "'");
};
