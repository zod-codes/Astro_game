import { randomNumber, NthCall } from "./utilities.js";

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const FPS = 30; // Frames per Second
const FRICTION = 0.7; // Friction coefficient
const GAME_LIVES = randomNumber(5, 3); // Starting Number of Lives
const LASER_EXPLOSION_DURATION = 0.05; // Duration of the lasers' Exploding in Seconds
const LASER_DISTANCE = 0.3; // Max Distance a Laser can Travel
const LASER_MAX = 25; // Max Number of Lasers
const LASER_SPEED = 500; // Speed of Lasers in Pixels per Sec
const ASTROID_JAGEDNESS = 0.5; // Jagedness of the Astroids
const ASTROIDS_NUMBER = 2; // Starting Number of Astroids
const ASTROID_SIZE = randomNumber(80, 50); // Starting Size of Astroids in Pixels
const ASTROIDS_SPEED = 40; // Max starting Speed of Astroids in Pixels per Sec
const ASTROID_VERTICIES = 10; // Number of Vretices
const SAVE_KEY_SCORE = "Highscore"; // Save key for LocalStorage of Highscore
const ASTROID_POINTS = {  // Points per Astroid
    large: 8,
    medium: 15,
    small: 30
}
const SHIPS_EXPLOSION_DURATION = 0.2; // Duration of the Ship Exploding
const SHIPS_BLINK_DURATION = 0.09; // Duration of the Ship's Blink During GM in Sec 
const SHIPS_INVULNERABILITY_DURATION = 1; // Duration of the Ship's God Mode in Sec 
const SHIP_SIZE = 30; // Measurement in Pixels
const ROTATION_SPEED = 360; // In Degrees per Sec
const SHIP_THRUST = 5; // Acceleration in Pixels per Sec
const TEXT_FADE_TIME = 3.0; // Text Fade in Sec
const TEXT_SIZE = 20; // Text Size in Pixels
const DEV_SETTINGS = {
    CENTER_DOT: false,
    CIRCLE_BOUNDARIES: false
};

// Setting up the Game Params
let level, lives, astroids, score, highScore, ship, text, textAlpha;
newGame();

// Event Handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// Setting up the gameloop
setInterval(update, 1000 / FPS);

function createAstroidBelt() {
    astroids = [];
    let x, y;
    for (let i = 0; i < ASTROIDS_NUMBER + level; i++) {
        do {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.floor(Math.random() * canvas.height);
        } while (disanceBetweenPoints(ship.x, ship.y, x, y) < ASTROID_SIZE * 2 + ship.r);
        astroids.push(newAstroid(x, y, Math.ceil(ASTROID_SIZE / 2)));
    };
};

// Function to Split Astroids
function pushSmallerAstroids(x, y, desiredSizeOfAstroid) {
    astroids.push(newAstroid(x, y, Math.ceil(desiredSizeOfAstroid)));
};

function destroyAstroid(index) {
    const roids = astroids[index];
    let x = roids.x;
    let y = roids.y;
    let r = roids.r;

    // Split the Astroid in Two if Necessary
    if (r === Math.ceil(ASTROID_SIZE / 2)) {
        NthCall(pushSmallerAstroids, randomNumber(4, 2), x, y, ASTROID_SIZE / 4);
        score += ASTROID_POINTS.large
    } else if (r === Math.ceil(ASTROID_SIZE / 4)) {
        NthCall(pushSmallerAstroids, randomNumber(2, 1), x, y, ASTROID_SIZE / 8)
        score += ASTROID_POINTS.medium
    } else {
        score += ASTROID_POINTS.small
    };

    // Check High Score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem(SAVE_KEY_SCORE, highScore);
    };

    // Destroy the Astroids
    astroids.splice(index, 1);

    // Create a new Level When There are no More Astroids;
    if (astroids.length == 0) {
        level++;
        newLevel();
    };
};

function disanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

function drawShip(x, y, a, colour = "White") {
    ctx.strokeStyle = colour;
    ctx.lineWidth = SHIP_SIZE / 50;
    ctx.beginPath();
    ctx.moveTo(// Nose of the Ship
        x + 4 / 3 * ship.r * Math.cos(a),
        y - 4 / 3 * ship.r * Math.sin(a)
    );
    ctx.lineTo(// Rear Left 
        x - ship.r * (2 / 3 * Math.cos(a) + Math.sin(a)),
        y + ship.r * (2 / 3 * Math.sin(a) - Math.cos(a))
    );
    ctx.lineTo(// Rear Right 
        x - ship.r * (2 / 3 * Math.cos(a) - Math.sin(a)),
        y + ship.r * (2 / 3 * Math.sin(a) + Math.cos(a))
    );
    ctx.closePath();
    ctx.stroke();
}

function explodeShip() {
    ship.explodeTime = Math.ceil(SHIPS_EXPLOSION_DURATION * FPS);
};

function gameOver() {
    ship.dead = true;
    text = "G A M E  O V E R  ! ! !"
    textAlpha = 1;
}

function keyDown(/** @type {keyboardEvent} */ e) {
    if (ship.dead) {
        return;
    };

    switch (e.keyCode) {
        case 32:// SpaceBar (For the Lasers)
            shootLaser();
            break;
        case 37:// Left Arrow 
            ship.rotation = ROTATION_SPEED / 180 * Math.PI / FPS;
            break;
        case 38:// Up Arrow
            ship.thrusting = true;
            break;
        case 39:// Right Arrow
            ship.rotation = -ROTATION_SPEED / 180 * Math.PI / FPS;
            break;
        case 40:// Down Arrow
            ship.reversing = true;
            break;

    };
};

function keyUp(/** @type {keyboardEvent} */ e) {
    if (ship.dead) {
        return;
    };

    switch (e.keyCode) {
        case 32:// SpaceBar (For the Lasers)
            ship.canShoot = true;
            break;
        case 37:// Left Arrow (stop turn)
            ship.rotation = 0;
            break;
        case 38:// Up Arrow (stop motion)
            ship.thrusting = false;
            break;
        case 39:// Right Arrow (stop trun)
            ship.rotation = 0;
            break;
        case 40:// Down Arrow
            ship.reversing = false;
            break;

    };
};

function newAstroid(x, y, r) {
    const levelMultiplier = 1 + 0.1 * level;
    const astroid = {
        x: x,
        y: y,
        xv: Math.random() * ASTROIDS_SPEED * levelMultiplier / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ASTROIDS_SPEED * levelMultiplier / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: r,
        a: Math.random() * Math.PI * 2,
        vert: Math.floor(Math.random() * (ASTROID_VERTICIES + 1) + ASTROID_VERTICIES / 2),
        offSets: []
    };

    // create the vertex offsets array
    for (let i = 0; i < astroid.vert; i++) {
        astroid.offSets.push(Math.random() * ASTROID_JAGEDNESS * 2 + 1 - ASTROID_JAGEDNESS);
    };

    return astroid;
};

function newGame() {
    level = 0;
    lives = GAME_LIVES;
    score = 0;
    ship = newShip();
    // Get the Highscore from local storage
    const scoreStr = localStorage.getItem(SAVE_KEY_SCORE);
    if (scoreStr === null) {
        highScore = 0;
    } else {
        highScore = parseInt(scoreStr);
    };

    newLevel();
};

function newLevel() {
    text = "Level" + " " + (level + 1);
    textAlpha = 1.0;
    createAstroidBelt();
};

function newShip() {
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: SHIP_SIZE / 2,
        a: 90 / 180 * Math.PI, // Converted to Radians 
        blinkTime: Math.ceil(SHIPS_BLINK_DURATION * FPS),
        blinkNumber: Math.ceil(SHIPS_INVULNERABILITY_DURATION / SHIPS_BLINK_DURATION),
        canShoot: true,
        dead: false,
        explodeTime: 0,
        lasers: [],
        rotation: 0,
        thrusting: false,
        reversing: false,
        motion: {
            x: 0,
            y: 0
        }
    };
};

function shootLaser() {
    // Create the Laser Object
    if (ship.canShoot && ship.lasers.length <= LASER_MAX) {
        ship.lasers.push({ // From the Nose of the Ship
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            XV: LASER_SPEED * Math.cos(ship.a) / FPS,
            YV: -LASER_SPEED * Math.sin(ship.a) / FPS,
            distance: 0,
            explodeTime: 0
        });
    };
    // Prevent Further Shooting
    ship.canShoot = false;
};

function update() {
    const blinkOn = ship.blinkNumber % 2 == 0;
    const exploding = ship.explodeTime > 0;

    // Draw Space
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Thruster Flame, Friction and Reverse the ship
    if (ship.thrusting && !ship.dead) {
        ship.motion.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.motion.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;

        // Drawing the Thruster Flames and Addtions
        if (!exploding && blinkOn) {
            ctx.strokeStyle = "Yellow";
            ctx.lineWidth = SHIP_SIZE / 20;
            ctx.beginPath();
            ctx.moveTo(// Nose of the Ship
                ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
                ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
            );
            ctx.lineTo(// Rear Left 
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
            );
            ctx.lineTo(// Rear Right 
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
            );
            ctx.closePath();
            ctx.stroke();

            ctx.fillStyle = "Red"
            ctx.strokeStyle = "Yellow";
            ctx.lineWidth = SHIP_SIZE / 30;
            ctx.beginPath();
            ctx.moveTo(// Rear left of La Flame
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.7 * Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.7 * Math.cos(ship.a))
            );
            ctx.lineTo(// La Flame's Center
                ship.x - ship.r * 5 / 3 * Math.cos(ship.a),
                ship.y + ship.r * 5 / 3 * Math.sin(ship.a)
            );
            ctx.lineTo(// Rear Right of La Flame
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.7 * Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.7 * Math.cos(ship.a))
            );
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    } else {
        ship.motion.x -= FRICTION * ship.motion.x / FPS;
        ship.motion.y -= FRICTION * ship.motion.y / FPS;
    };


    if (ship.reversing) {
        ship.motion.x -= SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.motion.y += SHIP_THRUST * Math.sin(ship.a) / FPS;
    };

    // Draw the Ship
    if (!exploding && !ship.dead) {
        if (blinkOn) {
            drawShip(ship.x, ship.y, ship.a)
        };

        // Handle Blinking
        if (ship.blinkNumber > 0) {

            // Reduce the Blink Time
            ship.blinkTime--;

            // Reduce the Blink Number
            if (ship.blinkTime == 0) {
                ship.blinkTime = Math.ceil(SHIPS_BLINK_DURATION * FPS);
                ship.blinkNumber--;
            };
        };
    } else {
        // Draw the explosion
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.2, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.4, 0, Math.PI * 2, false);
        ctx.fill();
    };


    if (DEV_SETTINGS.CIRCLE_BOUNDARIES) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
        ctx.stroke();
    };

    // Draw Astroids
    ctx.strokeStyle = "brown";
    ctx.lineWidth = SHIP_SIZE / 20;
    let x, y, r, a, vert, offSets;
    for (let i = 0; i < astroids.length; i++) {
        ctx.strokeStyle = "brown";
        ctx.lineWidth = SHIP_SIZE / 20;
        const roids = astroids[i];
        // Get the Asteroids Properties
        x = roids.x;
        y = roids.y;
        r = roids.r;
        a = roids.a;
        vert = roids.vert;
        offSets = roids.offSets;

        // Draw a path  
        ctx.beginPath();
        ctx.moveTo(
            x + r * offSets[0] * Math.cos(a),
            y + r * offSets[0] * Math.sin(a)
        );
        // Draw the Polygon
        for (let j = 1; j < vert; j++) {
            ctx.lineTo(
                x + r * offSets[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offSets[j] * Math.sin(a + j * Math.PI * 2 / vert)
            );
        };
        ctx.closePath();
        ctx.stroke();

        if (DEV_SETTINGS.CIRCLE_BOUNDARIES) {
            ctx.strokeStyle = "lime";
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, false);
            ctx.stroke();
        };
    };

    // Center Dot
    if (DEV_SETTINGS.CENTER_DOT) {
        ctx.fillStyle = "gold";
        ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
    };

    // Draw the Lasers
    for (let i = 0; i < ship.lasers.length; i++) {
        const element = ship.lasers[i];
        if (ship.lasers[i].explodeTime == 0) {
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(element.x, element.y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
            ctx.fill();
        } else {
            // Draw the Explosion
            ctx.fillStyle = "yellow";
            ctx.beginPath();
            ctx.arc(element.x, element.y, ship.r * 0.75, 0, Math.PI * 2, false);
            ctx.fill();

            ctx.fillStyle = "orangered";
            ctx.beginPath();
            ctx.arc(element.x, element.y, ship.r * 0.5, 0, Math.PI * 2, false);
            ctx.fill();

            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(element.x, element.y, ship.r * 0.25, 0, Math.PI * 2, false);
            ctx.fill();
        };
    };

    // Draw the Game Text
    if (textAlpha >= 0) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle"
        ctx.fillStyle = `rgba(173, 255, 47, ${textAlpha})`;
        ctx.font = "small-caps" + TEXT_SIZE + "px TimesNewRoman";
        ctx.fillText(text, canvas.width / 2, canvas.height * 0.75);
        textAlpha -= (1.0 / TEXT_FADE_TIME / FPS);
    } else if (ship.dead) {
        newGame();
    };

    // Draw the Lives
    let lifeColor;
    for (let i = 0; i < lives; i++) {
        lifeColor = exploding && i == lives - 1 ? "red" : "white";
        drawShip(SHIP_SIZE + i * SHIP_SIZE * 1.2, SHIP_SIZE, 0.5 * Math.PI, lifeColor);
    }

    // Draw the Score
    ctx.textAlign = "right";
    ctx.textBaseline = "middle"
    ctx.fillStyle = "white";
    ctx.font = (TEXT_SIZE * 0.7) + "px TimesNewRoman";
    ctx.fillText(score, canvas.width - SHIP_SIZE / 2, SHIP_SIZE);

    // Draw the High Score
    ctx.textAlign = "center";
    ctx.textBaseline = "middle"
    ctx.fillStyle = "white";
    ctx.font = (TEXT_SIZE * 0.75) + "px TimesNewRoman";
    ctx.fillText("HighScore " + highScore, canvas.width / 2, SHIP_SIZE);

    // Laser, Astroid Collision Detection
    let ax, ay, ar, lx, ly;
    for (let i = astroids.length - 1; i >= 0; i--) {
        const roids = astroids[i];
        // Grabbing the Astroid Properties
        ax = roids.x;
        ay = roids.y;
        ar = roids.r;

        // Loop Over the Laser
        for (let j = ship.lasers.length - 1; j >= 0; j--) {
            const element = ship.lasers[j];
            // Grabbing the Laser Properties
            lx = element.x;
            ly = element.y;

            // Detecting Hits
            if (element.explodeTime == 0 && disanceBetweenPoints(ax, ay, lx, ly) < ar) {
                // Destroy the Astroid and Activate the Laser Explosion
                destroyAstroid(i);
                element.explodeTime = Math.ceil(LASER_EXPLOSION_DURATION * FPS);
                break;
            };
        };
    };

    // Check for Astroid and Ship Collisions
    if (!exploding) {

        // Check Only When not Blinking
        if (ship.blinkNumber == 0 && !ship.dead) {
            for (let i = 0; i < astroids.length; i++) {
                const roids = astroids[i];
                if (disanceBetweenPoints(ship.x, ship.y, roids.x, roids.y) < ship.r + roids.r) {
                    explodeShip();
                    destroyAstroid(i);
                    break;
                };
            };
        };

        // Rotate Ship
        ship.a += ship.rotation;

        // Move the Ship 
        ship.x += ship.motion.x;
        ship.y += ship.motion.y;
    } else {
        // Reduce Explode Time
        ship.explodeTime--;

        // Reset Ship after Explosion
        if (ship.explodeTime == 0) {
            lives--
            if (lives == 0) {
                gameOver();
            } else {
                ship = newShip();
            };
        };
    };

    // Handle the Edge of screen
    if (ship.x < 0 - ship.r) {
        ship.x = canvas.width + ship.r;
    } else if (ship.x > canvas.width + ship.r) {
        ship.x = 0 - ship.r
    };

    if (ship.y < 0 - ship.r) {
        ship.y = canvas.height + ship.r;
    } else if (ship.y > canvas.height + ship.r) {
        ship.y = 0 - ship.r;
    };


    // Moving the Lasers
    for (let i = ship.lasers.length - 1; i >= 0; i--) {
        const element = ship.lasers[i];

        //check distance travelled
        if (element.distance > (LASER_DISTANCE + level * 0.1) * canvas.width) {
            ship.lasers.splice(i, 1);
            continue;
        };

        // Handle the Explosion
        if (element.explodeTime > 0) {
            element.explodeTime--;

            // Destroy the Laser After Duration
            if (ship.lasers[i].explodeTime == 0) {
                ship.lasers.splice(i, 1);
                continue;
            };
        } else {
            // Move the Laser
            element.x += element.XV;
            element.y += element.YV;

            // Calculate the Distance Travelled
            element.distance += Math.sqrt(Math.pow(element.XV, 2) + Math.pow(element.YV, 2));
        };

        //Handle Edge of Screen
        if (element.x < 0) {
            element.x = canvas.width;
        } else if (element.x > canvas.width) {
            element.x = 0;
        };

        if (element.y < 0) {
            element.y = canvas.height;
        } else if (element.y > canvas.height) {
            element.y = 0;
        };
    };

    for (let i = 0; i < astroids.length; i++) {
        const roids = astroids[i];
        // Move the Astroid
        roids.x += roids.xv;
        roids.y += roids.yv;

        // Handle the Edge of the Screen
        if (roids.x < 0 - roids.r) {
            roids.x = canvas.width + roids.r;
        } else if (roids.x > canvas.width + roids.r) {
            roids.x = 0 - roids.r
        };

        if (roids.y < 0 - roids.r) {
            roids.y = canvas.height + roids.r;
        } else if (roids.y > canvas.height + roids.r) {
            roids.y = 0 - roids.r
        };
    };

};