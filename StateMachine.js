export class StateMachine {
    constructor(stateDict, initialState) {
        this.stateDict = stateDict;
        this.initialState = initialState;
        this.currentState = null;
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
    constructor(app, fieldManager, overlay) {
       super();
       this.fieldManager = fieldManager;
       this.overlay = overlay;
       this.app = app;
    }
    start() {
        this.fieldManager.visible = true;
        this.fieldManager.setInteractive(true);
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
    }
    end() {
        this.levelsPage.visible = false;
    }
    process(delta) {

    }
}