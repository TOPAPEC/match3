let PIXI = require("./node_modules/pixi.js/lib/index.mjs");

export class StateMachine {
    constructor(stateDict, initialState) {
        this.stateDict = stateDict;
        this.initialState = initialState;
        this.currentState = null;
        this.chapter = 1;
    }
    async init() {
        for (const state in this.stateDict) {
            this.stateDict[state].end();
        }
        this.currentState = this.stateDict[this.initialState];
        await this.currentState.start();
    }
    async changeState(state) {
        if (this.currentState === null || this.currentState === state) {
            return;
        }
        this.currentState.end();
        this.currentState = this.stateDict[state];
        if (state === "game") {
            this.currentState.chapter = this.chapter;
        }
        await this.currentState.start();
    }
    process(delta) {
        this.currentState.process(delta);
    }
}

class StateBase {

    async start() {

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
       this.chapter = 1;
    }
    async start() {
        this.fieldManager.start();
        await this.fieldManager.loadLevel(this.chapter);
    }
    end() {
        this.fieldManager.end();
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
    async start() {
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
    async start() {
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