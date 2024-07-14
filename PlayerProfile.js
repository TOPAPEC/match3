let PIXI = require("./node_modules/pixi.js/lib/index.mjs");

export class PlayerProfile {
    currentScore = 0;
    unlockedLevels = [[]];
    currentMoney = 0;
    currentScoreUpdateHooks = []

    addScoreUpdateHook(hook) {
        this.currentScoreUpdateHooks.push(hook);
    }

    loadFromYaGames() {

    }

    loadDefault() {
        this.unlockedLevels[0].fill(false, 0, 10);
    }

    isLevelUnlocked(chapter, level) {
        return this.unlockedLevels[chapter][level];
    }

    getCurrentScore() {
        return this.currentScore;
    }

    updateCurrentScore(newVal) {
        this.currentScore = newVal;
        for (let hook of this.currentScoreUpdateHooks) {
            console.log("CALL HOOK");
            hook(newVal);
        }
    }

}