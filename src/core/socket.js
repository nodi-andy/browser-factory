
const ws        = new WebSocket('ws://192.168.1.22');

function updatePlayerInv(newInv, newID) {
    c.allInvs[c.player1.invID].stack = JSON.parse(JSON.stringify(newInv.stack));;
    c.allInvs[c.player1.invID].packsize = newInv.packsize;
    c.allInvs[c.player1.invID].itemsize = newInv.itemsize;
    
    let currentID = c.allInvs[c.player1.invID].id;
    if (newInv.id != undefined) { c.player1.invID = newInv.id; c.allInvs[c.player1.invID].id = newID; }
    else if (newID != undefined) { c.player1.invID = newID; c.allInvs[c.player1.invID].id = newID; }

    if(c.allInvs[c.player1.invID].id == undefined) c.allInvs[c.player1.invID].id = currentID;
    c.player1.inv = c.allInvs[c.player1.invID];
    view.updateInventoryMenu(c.player1.inv);
    ws.send(JSON.stringify({cmd: "updatePlayerInv", data: c.player1.inv}));
}



function wssend(msg) {

    if (msg.cmd == "addEntity") addEntity(msg.data, false);
    else if (msg.cmd == "addItem") addItem(msg.data, false);
    else if (msg.cmd == "moveStack") moveStack(msg.data);
    else     ws.send(JSON.stringify(msg));
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
        updatePlayerInv(c.allInvs[0], 0);
        if (c.selEntity) {
            let inv = socketMsg.data[c.selEntity.invID];
            setShowInventory(inv);
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
        updatePlayerInv(socketMsg.data.inv);
        //c.player1 = JSON.parse(JSON.stringify(socketMsg.data));
    }
    if (socketMsg.msg == "updatePlayerInv") {
        updatePlayerInv(socketMsg.data);
    }
    if (socketMsg.msg == "updateMapData") updateMapData(socketMsg.data);

    if (socketMsg.msg == "id") console.log("Received: '" + socketMsg.data + "'");
};

