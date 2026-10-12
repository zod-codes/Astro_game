export function bindControls(game) {
    document.addEventListener("keydown", (event) => game.handleKeyDown(event));
    document.addEventListener("keyup", (event) => game.handleKeyUp(event));
}
