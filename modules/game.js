import { randomNumber, NthCall } from "../utilities.js";
import {
    FPS,
    FRICTION,
    GAME_LIVES,
    LASER_DISTANCE,
    LASER_EXPLOSION_DURATION,
    LASER_MAX,
    LASER_SPEED,
    ASTROID_JAGEDNESS,
    ASTROID_SIZE,
    ASTROID_SPEED,
    ASTROID_START_COUNT,
    ASTROID_VERTICIES,
    SHIP_SIZE,
    ROTATION_SPEED,
    SHIP_THRUST,
    SHIPS_BLINK_DURATION,
    SHIPS_EXPLOSION_DURATION,
    SHIPS_INVULNERABILITY_DURATION,
    SAVE_KEY_SCORE,
    ASTROID_POINTS,
    TEXT_FADE_TIME,
    DEV_SETTINGS
} from "./constants.js";
import { renderFrame } from "./render.js";
import { bindControls } from "./controls.js";

function createShip(canvas) {
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: SHIP_SIZE / 2,
        a: (90 / 180) * Math.PI,
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
}

function createAsteroid(x, y, r, level) {
    const levelMultiplier = 1 + 0.1 * level;
    const asteroid = {
        x,
        y,
        xv: (Math.random() * ASTROID_SPEED * levelMultiplier) / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: (Math.random() * ASTROID_SPEED * levelMultiplier) / FPS * (Math.random() < 0.5 ? 1 : -1),
        r,
        a: Math.random() * Math.PI * 2,
        vert: Math.floor(Math.random() * (ASTROID_VERTICIES + 1) + ASTROID_VERTICIES / 2),
        offSets: []
    };

    for (let i = 0; i < asteroid.vert; i += 1) {
        asteroid.offSets.push(Math.random() * ASTROID_JAGEDNESS * 2 + 1 - ASTROID_JAGEDNESS);
    }

    return asteroid;
}

function createInitialState(canvas) {
    return {
        canvas,
        level: 0,
        lives: GAME_LIVES,
        astroids: [],
        score: 0,
        highScore: 0,
        ship: createShip(canvas),
        text: "",
        textAlpha: 0
    };
}

export function createGame(canvas, ctx) {
    const state = createInitialState(canvas);
    state.ctx = ctx;

    const game = {
        state,
        start() {
            this.newGame();
            bindControls(this);
            setInterval(() => this.update(), 1000 / FPS);
        },
        newGame() {
            state.level = 0;
            state.lives = GAME_LIVES;
            state.score = 0;
            state.ship = createShip(canvas);

            const scoreStr = localStorage.getItem(SAVE_KEY_SCORE);
            state.highScore = scoreStr === null ? 0 : parseInt(scoreStr, 10);
            this.newLevel();
        },
        newLevel() {
            state.text = `Level ${state.level + 1}`;
            state.textAlpha = 1.0;
            this.createAsteroidBelt();
        },
        createAsteroidBelt() {
            state.astroids = [];
            let x;
            let y;

            for (let i = 0; i < ASTROID_START_COUNT + state.level; i += 1) {
                do {
                    x = Math.floor(Math.random() * canvas.width);
                    y = Math.floor(Math.random() * canvas.height);
                } while (this.distanceBetweenPoints(state.ship.x, state.ship.y, x, y) < ASTROID_SIZE * 2 + state.ship.r);

                state.astroids.push(createAsteroid(x, y, Math.ceil(ASTROID_SIZE / 2), state.level));
            }
        },
        distanceBetweenPoints(x1, y1, x2, y2) {
            return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        },
        pushSmallerAsteroids(x, y, desiredSize) {
            state.astroids.push(createAsteroid(x, y, Math.ceil(desiredSize), state.level));
        },
        destroyAsteroid(index) {
            const roids = state.astroids[index];
            const x = roids.x;
            const y = roids.y;
            const r = roids.r;

            if (r === Math.ceil(ASTROID_SIZE / 2)) {
                NthCall(this.pushSmallerAsteroids, randomNumber(4, 2), x, y, ASTROID_SIZE / 4);
                state.score += ASTROID_POINTS.large;
            } else if (r === Math.ceil(ASTROID_SIZE / 4)) {
                NthCall(this.pushSmallerAsteroids, randomNumber(2, 1), x, y, ASTROID_SIZE / 8);
                state.score += ASTROID_POINTS.medium;
            } else {
                state.score += ASTROID_POINTS.small;
            }

            if (state.score > state.highScore) {
                state.highScore = state.score;
                localStorage.setItem(SAVE_KEY_SCORE, state.highScore);
            }

            state.astroids.splice(index, 1);

            if (state.astroids.length === 0) {
                state.level += 1;
                this.newLevel();
            }
        },
        explodeShip() {
            state.ship.explodeTime = Math.ceil(SHIPS_EXPLOSION_DURATION * FPS);
            state.ship.dead = true;
            state.lives -= 1;
        },
        gameOver() {
            state.ship.dead = true;
            state.text = "G A M E  O V E R  ! ! !";
            state.textAlpha = 1;
        },
        handleKeyDown(event) {
            if (state.ship.dead) {
                return;
            }

            switch (event.keyCode) {
                case 32:
                    this.shootLaser();
                    break;
                case 37:
                    state.ship.rotation = (ROTATION_SPEED / 180) * Math.PI / FPS;
                    break;
                case 38:
                    state.ship.thrusting = true;
                    break;
                case 39:
                    state.ship.rotation = -(ROTATION_SPEED / 180) * Math.PI / FPS;
                    break;
                case 40:
                    state.ship.reversing = true;
                    break;
                default:
                    break;
            }
        },
        handleKeyUp(event) {
            if (state.ship.dead) {
                return;
            }

            switch (event.keyCode) {
                case 32:
                    state.ship.canShoot = true;
                    break;
                case 37:
                    state.ship.rotation = 0;
                    break;
                case 38:
                    state.ship.thrusting = false;
                    break;
                case 39:
                    state.ship.rotation = 0;
                    break;
                case 40:
                    state.ship.reversing = false;
                    break;
                default:
                    break;
            }
        },
        shootLaser() {
            if (state.ship.canShoot && state.ship.lasers.length <= LASER_MAX) {
                state.ship.lasers.push({
                    x: state.ship.x + (4 / 3) * state.ship.r * Math.cos(state.ship.a),
                    y: state.ship.y - (4 / 3) * state.ship.r * Math.sin(state.ship.a),
                    xv: (LASER_SPEED * Math.cos(state.ship.a)) / FPS,
                    yv: -(LASER_SPEED * Math.sin(state.ship.a)) / FPS,
                    distance: 0,
                    explodeTime: 0
                });
            }
            state.ship.canShoot = false;
        },
        update() {
            if (state.textAlpha > 0) {
                state.textAlpha = Math.max(0, state.textAlpha - 1 / (FPS * TEXT_FADE_TIME));
            }

            const blinking = state.ship.blinkNumber % 2 === 0;
            const exploding = state.ship.explodeTime > 0;

            if (state.ship.thrusting && !state.ship.dead) {
                state.ship.motion.x += (SHIP_THRUST * Math.cos(state.ship.a)) / FPS;
                state.ship.motion.y -= (SHIP_THRUST * Math.sin(state.ship.a)) / FPS;
            } else {
                state.ship.motion.x -= (FRICTION * state.ship.motion.x) / FPS;
                state.ship.motion.y -= (FRICTION * state.ship.motion.y) / FPS;
            }

            if (state.ship.reversing) {
                state.ship.motion.x -= (SHIP_THRUST * Math.cos(state.ship.a)) / FPS;
                state.ship.motion.y += (SHIP_THRUST * Math.sin(state.ship.a)) / FPS;
            }

            if (state.ship.explodeTime > 0) {
                state.ship.explodeTime -= 1;
                if (state.ship.explodeTime <= 0) {
                    if (state.lives > 0) {
                        state.ship = createShip(canvas);
                    } else {
                        this.gameOver();
                    }
                }
            }

            if (!state.ship.dead && !exploding) {
                if (state.ship.blinkNumber > 0) {
                    state.ship.blinkTime -= 1;
                    if (state.ship.blinkTime === 0) {
                        state.ship.blinkTime = Math.ceil(SHIPS_BLINK_DURATION * FPS);
                        state.ship.blinkNumber -= 1;
                    }
                }
            }

            if (!state.ship.dead) {
                state.ship.a += state.ship.rotation;
                state.ship.x += state.ship.motion.x;
                state.ship.y += state.ship.motion.y;

                if (state.ship.x < 0) {
                    state.ship.x = canvas.width;
                } else if (state.ship.x > canvas.width) {
                    state.ship.x = 0;
                }

                if (state.ship.y < 0) {
                    state.ship.y = canvas.height;
                } else if (state.ship.y > canvas.height) {
                    state.ship.y = 0;
                }
            }

            state.astroids.forEach((asteroid, index) => {
                asteroid.x += asteroid.xv;
                asteroid.y += asteroid.yv;

                if (asteroid.x < 0 - asteroid.r) {
                    asteroid.x = canvas.width + asteroid.r;
                } else if (asteroid.x > canvas.width + asteroid.r) {
                    asteroid.x = 0 - asteroid.r;
                }

                if (asteroid.y < 0 - asteroid.r) {
                    asteroid.y = canvas.height + asteroid.r;
                } else if (asteroid.y > canvas.height + asteroid.r) {
                    asteroid.y = 0 - asteroid.r;
                }

                if (!state.ship.dead && state.ship.blinkNumber === 0 && !state.ship.explodeTime) {
                    const distanceToShip = this.distanceBetweenPoints(state.ship.x, state.ship.y, asteroid.x, asteroid.y);
                    if (distanceToShip < state.ship.r + asteroid.r) {
                        this.explodeShip();
                        this.destroyAsteroid(index);
                    }
                }
            });

            state.ship.lasers = state.ship.lasers.filter((laser, laserIndex) => {
                laser.x += laser.xv;
                laser.y += laser.yv;
                laser.distance += Math.hypot(laser.xv, laser.yv);

                if (laser.distance > LASER_DISTANCE * canvas.width) {
                    return false;
                }

                let hitAsteroid = false;
                state.astroids.forEach((asteroid, asteroidIndex) => {
                    if (hitAsteroid) {
                        return;
                    }

                    const hitDistance = this.distanceBetweenPoints(laser.x, laser.y, asteroid.x, asteroid.y);
                    if (hitDistance < asteroid.r + 2) {
                        laser.explodeTime = Math.ceil(LASER_EXPLOSION_DURATION * FPS);
                        this.destroyAsteroid(asteroidIndex);
                        hitAsteroid = true;
                    }
                });

                if (laser.explodeTime > 0) {
                    laser.explodeTime -= 1;
                    if (laser.explodeTime <= 0) {
                        return false;
                    }
                }

                return true;
            });

            if (state.ship.dead && state.lives <= 0) {
                state.text = "G A M E  O V E R  ! ! !";
                state.textAlpha = 1;
            }

            renderFrame(ctx, canvas, state);
        }
    };

    return game;
}
