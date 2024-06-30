import {Resizer} from "./WindowScaling.js";
import {FieldManager} from "./FieldManager.js";
import {FieldManagerOptimized} from "./FilerManagerOptimized.js";
import {MainMenu} from "./MainMenu.js";
import {LevelSelection} from "./LevelSelection.js";
import {GameState, LevelsState, MainMenuState, StateMachine} from "./StateMachine.js";
import {PlayerProfile} from "./PlayerProfile.js";

async function main() {
    const WIDTH = 750;
    const HEIGHT = 1334;

    const app = new PIXI.Application();
    await app.init({
        width: WIDTH,
        height: HEIGHT,
        background: 0x80ced6,
        resolution: window.devicePixelRatio || 1,
    });
    document.body.appendChild(app.canvas);

    var resizer = new Resizer(window, app, WIDTH, HEIGHT);
    window.addEventListener('resize', resizer.resize);

    await PIXI.Assets.load("./text/toxigenesis.otf");

    const tileset1_conf = await (await fetch('./tilesets/gems_2.json')).json();

    const spritesheet = new PIXI.Spritesheet(await PIXI.Assets.load(tileset1_conf["meta"]["image"]), tileset1_conf);
    await spritesheet.parse();

    const fieldWidth = 9;
    const fieldHeight = 11;
    const tileSize = spritesheet.textures[`tile1`].width;
    const fieldX = (WIDTH - tileSize * fieldWidth) / 2;
    const fieldY = (HEIGHT - tileSize * fieldHeight) / 2;
    const gemTypes = 5;

// let fieldManager = new FieldManager(fieldX, fieldY, fieldWidth, fieldHeight, spritesheet, app, 5, 10);


    const backgroundGame = new PIXI.Sprite(await PIXI.Assets.load("raw_assets/background.png"));
    backgroundGame.setSize(WIDTH, HEIGHT);

    const backgroundMenu = new PIXI.Sprite(await PIXI.Assets.load("raw_assets/background.png"));
    backgroundMenu.setSize(WIDTH, HEIGHT);

    const rectangle = PIXI.Sprite.from(PIXI.Texture.WHITE);
    rectangle.width = WIDTH;
    rectangle.height = tileSize * fieldHeight * 1.1;
    rectangle.tint = 0x3d1a10;
    rectangle.y = -0.05 * fieldHeight;
    rectangle.alpha = 0.7;

    const playerData = new PlayerProfile();
    playerData.loadDefault();

    let fieldManager = new FieldManagerOptimized(WIDTH, HEIGHT, spritesheet, fieldX, fieldY, fieldWidth, fieldHeight,
        gemTypes, backgroundGame, rectangle, playerData);
    fieldManager.visible = false;
    await fieldManager.init();
    app.stage.addChild(fieldManager);

    resizer.resize();
    resizer.resize();
    resizer.resize();
    resizer.resize();
    resizer.resize();
    resizer.resize();


    app.stage.eventMode = 'static';

    const mainMenuSpritesheetConf = await (await fetch('./interface/spritesheet.json')).json();
    const mainMenuSpritesheet = new PIXI.Spritesheet(await PIXI.Assets.load(mainMenuSpritesheetConf["meta"]["image"]), mainMenuSpritesheetConf);
    await mainMenuSpritesheet.parse();

    const mainMenu = new MainMenu(WIDTH, HEIGHT, () => {}, () => {}, backgroundMenu, mainMenuSpritesheet);
    const levelSelection = new LevelSelection();

    app.stage.addChild(mainMenu);
    app.stage.addChild(levelSelection);

    const stateDict = {
        "mainMenu": new MainMenuState(mainMenu, ),
        "levelSelection": new LevelsState(levelSelection),
        "game": new GameState(app, fieldManager, null)
    };

    const stateController = new StateMachine(stateDict, "mainMenu");

    mainMenu.onButtonStart = () => {console.log("TAPPED"); stateController.changeState("game");};
    await mainMenu.init();

    await stateController.init();

    function gameLoop() {
        const delta = app.ticker.elapsedMS / 1000;
        stateController.process(delta);
    }
// Listen for frame updates
    app.ticker.add(gameLoop);

}
main();