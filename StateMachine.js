let PIXI = require("./node_modules/pixi.js/dist/pixi.mjs");

export class StateMachine {
    constructor(stateDict, initialState) {
        this.stateDict = stateDict;
        this.initialState = initialState;
        this.currentState = null;
        this.chapter = 1;
    }
    init() {
        for (const state in this.stateDict) {
            this.stateDict[state].end();
        }
        this.currentState = this.stateDict[this.initialState];
        this.currentState.start();
    }
    changeState(state) {
        if (this.currentState === null || this.currentState === state) {
            return;
        }
        this.currentState.end();
        this.currentState = this.stateDict[state];
        if (state === "game") {
            this.currentState.fieldManager.chapter = this.chapter;
        }
        this.currentState.start();
    }
    process(delta) {
        this.currentState.process(delta);
    }
}

class StateBase {

    start() {

    }
    end() {

    }
    process(delta) {

    }
}

export class GameState extends StateBase {
    constructor(app, fieldManager){
       super();
       this.fieldManager = fieldManager;
       this.app = app;
    }
    start() {
        this.fieldManager.visible = true;
        this.fieldManager.setInteractive(true);
        this.fieldManager.reloadLevel();
    }
    end() {
        this.fieldManager.visible = false;
        this.fieldManager.setInteractive(false);
    }
    process(delta) {
        this.fieldManager.process(delta)
    }
}

export class MainMenuState extends StateBase {

    constructor(mainMenu) {
        super();
        this.mainMenu = mainMenu;
    }
    start() {
        this.mainMenu.visible = true;
        this.mainMenu.start();
    }
    end() {
        this.mainMenu.visible = false;
        this.mainMenu.end();
    }
    process(delta) {
        this.mainMenu.process(delta);
    }
}

export class LevelsState extends StateBase {

    constructor(levelsPage) {
        super();
        this.levelsPage = levelsPage;
    }
    start() {
        this.levelsPage.visible = true;
        this.levelsPage.start();
    }
    end() {
        this.levelsPage.visible = false;
        this.levelsPage.end();
    }
    process(delta) {
        this.levelsPage.process(delta);
    }
}