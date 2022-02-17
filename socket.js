
if (typeof window === 'undefined') {
    var c = require('./src/common.js');
} 

const users = new Map();

function sendAll(message) {
    users.forEach((val, key) => {
        val.send(message);
    })
}
  


if (exports == undefined) var exports = {};
exports.sendAll = sendAll;
exports.users = users;