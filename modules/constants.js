import { randomNumber } from "../utilities.js";

export const FPS = 30; // Frames per Second
export const FRICTION = 0.7; // Friction coefficient
export const GAME_LIVES = randomNumber(5, 3); // Starting Number of Lives
export const LASER_EXPLOSION_DURATION = 0.05; // Duration of the lasers' Exploding in Seconds
export const LASER_DISTANCE = 0.3; // Max Distance a Laser can Travel
export const LASER_MAX = 25; // Max Number of Lasers
export const LASER_SPEED = 500; // Speed of Lasers in Pixels per Sec
export const ASTROID_JAGEDNESS = 0.5; // Jagedness of the Astroids
export const ASTROID_START_COUNT = 2; // Starting Number of Astroids
export const ASTROID_SIZE = randomNumber(80, 50); // Starting Size of Astroids in Pixels
export const ASTROID_SPEED = 40; // Max starting Speed of Astroids in Pixels per Sec
export const ASTROID_VERTICIES = 10; // Number of Vretices
export const SAVE_KEY_SCORE = "Highscore"; // Save key for LocalStorage of Highscore
export const SHIPS_EXPLOSION_DURATION = 0.2; // Duration of the Ship Exploding
export const SHIPS_BLINK_DURATION = 0.09; // Duration of the Ship's Blink During GM in Sec
export const SHIPS_INVULNERABILITY_DURATION = 1; // Duration of the Ship's God Mode in Sec
export const SHIP_SIZE = 30; // Measurement in Pixels
export const ROTATION_SPEED = 360; // In Degrees per Sec
export const SHIP_THRUST = 5; // Acceleration in Pixels per Sec
export const TEXT_FADE_TIME = 3.0; // Text Fade in Sec
export const TEXT_SIZE = 20; // Text Size in Pixels
export const ASTROID_POINTS = { // Points per Astroid
    large: 8,
    medium: 15,
    small: 30
};
export const DEV_SETTINGS = {
    CENTER_DOT: false,
    CIRCLE_BOUNDARIES: false
};
