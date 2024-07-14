let WinScaling = require("./WindowScaling");
let FieldManager = require("./FieldManagerOptimized.js");
let MainMenu = require("./MainMenu.js").MainMenu;
let LevelSelection = require("./LevelSelection.js").LevelSelection;
let _StateMachine = require("./StateMachine.js");
let GameState = _StateMachine.GameState, LevelsState = _StateMachine.LevelsState, MainMenuState = _StateMachine.MainMenuState, StateMachine = _StateMachine.StateMachine;
let PlayerProfile = require("./PlayerProfile.js").PlayerProfile;
let PIXI = require("./node_modules/pixi.js/lib/index.mjs");
let shared = require("./shared.js");
let FieldManagerV2 = require("./FieldManagerV2.js").FieldManagerV2;
const particles = require("@pixi/particle-emitter/lib/particle-emitter.js");

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


    await PIXI.Assets.load("./particles/score.json");
    const tileSize = 64;
    const gemTypes = 4;

    const playerData = new PlayerProfile();
    playerData.loadDefault();

    let fieldManager = new FieldManagerV2(WIDTH, HEIGHT, tileSize, spritesheet, playerData)
    fieldManager.visible = false;
    await fieldManager.loadLevel(1);
    app.stage.addChild(fieldManager);

    resizer.resize();
    resizer.resize();
    resizer.resize();
    resizer.resize();
    resizer.resize();
    resizer.resize();


    app.stage.eventMode = 'static';

    const mainMenu = new MainMenu(WIDTH, HEIGHT, () => {}, () => {}, spritesheet);
    const levelSelection = new LevelSelection(WIDTH, HEIGHT, spritesheet);

    app.stage.addChild(mainMenu);
    app.stage.addChild(levelSelection);

    const stateDict = {
        "mainMenu": new MainMenuState(mainMenu, ),
        "levelSelection": new LevelsState(levelSelection),
        "game": new GameState(app, fieldManager)
    };

    const stateController = new StateMachine(stateDict, "levelSelection");

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