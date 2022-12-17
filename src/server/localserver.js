



self.onmessage = function(n) {
    if (n.data === "start") {
        noise.seed(Math.random());
        var terrainmap = noise.perlin2(Settings.gridSize.x, Settings.gridSize.y).map(function(x) { return ((x+1) * 5); });
        self.postMessage(terrainmap);
    }
}

