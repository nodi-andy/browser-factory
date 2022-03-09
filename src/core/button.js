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
        if (this.parent) this.screen = {x: this.parent.rect.x + this.x, y: this.parent.rect.y + this.y}
        else this.screen = {x: 0, y: 0}
    }

    collision(p) {
        if (this.parent == undefined) return false;
        if (this.parent.vis == false || this.screen.x < this.parent.rect.x || this.screen.x > (this.parent.rect.x + this.parent.w)) return false;
        return this.parent.vis && (p.x >= this.screen.x && p.y >= this.screen.y && p.x <= this.screen.x + this.w && p.y <= this.screen.y + this.h)
    }

    draw(ctx) {
        if (this.parent.vis == false) return;
        if (this.parent) this.screen = {x: this.parent.rect.x + this.x, y: this.parent.rect.y + this.y}
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
        if (this.item == undefined && this.inv?.stack) {
            this.item = this.inv.stack[this.invKey][this.stackPos];
        }
        this.drawItem(ctx);
    }

    drawItem(ctx) {
        if (this.item != undefined) {
            if (this.img) { // special image
                ctx.drawImage(this.img, this.screen.x, this.screen.y);
            } else if (this.item.id && resName[this.item.id].img) { // standard image
                ctx.drawImage(resName[this.item.id].img, this.screen.x + 2, this.screen.y + 2);
            }

            if (this.item?.id && resName[this.item.id].lock) {
                ctx.beginPath();
                ctx.fillStyle = "rgb(200, 100, 100, 0.3)";
                ctx.rect(this.screen.x, this.screen.y, buttonSize, buttonSize);
                ctx.fill();
            }

            if (this.item.n!= undefined) {
                ctx.font = "24px Arial";
                ctx.fillStyle = "white";
                ctx.fillText(this.item.n, this.screen.x, this.screen.y + buttonSize);
            }
        }
    }

    onClick(button) {
        if (this.item?.id && resName[this.item?.id].lock == 1) return;
        if (button == 1) {
            if (c.pointer?.item) {
                let tempItem;
                if (this.item?.id == c.pointer.item?.id) {
                    this.item.n += c.pointer.item.n;
                } else {
                    if (this.item?.id) {
                        tempItem = this.item;
                        this.inv.remPack(this.invKey, this.stackPos);
                    }
                    if (c.pointer.item) {
                        this.inv.addPack(this.invKey, this.stackPos, c.pointer.item);
                    }
                }
                if (tempItem?.n) c.pointer.item = tempItem;
                else c.pointer.item = undefined;
            } else {
                c.pointer.inv = this.inv;
                c.pointer.invKey = this.invKey;
                c.pointer.item = {id:this.item?.id, n: this.item?.n};
                this.inv.remPack(this.invKey, this.stackPos);
            }
        } else if (button == 3) {
            c.pointer.button = this;
            if (c.pointer.item) {
                let transfer = Math.round(c.pointer.item.n / 2)
                c.pointer.item.n -= transfer;
                if (c.pointer.button?.item?.n) {
                    c.pointer.button.item.n += transfer;
                } else {
                    let item = {id: c.pointer.item.id, n: transfer};
                    c.pointer.inv.addItem(item)
                }
            } else {
                c.pointer.item = {id:this.item?.id, n: this.item?.n};
                c.pointer.item.n = Math.round(c.pointer.item.n / 2);
                this.item.n = this.item.n - c.pointer.item.n;
            }
        }
        view.updateInventoryMenu(c.player);
        if (c.selEntity?.inv) view.updateEntityMenu(c.selEntity.inv, true);
    };

  }