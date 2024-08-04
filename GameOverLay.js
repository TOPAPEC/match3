let PIXI = require("./node_modules/pixi.js/lib/index.mjs");
const particles = require("@pixi/particle-emitter/lib/particle-emitter.js");

export class GameOverLay extends PIXI.Container {
    constructor(screenWidth, screenHeight, playerData, spritesheet) {
        super();
        this.spritesheet = spritesheet;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.timePassed = 0;
        this.playerData = playerData;
        this.currentScore = playerData.getCurrentScore();
        this.changeProgress = 0;
        this.textChangeSpeed = 2;

        this.initialTextSize = 1;
        this.endTextSize = 1.5;
        this.currentTextSize = 1.0;
        this.speed = 2;
        this.pauseButton = new PIXI.Sprite(this.spritesheet.textures["pauseButton.png"]);
        this.pauseButton.scale.set(0.4);
        this.pauseButton.anchor.set(0.5);
        this.pauseButton.interactive = true;
        this.pauseButton.buttonMode = true;
        this.pauseButton.visible = true;
        this.scoreCounter = new PIXI.BitmapText(this.playerData.getCurrentScore(),
            {
                fontName: 'ToxigenesisRg-Bold',
                fontSize: 100,
                fontStyle: 'bold',
            }
        )
        this.scoreCounter.anchor.set(0.5);
        // console.log(this.scoreCounter, this.pauseButton);
        this.addChild(this.pauseButton);
        const cnt = new PIXI.ParticleContainer();
        this.addChild(cnt);
        this.addChild(this.scoreCounter);
        this.playerData.addScoreUpdateHook((newScore) =>  {this.changeScore(newScore)});

        let config = PIXI.Assets.get("./particles/score.json");
        // console.log("PART CONFIG", config);
        config.behaviors.push({ type: 'textureSingle', config: { texture: this.spritesheet.textures["particle1.png"] } });
        this.emitter = new particles.Emitter(cnt, config);
        this.emitter.emit = false;

    }

    init() {
        // console.log("SCREEN WIDTH", this.screenWidth, this.screenHeight);
        this.pauseButton.x = -this.getGlobalPosition().x + this.screenWidth / 8 * 7;
        this.pauseButton.y = -this.getGlobalPosition().y + this.screenHeight * 0.07;
        this.scoreCounter.x = this.screenWidth / 2 - this.getGlobalPosition().x;
        this.scoreCounter.y = this.screenHeight * 0.07 - this.getGlobalPosition().y;
        this.emitter.spawnPos.x = this.scoreCounter.x;
        this.emitter.spawnPos.y = this.scoreCounter.y;
    }

    speed_transform(x) {
        return Math.pow(x, 0.5) * this.speed * 0.5 + 0.5;
    }

    process(delta) {
        if (Math.abs(this.changeProgress - 1.0) > 0.01 && Math.abs(this.endScore - this.currentScore) > 0.001) {
            // console.log("Transitioning");
            const speed = this.speed_transform(this.changeProgress);
            // console.log("speed", speed, this.changeProgress);
            this.changeProgress = Math.min(this.changeProgress + delta * speed, 1);
            this.currentScore = Math.ceil(this.initialScore + (this.endScore - this.initialScore) * this.changeProgress);
            this.currentTextSize = Math.min(this.initialTextSize +
                (this.endTextSize - this.initialTextSize) * (this.changeProgress * this.textChangeSpeed), this.endTextSize);
            this.scoreCounter.text = this.currentScore
            // console.log("Current text size", this.currentTextSize, this.changeProgress, this.currentScore);
            this.scoreCounter.scale.set(this.currentTextSize);
            if (Math.abs(this.changeProgress - 1.0) < 0.01) {
                this.emitter.emit = false;
                this.currentScore = this.endScore;
            }
        } else if (this.currentTextSize > this.initialTextSize) {
            const speed = this.speed_transform(this.changeProgress) * 0.5;
            this.changeProgress = Math.min(this.changeProgress - delta * speed, 1);
            this.currentTextSize = this.endTextSize + (this.initialTextSize - this.endTextSize) * (1 - this.changeProgress);
            // console.log("CurrentTextSize", this.currentTextSize, this.changeProgress);
            this.scoreCounter.scale.set(this.currentTextSize);
        } else {
            this.currentTextSize = this.initialTextSize;
        }
    }

    changeScore(newVal) {
        this.currentTextSize = this.initialTextSize;
        this.currentTextSize = this.endScore;

        this.initialScore = this.currentScore;
        this.endTextSize = 1.0 + 1.0 * (Math.max(Math.log10(newVal - this.currentScore), 1.0) - 1);
        this.emitter.frequency = 1 / ((Math.max(Math.log10(newVal - this.currentScore), 1.0) - 1) * 1000);
        this.emitter.emit = true;
        this.endScore = newVal;
        this.changeProgress = 0;
        // console.log("CHANGING", this.endScore, this.endTextSize, this.emitter.maxParticles);
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