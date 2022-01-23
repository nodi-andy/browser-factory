function render(){ 
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.resetTransform();
    context.scale(camera.zoom, camera.zoom);
    //console.log(camera);
    context.translate(camera.x, camera.y);

    if (city.map) {
        for(let ax = 0; ax < city.map.length; ax++) {
            for(let ay = 0; ay < city.map[ax].length; ay++) {
                context.beginPath();
                let type = city.map[ax][ay][layers.terrain];
                context.fillStyle = mapType[type];
                context.rect(ax*10, ay*10, 11, 11);
                context.fill();
                /*if (type == 6) {
                    context.fillText("🌳", ax*10 - 1, ay*10+5);
                }  */
            }
        }
        for(let ax = 0; ax < city.map.length; ax++) {
            for(let ay = 0; ay < city.map[ax].length; ay++) {
                context.beginPath();
                context.font = "8px Arial";
                let type = city.map[ax][ay][layers.res].id;
                let n = city.map[ax][ay][layers.res].n;
                if (n < 8) context.font = n + "px Arial";
                context.fillStyle = mapType[type];
                if (resDB[Object.keys(resDB)[type]].emo) context.fillText(resDB[Object.keys(resDB)[type]].emo, ax*10, ay*10 + 8);
            }
        }
    }
    if (city && city.w) {
        city.w.forEach((v) => {
            context.beginPath();
            context.font = "10px Arial";
            context.fillText(resDB[v.type].emo, v.x - 1, v.y + 8);
            context.stroke();

        });
        city.population.forEach((p) => {
            context.font = "10px Arial";
            context.fillText("🚶", p.pos.x - 4, p.pos.y + 4);
        });
    }
    context.beginPath();
    context.font = "16px Arial";
    context.fillText("🚶", player1.pos.x-6, player1.pos.y);
    context.stroke();

    context.resetTransform();
    var xpos = beltMenu.pos.x;
    var ypos = beltMenu.pos.y;

    for (let i = 0; i < 11; i++) {
        let invObj = player1.inv[i];
        context.beginPath();
        context.fillStyle = "rgba(120, 120, 120, 0.9)";
        context.rect(xpos, ypos, 60, 60);
        context.fill();

        context.fillStyle = "black";
        context.font = "48px Arial";
        if (invObj) {
            context.fillText(Object.entries(resDB)[invObj.id][1].emo, xpos, ypos + 48);
            context.font = "24px Arial";
            context.fillText(invObj.n, xpos, ypos + 24);
            //menu.items.push(invObj.id);
        } 
        xpos +=60;
    }        

    beltMenu.items.forEach(b => b.draw(context));

    if (invMenu.vis) {
        invMenu.items.forEach(b => b.draw(context));
    }
    if (buildMenu.vis) {
        buildMenu.items.forEach(b => b.draw(context));
    }


    requestAnimationFrame( render );
}