"use strict";

var world_blue = document.getElementById("world_blue");

var WaveCircle = function(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.lifeTime = WaveCircle.avgLifeTime * (Math.random() + 0.5);
    this.life = this.lifeTime;
    this.circleCount = Math.round(3 * Math.random()) + 1;
};

WaveCircle.avgLifeTime = 4; // (unit: s)
WaveCircle.growSpeed = world_blue.width / 10; // radius px / s

WaveCircle.prototype.update = function(dt) {
    this.radius += WaveCircle.growSpeed * dt / 1000;
    this.life -= dt / 1000;
};

WaveCircle.prototype.draw = function(ctx) {
    // assume 0,0 to be circles' origin
    ctx.save();
    var saveAlpha = ctx.globalAlpha;

    for (var i = this.circleCount; i > 0; i--) {
        var ratio = this.circleCount / i;
        ctx.globalAlpha = Math.max(0, (this.life / this.lifeTime) / ratio);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius / ratio, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();
    ctx.globalAlpha = saveAlpha;
}

var Fish = function() {

};

world_blue.init = function(inputs) {

    world_blue.tW = world_blue.width / inputs[0].length;
    world_blue.tH = world_blue.height / inputs.length;

    world_blue.inputs = [];
    for (var h = 0; h < inputs.length; h++) {
        world_blue.inputs.push([]);
        for (var w = 0; w < inputs[h].length; w++) {
            world_blue.inputs[h].push(inputs[h][w].checked);
        }
    }

    this.waveCircles = [];

};

world_blue.update = function(dt, inputs) {
    for (var h = 0; h < inputs.length; h++) {
        for (var w = 0; w < inputs[h].length; w++) {
            if (inputs[h][w].checked !== world_blue.inputs[h][w]) {
                world_blue.inputs[h][w] = inputs[h][w].checked;
                this.waveCircles.push(new WaveCircle(
                    (w + 0.5) * world_blue.tW,
                    (h + 0.5) * world_blue.tH
                ));
            }
        }
    }

    for (var wc = 0; wc < this.waveCircles.length; wc++) {
        var waveCircle = this.waveCircles[wc];
        if (waveCircle.life < 0) {
            this.waveCircles.splice(wc, 1);
            wc--;
        } else {
            waveCircle.update(dt);
        }
    }
};

world_blue.draw = function() {
    var ctx = world_blue.getContext("2d");

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = "RoyalBlue";
    ctx.rect(0, 0, world_blue.width, world_blue.height);
    ctx.fill();
    ctx.restore();

    for (var wc = 0; wc < this.waveCircles.length; wc++) {
        var waveCircle = this.waveCircles[wc];
        ctx.save();
        ctx.translate(waveCircle.x, waveCircle.y);
        ctx.rotate(Math.PI/4);
        // ctx.scale(0, 2);
        waveCircle.draw(ctx);
        ctx.restore();
    }
};
