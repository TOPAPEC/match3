let valsWithSubstring = require("./shared.js").valsWithSubstring;
let Position = require("./Position.js").Position;
let PIXI = require("./node_modules/pixi.js/dist/pixi.mjs");

export class FieldElement extends PIXI.Container {
    wasUpdatedThisTick = false;
    initialPosition;
    destinationPosition;
    timePassed = 0;
    checked = false; // FOR FIELD MANAGER!
    MovementInterpolationFunc = (x) => {return 10 * x * x * x};
    static ElementStates = Object.freeze({
        Moving: Symbol("Moving"),
        Idle: Symbol("Idle"),
    })
    state;
    constructor(texture, size) {
        super();
        this.sprite = PIXI.Sprite.from(texture);
        this.sprite.width = size;
        this.sprite.height = size;
        this.addChild(this.sprite);
    }

    moveTo(position) {
        this.initialPosition = new Position(this.x, this.y);
        this.destinationPosition = position;
        this.timePassed = 0;
        this.state = FieldElement.ElementStates.Moving;
    }

    destroyElement() {}

    ifWasUpdated() {
        return this.wasUpdatedThisTick;
    }

    static Compare(e1, e2) {
        if (e1 instanceof Gem && e2 instanceof Gem) {
            return e1.gemNumber === e2.gemNumber;
        } else if ((e1 instanceof SuperGem && e2 instanceof Gem) || (e2 instanceof SuperGem && e1 instanceof Gem)) {
            return true;
        }
        return false;
    }

    process(delta) {
        if (this.state === FieldElement.ElementStates.Moving) {
            // console.log("moving", this.x, this.y);
            this.wasUpdatedThisTick = true;
            this.timePassed += delta;
            // console.log("delta", this.timePassed);
            const transitionProgress = Math.max(Math.min(this.MovementInterpolationFunc(this.timePassed), 1.0), 0.0);
            const x = (this.destinationPosition.x - this.initialPosition.x) *
                transitionProgress + this.initialPosition.x;
            const y = (this.destinationPosition.y - this.initialPosition.y) *
                transitionProgress + this.initialPosition.y;
            this.x = x;
            this.y = y;
            // console.log("Progress", transitionProgress);
            if (Math.abs(transitionProgress - 1.0) < 0.0001) {
                this.x = this.destinationPosition.x;
                this.y = this.destinationPosition.y;
                this.state = FieldElement.ElementStates.Idle;
            }
        } else {
            this.wasUpdatedThisTick = false;
        }
    }
}

export class Gem extends FieldElement {
    constructor(x, y, spritesheet, gemNumber, texture, size ) {
        super(texture, size);
        this.DestroyAnimation = new PIXI.AnimatedSprite(valsWithSubstring(spritesheet.textures, "gemDestroy"));
        this.DestroyAnimation.visible = false;
        this.DestroyAnimation.loop = false;
        this.DestroyAnimation.animationSpeed = 2;
        this.DestroyAnimation.x = this.sprite.width / 2;
        this.DestroyAnimation.y = this.sprite.height / 2;
        this.DestroyAnimation.animationSpeed = 4;
        this.DestroyAnimation.anchor.set(0.50, 0.50);
        this.addChild(this.DestroyAnimation);
        this.x = x;
        this.y = y;
        this.gemNumber = gemNumber;
    }

    static CompareGems(g1, g2) {
        return g1.gemNumber === g2.gemNumber;
    }

    destroyElement() {
        super.destroyElement();
        this.sprite.visible = false;
        this.DestroyAnimation.onComplete = () => {
            this.destroy();
        }
        this.DestroyAnimation.visible = true;
        this.DestroyAnimation.play();
    }
}

export class SuperGem extends FieldElement {
    constructor() {
        super();
    }
}

export class FieldWall extends FieldElement {
    constructor(x, y, spritesheet, texture, size) {
        super(texture, size);
        this.x = x;
        this.y = y;

    }


}
