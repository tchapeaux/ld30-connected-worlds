"use strict";

var world_laby = document.getElementById("world_labyrinth");

/* Mini-Game: Labyrinth
    A group of people are in a maze, the input defines which walls are open or closed
    A crystal is in some cell, the people try to reach it
    When someone reach the crystal, it moves to another cell
*/

var Cell = function (x0, y0) {
    this.x0 = x0;
    this.y0 = y0;
    this.active = false;
};

Cell.prototype.draw = function(ctx) {
    ctx.save();
    if (this.active) {
        // cell
        ctx.beginPath();
        ctx.fillStyle = this.active ? "SlateGray" : "white";
        ctx.rect(this.x0, this.y0, world_laby.tW, world_laby.tH);
        ctx.fill();
    }
    ctx.restore();
};

Cell.prototype.drawShadow = function(ctx) {
    ctx.save();
    if (this.active) {
        var shadowDepth = 3;
        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.rect(this.x0 + shadowDepth,
            this.y0 + shadowDepth, world_laby.tW, world_laby.tH
        );
        ctx.fill();
    }
    ctx.restore();
}

Cell.prototype.isInside = function(x, y) {
    return x >= this.x0 && x <= this.x0 + world_laby.tW && y >= this.y0 && y <= this.y0 + world_laby.tH;
};

var Guy = function(x, y) {
    this.x = x;
    this.y = y;
    this.radius = Math.round(world_laby.height / 30 * Math.random());
    this.maxSpeed = Math.round(10 * Math.random()) + 30;
    this.speed = 0;
    this.acc = 30; // px/s/s
};

Guy.snapDistance = 3; //px

Guy.prototype.update = function(dt) {
    var target = world_laby.crystal;
    var dx = target.x - this.x;
    var dy = target.y - this.y;
    // var angl = Math.atan2(dy, dx);
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= Guy.snapDistance) {
        this.x = target.x;
        this.y = target.y;
    } else {
        var speedX = this.speed * (dx / dist);
        var speedY = this.speed * (dy / dist);
        // if (this.speed != 0) {console.log(this.speed, speedX, speedY);}
        this.x += dt / 1000 * speedX;
        this.y += dt / 1000 * speedY;
    }

    this.speed += dt / 1000 * this.acc;
    this.speed = Math.min(this.speed, this.maxSpeed);

    // random movement
    this.x += Math.round(2 * (Math.random() - 0.5));
    this.y += Math.round(2 * (Math.random() - 0.5));

    // collision with cells
    for (var h = 0; h < world_laby.cells.length; h++) {
        for (var w = 0; w < world_laby.cells[0].length; w++) {
            var cell = world_laby.cells[h][w];
            if (cell.active && cell.isInside(this.x, this.y)) {
                this.speed = 0;
                // snap to closest wall
                var distUP = this.y - cell.y0;
                var distDOWN = cell.y0 + world_laby.tH - this.y;
                var distLEFT = this.x - cell.x0;
                var distRIGHT = cell.x0 + world_laby.tW - this.x;
                var distMIN = Math.min(distUP, distDOWN, distLEFT, distRIGHT);
                if (distUP >= 0 && distMIN === distUP) {
                    this.y = cell.y0;
                } else if (distDOWN >= 0 && distMIN === distDOWN) {
                    this.y = cell.y0 + world_laby.tH;
                } else if (distLEFT >= 0 && distMIN === distLEFT) {
                    this.x = cell.x0;
                } else if (distRIGHT >= 0 && distMIN === distRIGHT) {
                    this.x = cell.x0 + world_laby.tW;
                }
            }
        }
    }

    // collision with other guys
    for (var g = 0; g < world_laby.people.length; g++) {
        var otherGuy = world_laby.people[g];
        if (otherGuy != this) {
            var dx = this.x - otherGuy.x;
            var dy = this.y - otherGuy.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= this.radius + otherGuy.radius)
                if (this.radius < otherGuy.radius) {
                    otherGuy.push(this);
                } else {
                    this.push(otherGuy);
                }
        }
    }

    // world_laby limits
    this.x = Math.max(0, this.x);
    this.y = Math.max(0, this.y);
    this.x = Math.min(this.x, world_laby.width);
    this.y = Math.min(this.y, world_laby.height);

};

Guy.prototype.push = function(otherGuy) {
    var dx = otherGuy.x - this.x;
    var dy = otherGuy.y - this.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= 0.01) { otherGuy.x -= 10; dist = 10; }
    dx /= dist;
    dy /= dist;
    var newDist = this.radius + otherGuy.radius;
    otherGuy.x = this.x + dx * newDist;
    otherGuy.y = this.y + dx * newDist;
};

Guy.prototype.draw = function(ctx) {
    ctx.save();
    ctx.beginPath();

    ctx.beginPath();
    ctx.fillStyle = "green";
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
};

var Crystal = function() {
    this.findCell();
    this.size = world_laby.tH / 3;
};

Crystal.blinkTime = 0.25; //s

Crystal.prototype.findCell = function() {
    var cellY = Math.round((world_laby.cells.length - 1) * Math.random());
    var cellX = Math.round((world_laby.cells[0].length - 1) * Math.random());
    var x = (cellX + 0.5) * world_laby.tW;
    var y = (cellY + 0.5) * world_laby.tH;
    this.x = x;
    this.y = y;
    world_laby.blink = Crystal.blinkTime;
};

Crystal.prototype.update = function(dt) {
    for (var g = 0; g < world_laby.people.length; g++) {
        var guy = world_laby.people[g];
        var dx = this.x - guy.x;
        var dy = this.y - guy.y;
        var squared_dist = dx * dx + dy * dy;
        if (squared_dist < this.size * this.size) {
            this.findCell();
        }
    }
};

Crystal.prototype.draw = function(ctx) {
    ctx.save();
    ctx.fillStyle = "DarkMagenta";
    ctx.beginPath();
    ctx.rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    ctx.fill();
    ctx.restore();
};

world_laby.init = function(inputs) {
    world_laby.tH = world_laby.height / inputs.length; // tile Height
    world_laby.tW = world_laby.width / inputs[0].length; // tile Width

    world_laby.cells = [];
    for (var h = 0; h < inputs.length; h++) {
        world_laby.cells.push([]);
        for (var w = 0; w < inputs[h].length; w++) {
            var cell = new Cell(w * world_laby.tW, h * world_laby.tH);
            cell.active = inputs[h][w].checked;
            world_laby.cells[h].push(cell);
        }
    }
    world_laby.people = [];
    var populationCount = 10;
    for (var g = 0; g < populationCount; g++) {
        world_laby.people.push(new Guy(
            world_laby.width / 2 - world_laby.tW / 2 + Math.round((world_laby.tW - 1) * Math.random()),
            world_laby.height / 2 - world_laby.tH / 2 + Math.round((world_laby.tH - 1) * Math.random())
            ));
    }
    world_laby.crystal = new Crystal();
    world_laby.blink = 0;
};

world_laby.update = function(dt, inputs) {
    for (var h = 0; h < inputs.length; h++) {
        for (var w = 0; w < inputs[h].length; w++) {
            world_laby.cells[h][w].active = inputs[h][w].checked;
        }
    }
    for (var g = 0; g < world_laby.people.length; g++) {
        world_laby.people[g].update(dt);
    }
    world_laby.crystal.update(dt);

    if (world_laby.blink > 0) {
        world_laby.blink -= dt / 1000;
    }
};

world_laby.draw = function() {
    var ctx = world_laby.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.rect(0, 0, world_laby.width, world_laby.height);
    ctx.fill();

    if (world_laby.blink > 0) {
        ctx.beginPath();
        ctx.fillStyle = "DarkMagenta";
        ctx.globalAlpha = world_laby.blink / Crystal.blinkTime;
        ctx.rect(0, 0, world_laby.width, world_laby.height);
        ctx.fill();
        ctx.globalAlpha = 1;
    }


    // draw all cells shadow
    for (var h = 0; h < world_laby.cells.length; h++) {
        for (var w = 0; w < world_laby.cells[h].length; w++) {
            world_laby.cells[h][w].drawShadow(ctx);
        }
    }
    // draw people
    for (var g = 0; g < world_laby.people.length; g++) {
        world_laby.people[g].draw(ctx);
    }
    // draw all cells
    for (var h = 0; h < world_laby.cells.length; h++) {
        for (var w = 0; w < world_laby.cells[h].length; w++) {
            world_laby.cells[h][w].draw(ctx);
        }
    }
    world_laby.crystal.draw(ctx);
};
