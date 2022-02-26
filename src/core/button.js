class Button {
    constructor(x, y, item, parent, inv) {
        this.x = x;
        this.y = y;
        this.h = buttonSize;
        this.w = buttonSize;
        this.item = item;
        this.inv = inv;
        this.invKey = "";
        this.stackPos = 0;
        this.parent = parent;
        this.hover = false;
        if (this.parent) this.screen = {x: this.parent.pos.x + this.x, y: this.parent.pos.y + this.y}
        else this.screen = {x: 0, y: 0}
    }

    collision(p) {
        if (this.parent == undefined) return false;
        if (this.parent.vis == false || this.screen.x < this.parent.pos.x || this.screen.x > (this.parent.pos.x + this.parent.w)) return false;
        return this.parent.vis && (p.x >= this.screen.x && p.y >= this.screen.y && p.x <= this.screen.x + this.w && p.y <= this.screen.y + this.h)
    }

    draw(ctx) {
        if (this.parent.vis == false) return;
        if (this.parent) this.screen = {x: this.parent.pos.x + this.x, y: this.parent.pos.y + this.y}
        else this.screen = {x: 0, y: 0}
        ctx.beginPath();

        if (this.hover) {
            if (this.type == "craft") receiptMenu.item = this.item; 
            else receiptMenu.item = undefined;
        }

        if (this.hover) ctx.fillStyle = "rgba(100, 100, 0, 1)";
        else ctx.fillStyle = "rgba(60, 60, 60, 0.9)";
        ctx.rect(this.screen.x, this.screen.y, this.w, this.h);
        ctx.fill();
        ctx.stroke();
        if (this.item == undefined) {
            this.item = this.inv.stack[this.invKey][this.stackPos];
        }
        this.drawItem(ctx);
    }

    drawItem(ctx) {
        if (this.item != undefined) {
            if (this.img) {
                ctx.drawImage(this.img, this.screen.x, this.screen.y);
            } else if (this.item.id && resName[this.item.id].img) {
                ctx.drawImage(resName[this.item.id].img, this.screen.x + 2, this.screen.y + 2);
            }

            if (this.item.n!= undefined) {
                ctx.font = "24px Arial";
                ctx.fillStyle = "white";
                ctx.fillText(this.item.n, this.screen.x, this.screen.y + buttonSize);
            }
        }
    }

    onClick(button) {
        if (button == 1) {
            if (c.pointer?.item) {
                let tempItem;
                if (this.item?.id == c.pointer.item?.id) {
                    this.item.n += c.pointer.item.n;
                } else {
                    if (this.item) {
                        tempItem = this.item;
                        this.inv.remPack(this.invKey, this.stackPos);
                    }
                    this.inv.addPack(this.invKey, this.stackPos, c.pointer.item);
                }
                if (tempItem?.n) c.pointer.item = tempItem;
                else c.pointer.item = undefined;
            } else {
                c.pointer.item = {id:this.item.id, n: this.item.n};
                this.inv.remPack(this.invKey, this.stackPos);
            }
            view.updateInventoryMenu(this.inv);
            if (c.selEntity?.inv) showInventory(c.selEntity.inv);
        } else if (button == 3) {
            if (c.pointer.item) {
                let transfer = Math.round(c.pointer.item.n / 2)
                c.pointer.item.n -= transfer;
                c.pointer.button.item.n += transfer;
            } else {
                c.pointer.button = this;
                c.pointer.item = {id:this.item.id, n: this.item.n};
                c.pointer.item.n = Math.round(c.pointer.item.n / 2);
                this.item.n = this.item.n - c.pointer.item.n;
            }

        }
    };

  }