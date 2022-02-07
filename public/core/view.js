class ViewModule {
    constructor(windowElement) {
        this.win = windowElement;
        this.win.addEventListener("resize", () => {
            this.resize();
        });
        this.resize();
    }

    resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        beltMenu.pos = {x:canvas.width / 2 - 300, y:canvas.height - tileSize};
        invMenu.pos = {x:canvas.width / 2 - buttonSize * 5, y:canvas.height / 2 - buttonSize * 2.5};
        craftMenu.pos = {x:canvas.width / 2 + buttonSize / 2, y:canvas.height / 2 - buttonSize * 2.5};
    }
}