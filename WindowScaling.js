let PIXI = require("./node_modules/pixi.js/dist/pixi.mjs");


export class Resizer {
    constructor(window, app, WIDTH, HEIGHT) {
       this.app = app;
       this.window = window;
       this.width = WIDTH;
       this.height = HEIGHT;
       this.resize = this.resize.bind(this);
    }
    resize() {
    const ratio = this.width / this.height; // Mobile aspect ratio (width / height)
    const width = this.window.innerWidth;
    const height = this.window.innerHeight;

    let newWidth, newHeight;

    if (width / height > ratio) {
        newHeight = height;
        newWidth = height * ratio;
    } else {
        newWidth = width;
        newHeight = width / ratio;
    }

    this.app.renderer.resize(newWidth, newHeight);
    this.app.stage.scale.set(newWidth / this.width, newHeight / this.height);

    this.app.view.style.width = `${newWidth}px`;
    this.app.view.style.height = `${newHeight}px`;
    this.app.view.style.margin = 'auto'; // Centers the canvas in the middle of page
}
};
