export class Gem extends PIXI.Container {
    dy;
    sy;
    distY;
    isMoving = false;
    moveTime;

    constructor(texture, tid, x, y, poofSpritesheet, superGemSpritesheet, isSuperGem, destoyAnimSpritesheet) {
        super();

        if (isSuperGem) {
            this.superGemAnimation = new PIXI.AnimatedSprite(Object.values(superGemSpritesheet.textures));
            this.superGemAnimation.loop = true;
            this.superGemAnimation.play();
            this.superGemAnimation.animationSpeed = 0.8;
            this.addChild(this.superGemAnimation);
        }
        this.sprite = new PIXI.Sprite(texture);
        this.addChild(this.sprite);
        this.isSuperGem = isSuperGem;
        if (isSuperGem) {
            this.superGemAnimation.x = this.sprite.width / 2;
            this.superGemAnimation.y = this.sprite.height / 2;
            this.superGemAnimation.anchor.set(0.53, 0.53);
        }
        this.animation = new PIXI.AnimatedSprite(Object.values(poofSpritesheet.textures));
        this.animation.visible = false;
        this.animation.animationSpeed = 0.3;
        this.animation.loop = false;
        this.impact_animation = false;
        this.addChild(this.animation);
        this.destroyAnimation = new PIXI.AnimatedSprite(Object.values(destoyAnimSpritesheet.textures));
        this.destroyAnimation.visible = false;
        this.destroyAnimation.loop = false;
        this.destroyAnimation.x = this.sprite.width / 2;
        this.destroyAnimation.y = this.sprite.height / 2;
        this.destroyAnimation.animationSpeed = 2;
        this.destroyAnimation.anchor.set(0.50, 0.50);
        this.impact_animation = false;
        this.addChild(this.destroyAnimation);

        this.x = x;
        this.y = y;
        this.tid = tid;
        this.is_checked = false;
        this.isMoving = false;
        this.dy = 0;
        this.dx = 0;
        this.sy = 0;
        this.sx = 0;
        this.distY = 0;
        this.distX = 0;
        this.moveProgress = 0;
    }

    setupAnimation() {
        this.animation.x = this.sprite.width / 2;
        this.animation.y = this.sprite.height * 0.9;
        this.animation.anchor.set(0.5);
        this.animation.currentFrame = 0;
        this.animation.stop()
        this.animation.visible = false;
    }

    playAnimation() {
        this.animation.visible = true;
        this.animation.play();
    }

    moveTo(x, y, speed = 2, impact_animation=false) {
        this.speed = speed;
        this.impact_animation = impact_animation;
        this.dy = y;
        this.dx = x;
        this.sy = this.y;
        this.sx = this.x;
        this.distX = this.dx - this.sx;
        this.distY = this.dy - this.sy;
        this.isMoving = true;
    }

    speed_transform(x) {
        return Math.pow(x, 0.5) * this.speed + 0.5;
    }

    destroyGem() {
        this.sprite.visible = false;
        if (this.isSuperGem) {
            this.superGemAnimation.visible = false;
        }
        this.destroyAnimation.onComplete = () => {
            this.destroy();
        }
        this.destroyAnimation.visible = true;
        this.destroyAnimation.play();
    }

    process(delta) {
        if (this.moveProgress < 1) {
            const speed = this.speed_transform(this.moveProgress);
            this.moveProgress += speed * delta;
            this.y = this.sy + this.moveProgress * this.distY;
            this.x = this.sx + this.moveProgress * this.distX;
        }
        else if (this.isMoving === true) {
            this.x = this.dx;
            this.y = this.dy;
            this.isMoving = false;
            this.moveProgress = 0;
            if (this.impact_animation) {
                this.setupAnimation();
                this.playAnimation();
            }
        }
    }

}
