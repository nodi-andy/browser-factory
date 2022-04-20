if (typeof window === "undefined") {
  c = require("../../common");
  require("../../core/inventory");
  require("../belt/belt.js");
}

class Belt1 extends Belt{
  constructor(pos, data) {
    super(pos, data);
    this.setupBelt(undefined, data);
  }

  setupBelt(map, ent) {
    this.speed = 2;
  }

}

db = c.resDB.belt1;
db.playerCanWalkOn = true;
db.size = [1, 1];
db.cost = [
  { id: c.resDB.iron_plate.id, n: 1 },
  { id: c.resDB.gear.id, n: 1 },
];
if (typeof Image !== "undefined") {
  const image = new Image(512, 32);
  image.src = "./src/" + c.resDB.belt1.type + "/belt1/belt1_anim.png";
  c.resDB.belt1.anim = image;
}
db.mach = Belt1;
exports.Belt1 = Belt1;
