class Button {
    constructor(x, y, item, parent, onClick, img) {
        this.x = x;
        this.y = y;
        this.h = buttonSize;
        this.w = buttonSize;
        this.item = item;
        this.img = img;
        this.parent = parent;
        this.hover = false;
        if (this.parent) this.screen = {x: this.parent.pos.x + this.x, y: this.parent.pos.y + this.y}
        else this.screen = {x: 0, y: 0}
    }

    collision(p) {
        if (this.parent == undefined) return false;
        if (this.parent.vis == false || this.screen.x < this.parent.pos.x || this.screen.x > (this.parent.pos.x + this.parent.w)) return false;
        return this.parent.vis && (p.x > this.screen.x && p.y > this.screen.y && p.x < this.screen.x + this.w && p.y < this.screen.y + this.h)
    }

    draw(ctx) {
        if (this.parent.vis == false) return;
        if (this.parent) this.screen = {x: this.parent.pos.x + this.x, y: this.parent.pos.y + this.y}
        else this.screen = {x: 0, y: 0}
        ctx.beginPath();

        if (this.hover) {
            if (this.type && this.type == "craft") receiptMenu.item = this.item; else receiptMenu.item = undefined;
        }

        if (this.hover) ctx.fillStyle = "rgba(100, 100, 0, 1)";
        else ctx.fillStyle = "rgba(60, 60, 60, 0.9)";
        ctx.rect(this.screen.x, this.screen.y, this.w, this.h);
        ctx.fill();
        if (this.item != undefined) {
            if (this.img) {
                context.drawImage(this.img, this.screen.x, this.screen.y)
            } else if (this.item.id && resName[this.item.id].img) {
                context.drawImage(resName[this.item.id].img, this.screen.x + 2, this.screen.y + 2)
            }

            if (this.item.n!= undefined) {
                ctx.font = "24px Arial";
                ctx.fillStyle = "white";
                ctx.fillText(this.item.n, this.screen.x, this.screen.y + buttonSize);
            }
        }
    }

    onClick() {
        if (pointerButton.id == undefined) {
            pointerButton.inv = c.player1.inv;
            pointerButton.id = this.item.id;
            pointerButton.type = resName[this.item.id].type;
        }
    };

  }