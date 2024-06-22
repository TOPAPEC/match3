import { Resizer } from "./WindowScaling.js"
import { ImageSplitter } from "./ImageSplitter.js"

const WIDTH = 750;
const HEIGHT = 1334;
const app = new PIXI.Application({
    width: WIDTH, // Default width for mobile ratio
    height: HEIGHT, // Default height for mobile ratio
    backgroundColor: 0x1099bb,
    resolution: window.devicePixelRatio || 1,
});
document.body.appendChild(app.view);

var resizer = new Resizer(window, app, WIDTH, HEIGHT);

window.addEventListener('resize', resizer.resize);
resizer.resize();

// Add your game assets and logic here
const graphics = new PIXI.Graphics();


app.stage.addChild(graphics);
const imagePath = "raw_assets/gems/united_images.png";
const splitter = new ImageSplitter();

function displayChunk(chunk, x, y) {
    const texture = PIXI.Texture.fromImage(chunk.src);
    const sprite = new PIXI.Sprite(texture);
    console.log(sprite);
    sprite.x = x;
    sprite.y = y;
    app.stage.addChild(sprite);
}

splitter.loadImage(imagePath, () => {
    const chunkSize = 112; // Assumed size of the chunks
    const positions = [
        { x: WIDTH / 4 - chunkSize / 2, y: HEIGHT / 4 - chunkSize / 2 },
        { x: 3 * WIDTH / 4 - chunkSize / 2, y: HEIGHT / 4 - chunkSize / 2 },
        { x: WIDTH / 4 - chunkSize / 2, y: 3 * HEIGHT / 4 - chunkSize / 2 },
        { x: 3 * WIDTH / 4 - chunkSize / 2, y: 3 * HEIGHT / 4 - chunkSize / 2 },
    ];

    console.log("AAA")
    for (let i = 0; i < 4; i++) {
        displayChunk(splitter.getChunk(i), positions[i].x, positions[i].y);
    }
});