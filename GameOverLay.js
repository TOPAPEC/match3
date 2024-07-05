let PIXI = require("./node_modules/pixi.js/dist/pixi.mjs");

export class GameOverLay extends PIXI.Container {
    constructor(screenWidth, screenHeight, playerData) {
        super();
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.timePassed = 0;
        this.playerData = playerData;
        this.currentScore = playerData.getCurrentScore();
        this.changeProgress = 0;
        this.initialTextSize = 1;
        this.endTextSize = 1.5;
        this.currentTextSize = 1.0;
        this.speed = 2;
    }

    async init() {
        // console.log(this.getGlobalPosition());
        const mainMenuSpritesheetConf = await (await fetch('./interface/spritesheet.json')).json();
        this.spriteSheet = new PIXI.Spritesheet(await PIXI.Assets.load(mainMenuSpritesheetConf["meta"]["image"]), mainMenuSpritesheetConf);
        await this.spriteSheet.parse();
        this.pauseButton = new PIXI.Sprite(this.spriteSheet.textures["pauseButton.png"]);
        this.pauseButton.scale.set(0.4);
        // console.log("TEXTURE", this.spriteSheet.textures["pauseButton.png"]);
        this.pauseButton.anchor.set(0.5);
        this.pauseButton.interactive = true;
        this.pauseButton.buttonMode = true;
        this.pauseButton.visible = true;
        this.scoreCounter = new PIXI.BitmapText(this.playerData.getCurrentScore(),
            {
                fontName: 'ToxigenesisRg-Bold',
                fontSize: 100,
                fontStyle: 'bold',
                stroke: "#000",
                strokeThickness: 10,
            }
        )
        this.scoreCounter.anchor.set(0.5);
        console.log(this.scoreCounter, this.pauseButton);
        this.addChild(this.scoreCounter);
        this.addChild(this.pauseButton);
        this.pauseButton.x = -this.pauseButton.getGlobalPosition().x + this.screenWidth / 8 * 7;
        this.pauseButton.y = -this.pauseButton.getGlobalPosition().y + this.screenHeight * 0.07;
        this.scoreCounter.x = this.screenWidth / 2 - this.scoreCounter.getGlobalPosition().x;
        this.scoreCounter.y = this.screenHeight * 0.07 - this.scoreCounter.getGlobalPosition().y;
        this.playerData.addScoreUpdateHook((newScore) =>  {this.changeScore(newScore)});
    }

    speed_transform(x) {
        return Math.pow(x, 0.5) * this.speed + 0.5;
    }

    process(delta) {
        if (this.endScore > this.currentScore) {
            // console.log("Transitioning");
            const speed = this.speed_transform(this.changeProgress);
            // console.log("speed", speed, this.changeProgress);
            this.changeProgress = Math.min(this.changeProgress + delta * speed, 1);
            this.currentScore = Math.ceil(this.initialScore + (this.endScore - this.initialScore) * this.changeProgress);
            this.currentTextSize = this.initialTextSize + (this.endTextSize - this.initialTextSize) * this.changeProgress;
            this.scoreCounter.text = this.currentScore
            // console.log("Current text size", this.currentTextSize, this.changeProgress, this.currentScore);
            this.scoreCounter.scale.set(this.currentTextSize);
            if (Math.abs(this.endScore - this.currentScore) < 0.5) {
                this.currentScore = this.endScore;
                this.changeProgress = 0;
            }
        } else if (Math.abs(this.currentTextSize - this.initialTextSize) > 0.0001) {
            const speed = this.speed_transform(this.changeProgress) * 4;
            this.changeProgress = Math.min(this.changeProgress + delta * speed, 1);
            this.currentTextSize = this.endTextSize + (this.initialTextSize - this.endTextSize ) * this.changeProgress;
            // console.log("CurrentTextSize", this.currentTextSize);
            this.scoreCounter.scale.set(this.currentTextSize);
        }
    }

    changeScore(newVal) {
        this.initialScore = this.currentScore;
        this.endTextSize = 1.0 + 0.5 * (Math.max(Math.log10(newVal - this.currentScore), 1.0) - 1)
        this.endScore = newVal;
        this.changeProgress = 0;
    }

}

class PauseOverLay extends PIXI.Container {
    constructor(spriteSheet) {
        super();
    }
    async init() {
        const rectangle = PIXI.Sprite.from(PIXI.Texture.WHITE);
        rectangle.width = this.screenWidth;
        rectangle.height = this.screenHeight;
        rectangle.tint = 0x0000000;
        rectangle.alpha = 0.3;
        this.addChild(rectangle);
    }
}