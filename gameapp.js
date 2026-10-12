const canva = document.getElementById('gameCanvas');
const ctx = canva.getContext("2d");
const FPS = 30;
const SHIP_SIZE = 25;
const TURN_SPEED = 150;
const SHIP_MOVEMENT = Math.pow(2, 2);
const CENTRE_OF_SHIP = false;
const SHIPS_EXPLOSION = 0.5;
const SHIPS_INVULNRABILITY_BUFFER = 0.2;
const SHIPS_INVULNRABILITY_DURATION = 4;
const FRICTION = 0.99;
const ASTROIDS_NUMBER = Math.floor(Math.random() * 10 + 1);
const ASTROID_SIZE = 200;
const ASTROID_VERTICIES = 8;
const ASTROIDS_SPEED = 30;
const ASTROID_JAGEDNESS = 0.39;
const LASER_MAX = 20;
const LASER_SPEED = 500;
const LASER_DISTANCE = 2;
const LASER_EXPLOSION = 0.2;
const COLLISION_BOUNDING_CIRCLE = false;

// event.key listeners 
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

function keyDown(/** @type {KeyboardEvent} */ ev) {
    switch (ev.keyCode) {
        case 32: // space bar (laser)
            shootLaser();
            break;
        case 37: // left arrow
            ship.rotation = TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case 38: // up arrow
            ship.thrusting = true;
            break;
        case 39: // right arrow
            ship.rotation = -TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case 40: // down arrow
            ship.reversing = true;
            break;

        default:
            break;
    }
};

function keyUp(/** @type {KeyboardEvent} */ ev) {
    switch (ev.keyCode) {
        case 32: // space bar (laser)
            ship.shoot = true;
            break;
        case 37: // left arrow    
            ship.rotation = 0;
            break;
        case 38: // up arrow
            ship.thrusting = false;
            break;
        case 39: // right arrow
            ship.rotation = 0;
            break;
        case 40: // down arrow
            ship.reversing = false;
            break;

        default:
            break;
    }
};

function explodeShip() {
    ship.explodeTime = Math.ceil(SHIPS_EXPLOSION * FPS);
};

let ship = newShip();

//setting up astroids
let astroids = [];

function createAstroidBelt() {
    astroids = [];
    let x, y;
    for (let i = 0; i < ASTROIDS_NUMBER; i++) {
        do {
            x = Math.floor(Math.random() * canva.width);
            y = Math.floor(Math.random() * canva.height);
        } while (distance(ship.x, ship.y, x, y) < ASTROID_SIZE * 0.9 + ship.r);
        astroids.push(newAstroid(x, y, Math.floor(ASTROID_SIZE / 2)));
    };
};

function HalfAstroid(index) {
    const element = astroids[index];
    let x = element.x;
    let y = element.y;
    let r = element.r;

    //Halving the Astroids
    if (r == Math.floor(ASTROID_SIZE / 2)) {
        astroids.push(newAstroid(x, y, Math.floor(ASTROID_SIZE / 4)));
        astroids.push(newAstroid(x, y, Math.floor(ASTROID_SIZE / 4)));
    } else if (r == Math.floor(ASTROID_SIZE / 4)) {
        astroids.push(newAstroid(x, y, Math.floor(ASTROID_SIZE / 8)));
        astroids.push(newAstroid(x, y, Math.floor(ASTROID_SIZE / 8)));
    };

    //Destroying the astroid
    astroids.splice(index, 1);
};

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

createAstroidBelt();

function newAstroid(x, y, r) {
    const astroid = {
        x: x,
        y: y,
        XV: Math.random() * ASTROIDS_SPEED / FPS * (Math.random() < 0.5 ? 1 : -1),
        YV: Math.random() * ASTROIDS_SPEED / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: r,
        a: Math.random() * Math.PI * 2,
        v: Math.floor(Math.random() * (ASTROID_VERTICIES + 1) + ASTROID_VERTICIES / 2),
        offset: []
    };

    for (let i = 0; i < astroid.v; i++) {
        astroid.offset.push(Math.random() * ASTROID_JAGEDNESS * 2 + 1 - ASTROID_JAGEDNESS);
    };

    return astroid;
};

function newShip() {
    return {
        x: canva.width / 2,
        y: canva.height / 2,
        r: SHIP_SIZE / 2,
        a: 90 / 180 * Math.PI, // converted to radians
        rotation: 0,
        thrusting: false,
        reversing: false,
        shoot: true,
        lasers: [],
        move: {
            x: 0,
            y: 0
        },
        explodeTime: 0,
        blinkTime: Math.ceil(SHIPS_INVULNRABILITY_BUFFER * FPS),
        blinkNumber: Math.ceil(SHIPS_INVULNRABILITY_DURATION / SHIPS_INVULNRABILITY_BUFFER)
    };
};

function shootLaser() {
    // create the laser object
    if (ship.shoot && ship.lasers.length <= LASER_MAX) {
        ship.lasers.push({
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            XV: LASER_SPEED * Math.cos(ship.a) / FPS,
            YV: -LASER_SPEED * Math.sin(ship.a) / FPS,
            distance: 0,
            explodeTime: 0
        });
    };
    // prevent shooting
    ship.shoot = false;
};

//game loop
setInterval(update, 1000 / FPS);

function update() {
    const blinkOn = ship.blinkNumber % 2 == 0;
    const exploding = ship.explodeTime > 0;

    //build space
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canva.width, canva.height);

    //ship movements
    if (ship.thrusting == true) {
        ship.move.x += SHIP_MOVEMENT * Math.cos(ship.a) / FPS;
        ship.move.y -= SHIP_MOVEMENT * Math.sin(ship.a) / FPS;

        if (!exploding) {
            if (blinkOn) {
                // Flames
                ctx.strokeStyle = "orange";
                ctx.fillStyle = "red"
                ctx.lineWidth = SHIP_SIZE / 25;
                ctx.beginPath();
                ctx.moveTo(
                    ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.7 * Math.sin(ship.a)),
                    ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.7 * Math.cos(ship.a))
                );      // rear flames left
                ctx.lineTo(
                    ship.x - ship.r * 6 / 3 * Math.cos(ship.a),
                    ship.y + ship.r * 6 / 3 * Math.sin(ship.a)
                );      // rear centre

                ctx.lineTo(
                    ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.7 * Math.sin(ship.a)),
                    ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.7 * Math.cos(ship.a))
                );      // rear right
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            };
        };

    } else if (ship.thrusting == false) {
        ship.move.x -= FRICTION * ship.move.x / FPS;
        ship.move.y -= FRICTION * ship.move.y / FPS;
    };

    if (ship.reversing == true) {
        ship.move.x -= SHIP_MOVEMENT * Math.cos(ship.a) / FPS;
        ship.move.y += SHIP_MOVEMENT * Math.sin(ship.a) / FPS;
    } else if (ship.reversing == false) {
        ship.move.x -= FRICTION * ship.move.x / FPS;
        ship.move.y -= FRICTION * ship.move.y / FPS;
    };

    // Draw Astroids
    let x, y, r, a, v, offset;
    for (let i = 0; i < astroids.length; i++) {
        ctx.strokeStyle = "red";
        ctx.fillStyle = "brown"
        ctx.lineWidth = SHIP_SIZE / 40;

        x = astroids[i].x;
        y = astroids[i].y;
        r = astroids[i].r;
        a = astroids[i].a;
        v = astroids[i].v;
        offset = astroids[i].offset;

        // drawing a path
        ctx.beginPath();
        ctx.moveTo(
            x + r * offset[0] * Math.cos(a),
            y + r * offset[0] * Math.sin(a)
        );

        //drawing the polygon
        for (let j = 1; j < v; j++) {
            ctx.lineTo(
                x + r * offset[j] * Math.cos(a + j * Math.PI * 2 / v),
                y + r * offset[j] * Math.sin(a + j * Math.PI * 2 / v)
            );
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // boundaries
        if (COLLISION_BOUNDING_CIRCLE) {
            ctx.strokeStyle = "green";
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, false);
            ctx.stroke();
        };

        //moving astroids
        astroids[i].x += astroids[i].XV;
        astroids[i].y += astroids[i].YV;

        // Edge of screen handling for astroids
        if (astroids[i].x < 0 - astroids[i].r) {
            astroids[i].x = canva.width + astroids[i].r;
        } else if (astroids[i].x > canva.width + astroids[i].r) {
            astroids[i].x = 0 - astroids[i].r;
        };

        if (astroids[i].y < 0 - astroids[i].r) {
            astroids[i].y = canva.height + astroids[i].r;
        } else if (astroids[i].y > canva.height + astroids[i].r) {
            astroids[i].y = 0 - astroids[i].r;
        };

    };

    if (!exploding) {
        if (blinkOn) {
            //build ship
            ctx.strokeStyle = "white";
            ctx.lineWidth = SHIP_SIZE / 50;
            ctx.beginPath();
            ctx.moveTo(
                ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
                ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
            );      // nose of ship
            ctx.lineTo(
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
            );      // rear left

            ctx.lineTo(
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
            );      // rear right
            ctx.closePath();
            ctx.stroke();
        };

        // handling blink event
        if (ship.blinkNumber > 0) {
            //reducing blinkTime
            ship.blinkTime--;
            //reducing blinkNumber
            if (ship.blinkTime == 0) {
                ship.blinkTime = Math.ceil(SHIPS_INVULNRABILITY_BUFFER * FPS);
                ship.blinkNumber--;
            };
        };
    } else {
        // drawing the ship collision explosion
        ctx.fillStyle = "darkred";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.6, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
        ctx.fill();
    }

    // boundaries
    if (COLLISION_BOUNDING_CIRCLE) {
        ctx.strokeStyle = "green";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
        ctx.stroke();
    };

    if (CENTRE_OF_SHIP) {
        // center of ship
        ctx.fillStyle = 'red';
        ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
    };
    // checking for ship astroid collisions
    if (!exploding) {
        if (ship.blinkNumber == 0) {
            for (let i = 0; i < astroids.length; i++) {
                if (distance(ship.x, ship.y, astroids[i].x, astroids[i].y) < ship.r + astroids[i].r) {
                    explodeShip();
                    HalfAstroid(i);
                    break;
                };
            };
        };

        // rotate ship
        ship.a += ship.rotation;

        // move ship
        ship.x += ship.move.x;
        ship.y += ship.move.y;

        //Drawing the laser
        for (let i = 0; i < ship.lasers.length; i++) {
            if (ship.lasers[i].explodeTime == 0) {
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(ship.lasers[i].x, ship.lasers[i].y, 2, SHIP_SIZE / 20, Math.PI * 2, false);
                ctx.fill();
            } else {
                //draw the laser explosion
                ctx.fillStyle = "orangered";
                ctx.beginPath();
                ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.7, SHIP_SIZE / 20, Math.PI * 2, false);
                ctx.fill();
                
                ctx.fillStyle = "red";
                ctx.beginPath();
                ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.4, SHIP_SIZE / 20, Math.PI * 2, false);
                ctx.fill();

                ctx.fillStyle = "darkred";
                ctx.beginPath();
                ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.28, SHIP_SIZE / 20, Math.PI * 2, false);
                ctx.fill();
            };
        };

        //Laser Astroid Collision
        let ax, ay, ar, lx, ly;
        for (let i = astroids.length - 1; i >= 0; i--) {
            const element = astroids[i];
            ax = element.x;
            ay = element.y;
            ar = element.r;

            //Laser loop
            for (let j = ship.lasers.length - 1; j >= 0; j--) {
                const element = ship.lasers[j];
                lx = element.x;
                ly = element.y;

                // detecting impact
                if (distance(ax, ay, lx, ly) < ar && ship.lasers[j].explodeTime == 0) {
                    //Half the astroid and draw laser explosion
                    HalfAstroid(i);
                    element.explodeTime = Math.ceil(LASER_EXPLOSION * FPS);
                    break;
                };
            };
        };

        //move lasers
        for (let i = 0; i < ship.lasers.length; i++) {
            const element = ship.lasers[i];

            //checking the distance travelled 
            if (element.distance > LASER_DISTANCE * canva.width) {
                ship.lasers.splice(i, 1);
                continue;
            };

            //handling the laser explosion
            if (element.explodeTime > 0) {
                element.explodeTime--;

                //laser erasure after duration
                if (element.explodeTime == 0) {
                    ship.lasers.splice(i, 1);
                    continue;
                };
            } else {
                //move the laser
                element.x += element.XV;
                element.y += element.YV;

                //calculate Distance travelled
                element.distance += Math.sqrt(Math.pow(element.XV, 2) + Math.pow(element.YV, 2));

            };

            // handling edge of screen
            if (element.x < 0) {
                element.x = canva.width;
            } else if (element.x > canva.width) {
                element.x = 0;
            };

            if (element.y < 0) {
                element.y = canva.height;
            } else if (element.y > canva.height) {
                element.y = 0;
            };
        };
    } else {
        ship.explodeTime--;

        if (ship.explodeTime == 0) {
            ship = newShip();
        };
    };

    // Edge of screen handling for ship
    if (ship.x < 0 - ship.r) {
        ship.x = canva.width + ship.r;
    } else if (ship.x > canva.width + ship.r) {
        ship.x = 0 - ship.r;
    };

    if (ship.y < 0 - ship.r) {
        ship.y = canva.height + ship.r;
    } else if (ship.y > canva.height + ship.r) {
        ship.y = 0 - ship.r;
    };
};
