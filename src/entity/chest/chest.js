if (typeof window === 'undefined') {
    c = require("../../common");
    inventory = require("../../core/inventory");
} 
class Chest extends Inventory{
    constructor(pos, data) {
      super(pos, data);
      data.pos = pos;
      this.setup(undefined, data);
    }

    update(map, ent){

    }

    setup(map, ent) {
        if (this.stack == undefined)  this.stack = {};
        if (this.stack.INV == undefined) this.stack.INV = [];
        this.stack.INV.size = 6;
        this.itemsize = 50;
    }

    draw(ctx, ent) {
      let db = c.resDB.chest;
      ctx.drawImage(db.img, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize, 0, 0, db.size[0]*tileSize, db.size[1]*tileSize);
  }
}
db = c.resDB.chest;
db.size = [1, 1];
db.mach = Chest;
dbrotatable = false;
if (typeof Image !== 'undefined') {
  const image = new Image(512, 32);
  image.src =  "./src/" + db.type + "/chest/chest.png";
  db.img = image;
}
if (exports == undefined) var exports = {};
exports.Chest = Chest;