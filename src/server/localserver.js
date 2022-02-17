



self.onmessage = function(n) {
    if (n.data == "start") {
        noise.seed(Math.random());
        var terrainmap = noise.perlin2(c.gridSize.x, c.gridSize.y).map(function(x) { return ((x+1) * 5); });
        self.postMessage(terrainmap);
    }
}

