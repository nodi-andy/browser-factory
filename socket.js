
if (typeof window === 'undefined') {
    var c = require('./src/common.js');
} 

const users = new Map();

function sendAll(message, except) {
    users.forEach((val, key) => {
        if (except != key) val.ws.send(message);
    })
}
  


if (exports == undefined) var exports = {};
exports.sendAll = sendAll;
exports.users = users;