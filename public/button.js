class Button {
    constructor(x, y, h, w, t, n = 0, onClick) {
        this.x = x;
        this.y = y;
        this.h = h;
        this.w = w;
        this.t = t;
        this.n = n;
        this.onClick = onClick;
    }

    collision(p) {
        return (p.x > this.x && p.y > this.y && p.x < this.x+ this.w && p.y < this.y + this.h)
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(120, 120, 120, 0.9)";
        ctx.rect(this.x, this.y, this.w, this.h);
        ctx.fill();
        if (this.t) {
            ctx.font = "48px Arial";
            ctx.fillText(this.t, this.x, this.y + 48);
        }
        ctx.font = "24px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(this.n, this.x, this.y + 24);
    }
  }