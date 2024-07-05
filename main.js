let WinScaling = require("./WindowScaling");
let FieldManager = require("./FieldManagerOptimized.js");
import {MainMenu} from "./MainMenu.js";
import {LevelSelection} from "./LevelSelection.js";
import {GameState, LevelsState, MainMenuState, StateMachine} from "./StateMachine.js";
import {PlayerProfile} from "./PlayerProfile.js";
let PIXI = require("./node_modules/pixi.js/dist/pixi.mjs");
let shared = require("./shared.js");

async function main() {
    const WIDTH = 750;
    const HEIGHT = 1334;

    console.log(PIXI.VERSION);
    const app = new PIXI.Application({
        width: WIDTH,
        height: HEIGHT,
        background: 0x80ced6,
        resolution: window.devicePixelRatio || 1,
    });
    document.body.appendChild(app.view);

    var resizer = new WinScaling.Resizer(window, app, WIDTH, HEIGHT);
    window.addEventListener('resize', resizer.resize);

    await PIXI.Assets.load("./text/toxigenesis.xml");

    const spritesheetConf = await (await fetch('./images/spritesheet.json')).json();
    const spritesheet = new PIXI.Spritesheet(await PIXI.Assets.load(spritesheetConf["meta"]["image"]), spritesheetConf);
    await spritesheet.parse();


    const fieldWidth = 9;
    const fieldHeight = 11;
    const tileSize = spritesheet.textures[`gem1.png`].width / 2;
    const fieldX = (WIDTH - tileSize * fieldWidth) / 2;
    const fieldY = (HEIGHT - tileSize * fieldHeight) / 2;
    const gemTypes = 5;

    const backgroundGame = new PIXI.Sprite(spritesheet.textures[`background.png`]);
    backgroundGame.width = WIDTH;
    backgroundGame.height = HEIGHT;


    const playerData = new PlayerProfile();
    playerData.loadDefault();

    let fieldManager = new FieldManager.FieldManagerOptimized(WIDTH, HEIGHT, spritesheet, fieldX, fieldY, fieldWidth, fieldHeight,
        gemTypes, backgroundGame, playerData);
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

    const mainMenu = new MainMenu(WIDTH, HEIGHT, () => {}, () => {}, spritesheet);
    const levelSelection = new LevelSelection(WIDTH, HEIGHT, spritesheet);

    app.stage.addChild(mainMenu);
    app.stage.addChild(levelSelection);

    const stateDict = {
        "mainMenu": new MainMenuState(mainMenu, ),
        "levelSelection": new LevelsState(levelSelection),
        "game": new GameState(app, fieldManager)
    };

    const stateController = new StateMachine(stateDict, "mainMenu");

    mainMenu.onButtonStart = () => {console.log("TAPPED"); stateController.changeState("levelSelection");};
    await mainMenu.init();
    levelSelection.startGameFunc = (chapterNumber) => {console.log("Game Start"); stateController.chapter = chapterNumber; stateController.changeState("game");};
    await levelSelection.init();
    await stateController.init();

    fieldManager.loadLevel((await (await fetch("./levels/level1_1.json")).json()).schema);

    function gameLoop() {
        const delta = app.ticker.elapsedMS / 1000;
        stateController.process(delta);
    }



// Listen for frame updates
    app.ticker.add(gameLoop);

}
main();