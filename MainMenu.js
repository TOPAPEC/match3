
export class MainMenu extends PIXI.Container {
    constructor(screenWidth, screenHeight, onStart, onLevels, background, spriteSheet) {
        super();
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.onButtonStart = onStart;
        this.onButtonLevels = onLevels;
        this.menuBackground = background;
        this.spriteSheet = spriteSheet;
        this.timePassed = 0;
        this.switchingToGame = false;
        this.switchingToLevels = false;
    }

    prepareToSwitch() {
        this.timePassed = 0;
        this.startButton.interactive = false;
        this.levelSelectButton.interactive = false;
    }
    end() {
        this.prepareToSwitch();
        this.switchingToLevels = false;
        this.switchingToGame = false;
    }

    async init() {

        console.log(this.menuBackground);
        this.addChild(this.menuBackground);
        this.menuBackground.x = -this.menuBackground.getGlobalPosition().x;
        this.menuBackground.y = -this.menuBackground.getGlobalPosition().y;

        const rectangle = PIXI.Sprite.from(PIXI.Texture.WHITE);
        rectangle.width = this.screenWidth;
        rectangle.height = this.screenHeight;
        rectangle.tint = 0x0000000;
        rectangle.alpha = 0.3;
        this.addChild(rectangle);

        this.startButton = new PIXI.Sprite(this.spriteSheet.textures["startLevel.png"]);
        this.startButton.x = this.screenWidth / 2;
        this.startButton.y = this.screenHeight / 5 * 2;
        this.startButton.anchor.set(0.5);
        this.startButton.interactive = true;
        this.startButton.buttonMode = true;
        this.startButton.on("pointertap", () => {this.switchingToGame = true; this.prepareToSwitch();});
        this.levelSelectButton = new PIXI.Sprite(this.spriteSheet.textures["selectLevel.png"]);
        this.levelSelectButton.x = this.screenWidth / 2;
        this.levelSelectButton.y = this.screenHeight / 5 * 4;
        this.levelSelectButton.anchor.set(0.5);
        this.levelSelectButton.interactive = true;
        this.levelSelectButton.buttonMode = true;
        this.levelSelectButton.scale.set(0.7);
        this.levelSelectButton.on("pointertap", () => {this.switchingToLevels = true; this.prepareToSwitch();});
        this.addChild(this.startButton);
        this.addChild(this.levelSelectButton);
    }

    start() {
        this.timePassed = 0;
        this.startButton.interactive = true;
        this.levelSelectButton.interactive = true;
    }

    easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }

    process(delta) {
        if (!this.switchingToLevels && !this.switchingToGame) {
            this.timePassed += delta;
            if (this.timePassed > Math.PI) {
                this.timePassed = 0;
            }
            this.startButton.scale.set(Math.sin(this.timePassed) / 8 + 0.95);
        } else if (this.switchingToGame) {
           this.timePassed += delta;
           if (this.timePassed > 0.5) {
               this.onButtonStart();
           }
           this.startButton.scale.set(this.easeOutCubic(this.timePassed * 2) * 0.2 + 0.8);
        }
    }
}