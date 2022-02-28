const ws        = new WebSocket('ws://localhost/browser-factorio');

function wssend(msg) {
    if (c.isBrowser) {
        let updateInv = false;
        if (msg.cmd == "addEntity") {
            addEntity(msg.data, false);
            updateInv = true; 
            ws.send(JSON.stringify({cmd: "updateEntities", data: c.allEnts}));
            ws.send(JSON.stringify({cmd: "updateMapData", data: c.game.map}));
        }
        if (msg.cmd == "addItem") {
            addItem(msg.data, false);
            updateInv = true; 
        }
        else if (msg.cmd == "moveStack") {
            moveStack(msg.data);
            updateInv = true; 
        }

        if (updateInv) ws.send(JSON.stringify({cmd: "updateInventories", data:c.allInvs}));
        //ws.send(JSON.stringify(msg));
    }
}

function updateMapData(data) {
    game.map = data;
    updateMap();
}

ws.onerror = function (e) {
    /*var localServer = new Worker('../server/localserver.js');
    localServer.postMessage("start");
    webworker.onmessage = function(n) {
        alert("Ergebnis: " + n.data);
    };*/
    console.log('WebSocket error: ', e);
}

ws.onmessage = function(e) {
    let socketMsg = JSON.parse(e.data);

    if (socketMsg.msg == "updateInventories") {
        rawInvs = JSON.parse(JSON.stringify(socketMsg.data));
        c.allInvs = [];
        for(let inv of rawInvs) {
            c.allInvs.push(Object.assign(new Inventory(), inv));
        }
        c.player1.setInventoryID(0);
        if (c.selEntity) {
            let inv = socketMsg.data[c.selEntity.invID];
            showInventory(inv);
        }
    }

    if (socketMsg.msg == "serverTick") {
        //c.game.tick = socketMsg.data;
        //console.log("server tick:", c.serverTick);
    }

    if (socketMsg.msg == "updateEntities") {
        c.allEnts = JSON.parse(JSON.stringify(socketMsg.data));
    }
    if (socketMsg.msg == "updatePlayer") {
        c.player1.setInventory(socketMsg.data.inv);
        //c.player1 = JSON.parse(JSON.stringify(socketMsg.data));
    }
    if (socketMsg.msg == "updatePlayerInv") {
        c.player1.invID = socketMsg.data;
    }
    if (socketMsg.msg == "updateMapData") updateMapData(socketMsg.data);
    if (socketMsg.msg == "startGame") gameLoop();

    if (socketMsg.msg == "id") console.log("Received: '" + socketMsg.data + "'");
};

