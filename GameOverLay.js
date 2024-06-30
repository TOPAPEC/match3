export class GameOverLay extends PIXI.Container {
    constructor(screenWidth, screenHeight, playerData) {
        super();
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.timePassed = 0;
        this.playerData = playerData;
    }

    async init() {
        console.log(this.getGlobalPosition());
        const mainMenuSpritesheetConf = await (await fetch('./interface/spritesheet.json')).json();
        this.spriteSheet = new PIXI.Spritesheet(await PIXI.Assets.load(mainMenuSpritesheetConf["meta"]["image"]), mainMenuSpritesheetConf);
        await this.spriteSheet.parse();
        this.pauseButton = new PIXI.Sprite(this.spriteSheet.textures["pauseButton.png"]);
        this.pauseButton.scale.set(0.4);
        console.log("TEXTURE", this.spriteSheet.textures["pauseButton.png"]);
        this.pauseButton.anchor.set(0.5);
        this.pauseButton.interactive = true;
        this.pauseButton.buttonMode = true;
        this.pauseButton.visible = true;
        this.scoreCounter = new PIXI.BitmapText({
            text: '12345',
            style:{
                fontFamily:'short-stack',
                fontSize: 100,
                fontStyle: 'bold',
                stroke: "#000",
                strokeThickness: 10,
            }
        })
        this.scoreCounter.anchor.set(0.5);
        console.log(this.scoreCounter, this.pauseButton);
        this.addChild(this.scoreCounter);
        this.addChild(this.pauseButton);
        this.pauseButton.x = - this.pauseButton.getGlobalPosition().x;
        this.pauseButton.y = - this.pauseButton.getGlobalPosition().y;
        this.scoreCounter.x = this.screenWidth / 2 - this.scoreCounter.getGlobalPosition().x;
        this.scoreCounter.y = this.screenWidth * 0.1 - this.scoreCounter.getGlobalPosition().y;
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