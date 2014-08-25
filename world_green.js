"use strict";

var world_green = document.getElementById("world_green");

world_green.init = function(inputs) {
    world_green.userCode = [];
    for (var h = 0; h < inputs.length; h++) {
        world_green.userCode.push([]);
        for (var w = 0; w < inputs[h].length; w++) {
            world_green.userCode[h].push(inputs[h][w].checked);
        }
    }

    world_green.digitNumber = inputs[0].length;
    world_green.maxDigitValue = Math.pow(inputs.length, 2) - 1;
    world_green.digitWidth = 0.75 * (world_green.width / world_green.digitNumber);
    world_green.digitHeight = world_green.height * 0.2;
    world_green.codeWidth = world_green.digitNumber * world_green.digitWidth;

    // world_green.secretCode = world_green.getRandomCode();
    world_green.secretCode = world_green.getUserCode(); // DEBUG

    world_green.shutterHeight = 0;
    world_green.shutterSpeed = 2 * world_green.digitHeight; // px/s
    world_green.shutterClosing = false;
    world_green.shutterOpening = false;
};

world_green.getRandomCode = function() {
    var code = [];
    for (var i = 0; i < world_green.digitNumber; i++) {
        var digit = Math.round(world_green.maxDigitValue * Math.random());
        code.push(digit);
    }
    return code;
}

world_green.getUserCode = function() {
    var code = [];
    for (var w = 0; w < world_green.userCode[0].length; w++) {
        var digit = 0;
        for (var h = 0; h < world_green.userCode.length; h++) {
            if (world_green.userCode[h][w]) {
                digit += Math.pow(2, world_green.userCode.length - (h + 1));
            }
        }
        code.push(String(digit));
    }
    return code;
}

world_green.areCodeEquals = function(code1, code2) {
    if (code1.length !== code2.length) {
        return false;
    }
    for (var i = 0; i < code1.length; i++) {
        if (parseInt(code1[i]) !== parseInt(code2[i])) {
            return false;
        }
    }
    return true;
}

world_green.update = function(dt, inputs) {
    for (var h = 0; h < inputs.length; h++) {
        for (var w = 0; w < inputs[h].length; w++) {
            world_green.userCode[h][w] = inputs[h][w].checked;
        }
    }

    if (world_green.areCodeEquals(world_green.getUserCode(), world_green.secretCode)) {
        world_green.shutterOpening = true;
    }

    if (world_green.shutterOpening) {
        world_green.shutterHeight += world_green.shutterSpeed * dt / 1000;
        if (world_green.shutterHeight >= world_green.digitHeight) {
            world_green.shutterOpening = false;
            world_green.secretCode = world_green.getRandomCode();
            world_green.shutterClosing = true;
        }
    }

    if (world_green.shutterClosing) {
        world_green.shutterHeight -= world_green.shutterSpeed * dt / 1000;
        if (world_green.shutterHeight <= 0) {
            world_green.shutterClosing = false;
        }
    }
};

world_green.drawCode = function(ctx, code) {
    for (var c = 0; c < code.length; c++) {
        var digit = code[c];
        ctx.lineWidth = 5;
        ctx.strokeStyle = "GoldenRod";
        ctx.fillStyle = (digit == world_green.secretCode[c] ? "ForestGreen" : "DarkGreen");
        roundRect(ctx,
            c * world_green.digitWidth + c * 3,
            0,
            world_green.digitWidth,
            world_green.digitHeight,
            10,
            true,
            true
        );
        var fontSize = Math.round(0.8 * world_green.digitHeight);
        var font = String(fontSize) + "px Oswald";
        var text = String(digit);
        ctx.font = font;
        while (ctx.measureText(text).width > 0.9 * world_green.digitWidth) {
            fontsize --;
            font = String(fontSize) + "px Oswald";
            ctx.font = font;
        }
        ctx.fillStyle = "GoldenRod";
        ctx.fillText(text,
            c * world_green.digitWidth + c * 3 + world_green.digitWidth/2 - ctx.measureText(text).width / 2,
            (world_green.digitHeight + fontSize) / 2 - 5
        );
    }
}

world_green.drawUserInput = function(ctx) {
    for (var w = 0; w < world_green.userCode[0].length; w++) {
        for (var h = 0; h < world_green.userCode.length; h++) {
            var text = String((world_green.maxDigitValue + 1) / (Math.pow(2, h + 1)));
            ctx.beginPath();
            ctx.fillStyle = world_green.userCode[h][w] ? "GoldenRod" : "black";
            ctx.font = "15px Open Sans";
            ctx.fillText(text,
                (w + 0.5) * world_green.digitWidth - ctx.measureText(text).width / 2,
                h * 15
            );
        }
    }
}

world_green.drawShutter = function(ctx) {
    if (world_green.shutterHeight < 10) {return;}
    for (var c = 0; c < world_green.secretCode.length; c++) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "GoldenRod";
        ctx.fillStyle = "GoldenRod";
        roundRect(ctx,
            c * world_green.digitWidth + c * 3,
            0,
            world_green.digitWidth,
            world_green.shutterHeight,
            10,
            true,
            true
        );
    }
}

world_green.draw = function() {
    var ctx = world_green.getContext("2d");

    ctx.fillStyle = "DarkGreen";
    ctx.rect(0, 0, world_green.width, world_green.height);
    ctx.fill();

    // draw secret code
    ctx.save();
    ctx.translate(
        (world_green.width - world_green.codeWidth) / 2,
        0.1 * world_green.height
    );
    world_green.drawCode(ctx, world_green.secretCode);
    if (world_green.shutterOpening ||world_green.shutterClosing) {
        world_green.drawShutter(ctx);
    }
    ctx.restore();

    // draw user code
    ctx.save();
    ctx.translate(
        (world_green.width - world_green.codeWidth) / 2,
        0.5 * world_green.height
    );
    world_green.drawCode(ctx, world_green.getUserCode());
    ctx.restore();

    // user input
    ctx.save();
    ctx.translate(
        (world_green.width - world_green.codeWidth) / 2,
        0.8 * world_green.height
    );
    world_green.drawUserInput(ctx);
    ctx.restore();
};

// rounded rectangle method
// from http://js-bits.blogspot.be/2010/07/canvas-rounded-corner-rectangles.html

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} radius The corner radius. Defaults to 5;
 * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
 * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == "undefined" ) {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 5;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (stroke) {
    ctx.stroke();
  }
  if (fill) {
    ctx.fill();
  }
}
