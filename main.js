import {Resizer} from "./WindowScaling.js";
import {FieldManager} from "./FieldManager.js";
import {FieldManagerOptimized} from "./FilerManagerOptimized.js";

const WIDTH = 750;
const HEIGHT = 1334;

const app = new PIXI.Application();
await app.init({
    width: WIDTH,
    height: HEIGHT,
    background: 0xFFF5C9,
    resolution: window.devicePixelRatio || 1,
});
document.body.appendChild(app.canvas);

var resizer = new Resizer(window, app, WIDTH, HEIGHT);
window.addEventListener('resize', resizer.resize);

const tileset1_conf = await (await fetch('./tilesets/gems_2.json')).json();

const spritesheet = new PIXI.Spritesheet(await PIXI.Assets.load(tileset1_conf["meta"]["image"]), tileset1_conf);
await spritesheet.parse();

const fieldWidth = 10;
const fieldHeight = 12;
const tileSize = spritesheet.textures[`tile1`].width;
const fieldX = (WIDTH - tileSize * fieldWidth) / 2;
const fieldY = (HEIGHT - tileSize * fieldHeight) / 2;
const gemTypes = 6;

// let fieldManager = new FieldManager(fieldX, fieldY, fieldWidth, fieldHeight, spritesheet, app, 5, 10);
let fieldManager = new FieldManagerOptimized(spritesheet, fieldX, fieldY, fieldWidth, fieldHeight, gemTypes);
await fieldManager.init();

const background = new PIXI.Sprite(await PIXI.Assets.load("raw_assets/background.png"));
background.setSize(WIDTH, HEIGHT);


const rectangle = PIXI.Sprite.from(PIXI.Texture.WHITE);
rectangle.width = WIDTH;
rectangle.height = tileSize * fieldHeight * 1.1;
rectangle.tint = 0x3d1a10;
rectangle.y = (HEIGHT - rectangle.height) / 2;
rectangle.alpha = 0.7;

app.stage.addChild(background);

app.stage.addChild(rectangle);

app.stage.addChild(fieldManager);

resizer.resize();
resizer.resize();
resizer.resize();
resizer.resize();
resizer.resize();
resizer.resize();

console.log(app.stage.children[0])

app.stage.eventMode = 'static';

function gameLoop() {
    const delta = app.ticker.elapsedMS / 1000;
    fieldManager.process(delta)
}
// Listen for frame updates
app.ticker.add(gameLoop);

