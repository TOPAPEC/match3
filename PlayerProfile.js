export class PlayerProfile {
    currentScore = 0;
    unlockedLevels = [[]];
    currentMoney = 0;

    loadFromYaGames() {

    }
    loadDefault() {
        this.unlockedLevels[0].fill(false, 0, 10);
    }

    isLevelUnlocked(chapter, level) {
        return this.unlockedLevels[chapter][level];
    }

}