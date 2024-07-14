let PIXI = require("./node_modules/pixi.js/lib/index.mjs");

export class LevelSelection extends PIXI.Container {
    constructor(screenWidth, screenHeight, spritesheet) {
        super();
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.spritesheet = spritesheet;
        this.startButtonY = screenHeight / 4 * 3;
        this.startButtonX = screenWidth / 2;
        this.startButtonChangeY = 0;
        this.timePassed = 0;
    }
    async init() {
        this.background = new PIXI.Sprite(this.spritesheet.textures[`backgroundChapter1.jpg`]);
        this.background.width = this.screenWidth;
        this.background.height = this.screenHeight;
        this.addChild(this.background);
        const rectangle = PIXI.Sprite.from(PIXI.Texture.WHITE);
        rectangle.width = this.screenWidth;
        rectangle.height = this.screenHeight;
        rectangle.tint = 0x0000000;
        rectangle.alpha = 0.1;
        this.addChild(rectangle)
        this.startButton = new PIXI.Sprite(this.spritesheet.textures[`ButtonDefault.png`]);
        this.startButton.eventMode = "static";
        this.startButton.x = this.startButtonX;
        this.startButton.y = this.startButtonY;
        this.startButton.anchor.set(0.5);
        this.startButton.onpointerenter = () => {
            this.startButton.texture = this.spritesheet.textures[`ButtonHover.png`];
        }
        this.startButton.onpointerleave = () => {
            this.startButton.texture = this.spritesheet.textures[`ButtonDefault.png`];
        }
        this.startButton.onpointerup = () => {this.startGameFunc()};
        this.ButtonText = new PIXI.BitmapText("Begin game",
            {
                fontName: 'ToxigenesisRg-Bold',
                fontSize: 45,
            }
        )
        this.ButtonText.y = -this.startButton.height * 0.1;
        this.ButtonText.anchor.set(0.5);

        this.startButton.addChild(this.ButtonText);
        this.addChild(this.startButton);
    }
    process(delta) {
        this.timePassed += delta;
        this.startButtonChangeY = Math.sin(this.timePassed) * 20;
        this.startButton.y = this.startButtonY + this.startButtonChangeY;
        console.log("ITER")
    }
    start() {
        this.eventMode = "static";
    }
    end() {
        this.eventMode = "none";
    }
}