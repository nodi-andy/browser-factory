//const ws        = new WebSocket('wss:/www.mynodi.com:4000');
const ws        = new WebSocket('ws://localhost:4000');

function wssend(msg) {
    if (c.isBrowser) {
        let updateInv = false;
        if (msg.cmd == "addEntity") {
            let invID = addInventory(msg.data, false);
            updateInv = true; 
        }
        if (msg.cmd == "addItem") {
            addItem(msg.data, false);
            updateInv = true; 
        }
        else if (msg.cmd == "moveStack") {
            moveStack(msg.data);
            updateInv = true; 
        } else {
            if (ws.readyState == WebSocket.OPEN) {
                ws.send(JSON.stringify(msg));
            }
        }

        if (updateInv) {
            if (ws.readyState == WebSocket.OPEN) {
                ws.send(JSON.stringify({cmd: "updateInventories", data:c.allInvs}));
            }
        } 
        //ws.send(JSON.stringify(msg));
    }
}

function updateMapData(data) {
    c.game.map = data;
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
        c.player.setInventoryID(0);
        if (c.selEntity) {
            let inv = socketMsg.data[c.selEntity.id];
            view.updateInventoryMenu(inv);
        }
    }

    if (socketMsg.msg == "serverTick") {
        //c.game.tick = socketMsg.data;
        //console.log("server tick:", c.serverTick);
    }

    if (socketMsg.msg == "updateEntities") {
        c.allInvs = JSON.parse(JSON.stringify(socketMsg.data));
        // Get all movable items
        c.allMovableEntities = [];
        for(let ient = 0; ient < c.allInvs.length; ient++) {
            let entity = c.allInvs[ient];
            if (entity.movable) c.allMovableEntities.push(ient);
        }
    }

    if (socketMsg.msg == "updateEntity") {
        c.allInvs[socketMsg.data.id] = socketMsg.data.ent;
        // Get all movable items
        c.allMovableEntities = [];
        for(let ient = 0; ient < c.allInvs.length; ient++) {
            let entity = c.allInvs[ient];
            if (entity.movable) c.allMovableEntities.push(ient);
        }
        //c.player.setInventory(socketMsg.data.inv, socketMsg.data.invID);
    }
    if (socketMsg.msg == "remEntity") {
        delete c.allInvs[socketMsg.data];
        // Get all movable items
        c.allMovableEntities = [];
        for(let ient = 0; ient < c.allInvs.length; ient++) {
            let entity = c.allInvs[ient];
            if (entity.movable) c.allMovableEntities.push(ient);
        }
        //c.player.setInventory(socketMsg.data.inv, socketMsg.data.invID);
    }
    if (socketMsg.msg == "updateMapData") updateMapData(socketMsg.data);
    if (socketMsg.msg == "startGame") gameLoop();
    if (socketMsg.msg == "setPlayerID") c.playerID = socketMsg.data;
    if (socketMsg.msg == "id") console.log("Received: '" + socketMsg.data + "'");
};

