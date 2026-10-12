import { createGame } from "./modules/game.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const game = createGame(canvas, ctx);
game.start();
