"use strict";

var world_blue = document.getElementById("world_blue");

var WaveCircle = function(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.lifeTime = WaveCircle.maxLifeTime * (Math.random() + 0.5);
    this.life = this.lifeTime;
    this.circleCount = Math.round(3 * Math.random()) + 1;
};

WaveCircle.avgLifeTime = 4; // (unit: s)
WaveCircle.growSpeed = world_blue.width / 2; // radius px / s

WaveCircle.prototype.update = function(dt) {
    this.radius += WaveCircle.growSpeed * dt / 1000;
};

WaveCircle.prototype.draw = function(ctx) {
    // assume 0,0 to be circles' origin
    ctx.save();
    var saveAlpha = ctx.globalAlpha;

    for (i = this.circleCount; i > 0; i--) {
        var ratio = this.circleCount / i;
        ctx.globalAlpha = (this.life / this.lifeTime) / ratio;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(0, 0, this.radius / ratio, 0, Math.PI/2);
    }

    ctx.restore();
    ctx.globalAlpha = saveAlpha;
}

var Fish = function() {

};

world_blue.init = function(inputs) {

};

world_blue.update = function(dt, inputs) {

};

world_blue.draw = function() {

};
