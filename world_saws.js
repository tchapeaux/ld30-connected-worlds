"use strict";

var world_saws = document.getElementById("world_saws");

var Saw = function(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.sawAngle = 0;
    this.sawRadius = world_saws.tH / 2;
    this.angularSpeed = Math.PI / 2; // rad/s
    this.armLength = 3 * Math.min(world_saws.tH, world_saws.tW) / 4;
    this.active = false;
};

Saw.prototype.getSawBox = function() {
    var x = this.x + this.armLength * Math.cos(this.angle) - this.sawRadius/2;
    var y = this.y + this.armLength * Math.sin(this.angle) - this.sawRadius/2;
    return [x, y, this.sawRadius, this.sawRadius];
};

Saw.img = new Image();
Saw.img.src = "img/circular_sparks_gray.png";

Saw.prototype.update = function(dt) {
    this.angle += dt / 1000 * this.angularSpeed;
    if (this.angle > 2 * Math.PI) { this.angle %= 2 * Math.PI; }
};

Saw.prototype.draw = function(ctx) {
    if (this.active) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.fillStyle = "gray";
        ctx.arc(this.x, this.y, world_saws.tH / 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        var sawBox = this.getSawBox();
        ctx.lineWidth = world_saws.tH / 20;
        ctx.lineTo(sawBox[0] + this.sawRadius/2, sawBox[1] + this.sawRadius/2);
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.translate(sawBox[0] + this.sawRadius/2, sawBox[1] + this.sawRadius/2);
        ctx.drawImage(Saw.img, -this.sawRadius/2, -this.sawRadius/2, this.sawRadius, this.sawRadius);
        ctx.rotate(Math.PI / 4);
        ctx.globalAlpha = 0.5;
        ctx.drawImage(Saw.img, -this.sawRadius/2, -this.sawRadius/2, this.sawRadius, this.sawRadius);
        ctx.globalAlpha = 1;
        ctx.restore();
    }
};

var Crosser = function() {
    this.x = -10;
    var wH = world_saws.height;
    this.y = Math.round(0.1 * wH + 0.8 * wH * Math.random());
    this.speedX = 15 + Math.round(10 * Math.random());
    this.frameTime = 0;
    this.frame = 0;
    this.framerate = 100 + this.speedX * 2; // ms/frame
    this.alive = true;
};

Crosser.sprite = new Image();
Crosser.sprite.src = "img/run_custom.png";
Crosser.spriteSize = 16; //px
Crosser.size = world_saws.height / 20;
Crosser.frameCount = 3;

Crosser.prototype.update = function(dt) {
    this.x += this.speedX * dt / 1000;
    // collisions with saw
    for (var h = 0; h < world_saws.saws.length; h++) {
        for (var w = 0; w < world_saws.saws[h].length; w++) {
            var saw = world_saws.saws[h][w];
            if (saw && saw.active) {
                var sawBox = saw.getSawBox();
                if (this.x > sawBox[0] && this.x < sawBox[0] + sawBox[2] &&
                    this.y > sawBox[1] && this.y < sawBox[1] + sawBox[3]) {
                    this.alive = false;
                    world_saws.splats.push(new Splat(this.x, this.y));
                }
            }
        }
    }
    this.frameTime += dt;
    if (this.frameTime > this.framerate) {
        this.frame += 1;
        this.frame %= Crosser.frameCount;
        this.frameTime %= this.framerate;
    }

};

Crosser.prototype.draw = function(ctx) {
    ctx.save();
    ctx.drawImage(
        Crosser.sprite,
        this.frame * Crosser.spriteSize,
        0,
        Crosser.spriteSize,
        Crosser.spriteSize,
        this.x - Crosser.size/2,
        this.y - Crosser.size/2,
        Crosser.size,
        Crosser.size
    );
    ctx.restore();
};

var Villager = function() {
    this.x = 0.95 * world_saws.width;
    var wH = world_saws.height;
    this.y = Math.round(0.1 * wH + 0.8 * wH * Math.random());
    this.alive = true;
};

Villager.img = new Image();
Villager.img.src = "img/run_villager.png";



var Splat = function(x, y) {
    this.x = x;
    this.y = y;
    this.time = Splat.lifespan;
}

Splat.lifespan = 5; //s
Splat.sprite = new Image();
Splat.sprite.src = "img/splat_red.png";
Splat.spriteSize = 16;
Splat.size = world_saws.height / 15;

Splat.prototype.update = function(dt) {
    this.time -= dt / 1000;
}

Splat.prototype.draw = function(ctx) {
    ctx.save();
    ctx.globalAlpha = this.time / Splat.lifespan;
    ctx.drawImage(Splat.sprite, this.x - Splat.size/2, this.y - Splat.size/2, Splat.size, Splat.size);
    ctx.globalAlpha = 1;
    ctx.restore();
};

world_saws.init = function(inputs) {
    // tH, tW: tile height & width
    world_saws.tH = world_saws.height / inputs.length;
    world_saws.tW = 0.8 * world_saws.width / inputs[0].length;
    world_saws.saw_offset = 0.1 * world_saws.width;
    world_saws.saws = [];
    for (var h = 0; h < inputs.length; h++) {
        world_saws.saws.push([]);
        for (var w = 0; w < inputs[h].length; w++) {
            world_saws.saws[h].push(new Saw(
                world_saws.saw_offset + (w + 0.5) * world_saws.tW,
                (h + 0.5) * world_saws.tH)
            );
            if (inputs[h][w].checked) {
                world_saws.saws[h][w].active = true;
            }
        }
    }
    world_saws.crossers = [];
    world_saws.crosserMaxCount = 10;
    world_saws.newCrosserRate = 1;
    world_saws.newCrosserTimer = 0;

    world_saws.splats = [];
};

world_saws.update = function(dt, inputs) {
    for (var h = 0; h < inputs.length; h++) {
        for (var w = 0; w < inputs[h].length; w++) {
            var saw = world_saws.saws[h][w];
            saw.active = inputs[h][w].checked;
            saw.update(dt);
        }
    }

    world_saws.newCrosserTimer += dt / 1000;
    if (world_saws.newCrosserTimer > world_saws.newCrosserRate &&
        world_saws.crossers.length < world_saws.crosserMaxCount) {
        world_saws.newCrosserTimer %= world_saws.newCrosserRate;
        world_saws.crossers.push(new Crosser());
    }

    var newCrossers = [];
    for (var c = 0; c < world_saws.crossers.length; c++) {
        var cross = world_saws.crossers[c];
        if (cross.alive && cross.x < world_saws.width + 10) {
            cross.update(dt);
            newCrossers.push(cross);
        } else {
            if (cross.alive) {
                // TODO: points
            }
        }
    }
    world_saws.crossers = newCrossers;

    for (var s = 0; s < world_saws.splats.length; s++) {
        var splat = world_saws.splats[s];
        splat.update(dt);
        if (splat.time < 0) {
            world_saws.splats.splice(s, 1);
            s--;
        }
    }
};

world_saws.draw = function() {
    var ctx = world_saws.getContext("2d");
    ctx.beginPath();
    ctx.fillStyle = "Tomato";
    ctx.rect(0, 0, world_saws.width, world_saws.height);
    ctx.fill();

    for (var s = 0; s < world_saws.splats.length; s++) {
        var splat = world_saws.splats[s];
        splat.draw(ctx);
    }

    // saws
    for (var h = 0; h < world_saws.saws.length; h++) {
        for (var w = 0; w < world_saws.saws[h].length; w++) {
            var saw = world_saws.saws[h][w];
            saw.draw(ctx);
        }
    }

    for (var c = 0; c < world_saws.crossers.length; c++) {
        var cross = world_saws.crossers[c];
        cross.draw(ctx);
    }
};
