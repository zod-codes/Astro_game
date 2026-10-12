import { DEV_SETTINGS, SHIP_SIZE, TEXT_SIZE } from "./constants.js";

function drawShip(ctx, ship, color = "white") {
    ctx.strokeStyle = color;
    ctx.lineWidth = SHIP_SIZE / 50;
    ctx.beginPath();
    ctx.moveTo( // Nose of the Ship
        ship.x + (4 / 3) * ship.r * Math.cos(ship.a),
        ship.y - (4 / 3) * ship.r * Math.sin(ship.a)
    );
    ctx.lineTo( // Rear Left
        ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) + Math.sin(ship.a)),
        ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) - Math.cos(ship.a))
    );
    ctx.lineTo( // Rear Right
        ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) - Math.sin(ship.a)),
        ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) + Math.cos(ship.a))
    );
    ctx.closePath();
    ctx.stroke();
}

function drawThrusterFlames(ctx, ship) {
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo( // Nose of the Ship
        ship.x + (4 / 3) * ship.r * Math.cos(ship.a),
        ship.y - (4 / 3) * ship.r * Math.sin(ship.a)
    );
    ctx.lineTo( // Rear Left
        ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) + Math.sin(ship.a)),
        ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) - Math.cos(ship.a))
    );
    ctx.lineTo( // Rear Right
        ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) - Math.sin(ship.a)),
        ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) + Math.cos(ship.a))
    );
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = "red";
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = SHIP_SIZE / 30;
    ctx.beginPath();
    ctx.moveTo( // Rear left of La Flame
        ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) + 0.7 * Math.sin(ship.a)),
        ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) - 0.7 * Math.cos(ship.a))
    );
    ctx.lineTo( // La Flame's Center
        ship.x - ship.r * (5 / 3) * Math.cos(ship.a),
        ship.y + ship.r * (5 / 3) * Math.sin(ship.a)
    );
    ctx.lineTo( // Rear Right of La Flame
        ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) - 0.7 * Math.sin(ship.a)),
        ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) + 0.7 * Math.cos(ship.a))
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawAsteroid(ctx, asteroid) {
    ctx.strokeStyle = "brown";
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo(
        asteroid.x + asteroid.r * asteroid.offSets[0] * Math.cos(asteroid.a),
        asteroid.y + asteroid.r * asteroid.offSets[0] * Math.sin(asteroid.a)
    );

    for (let index = 1; index < asteroid.vert; index += 1) {
        ctx.lineTo(
            asteroid.x + asteroid.r * asteroid.offSets[index] * Math.cos(asteroid.a + index * Math.PI * 2 / asteroid.vert),
            asteroid.y + asteroid.r * asteroid.offSets[index] * Math.sin(asteroid.a + index * Math.PI * 2 / asteroid.vert)
        );
    }

    ctx.closePath();
    ctx.stroke();
}

function drawLasers(ctx, ship) {
    ship.lasers.forEach((laser) => {
        if (laser.explodeTime === 0) {
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(laser.x, laser.y, 2, 0, Math.PI * 2, false);
            ctx.fill();
            return;
        }

        ctx.fillStyle = "orangered";
        ctx.beginPath();
        ctx.arc(laser.x, laser.y, ship.r * 0.7, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(laser.x, laser.y, ship.r * 0.4, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = "darkred";
        ctx.beginPath();
        ctx.arc(laser.x, laser.y, ship.r * 0.28, 0, Math.PI * 2, false);
        ctx.fill();
    });
}

export function renderFrame(ctx, canvas, state) {
    // Draw Space
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const blinkOn = state.ship.blinkNumber % 2 === 0;
    const exploding = state.ship.explodeTime > 0;

    if (state.ship.thrusting && !state.ship.dead) {
        drawThrusterFlames(ctx, state.ship);
    }

    if (!exploding && !state.ship.dead && blinkOn) {
        drawShip(ctx, state.ship);
    } else if (exploding) {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(state.ship.x, state.ship.y, state.ship.r * 1.4, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(state.ship.x, state.ship.y, state.ship.r * 1.2, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(state.ship.x, state.ship.y, state.ship.r * 0.4, 0, Math.PI * 2, false);
        ctx.fill();
    }

    if (DEV_SETTINGS.CIRCLE_BOUNDARIES) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(state.ship.x, state.ship.y, state.ship.r, 0, Math.PI * 2, false);
        ctx.stroke();
    }

    state.astroids.forEach((asteroid) => drawAsteroid(ctx, asteroid));
    drawLasers(ctx, state.ship);

    if (state.textAlpha > 0) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = `rgba(255, 255, 255, ${state.textAlpha})`;
        ctx.font = `${TEXT_SIZE}px sans-serif`;
        ctx.fillText(state.text, canvas.width / 2, canvas.height / 2);
    }
}
