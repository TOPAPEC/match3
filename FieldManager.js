function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
export class FieldManager {
    field = [];
    fieldSprites = [];
    fieldTraverseMap = [];
    markedToCompact = [];
    constructor(x, y, fieldWidth, fieldHeight, spritesheet, app, tidupper, tidlower) {
        this.x = x;
        this.y = y;
        this.fieldWidth = fieldWidth;
        this.fieldHeight = fieldHeight;
        this.spritesheet = spritesheet;
        this.app = app;
        this.tsize = this.spritesheet.textures[`tile1`].width;
        this.tcount = Object.keys(this.spritesheet.textures).length;
        this.tidupper = tidupper;
        this.tidlower = tidlower;
        this.destroyX = []
        this.destroyY = []
        this.destroyThreshold = 3
    }

    fillCell(x, y, tid) {
        if (this.fieldSprites[x][y]) {
            this.fieldSprites[x][y].destroy();
        }
        const texture = this.spritesheet.textures[`tile${tid}`];
        let sprite = new PIXI.Sprite(texture);
        sprite.interactive = true;
        sprite.hitArea = new PIXI.Rectangle(0, 0, this.tsize, this.tsize);
        sprite.onpointerdown = (event) => {
            this.destroyX.push(x);
            this.destroyY.push(y);
            this.chainFill(x, y, this.field[x][y]);
            if (this.destroyX.length >= this.destroyThreshold) {
                for (let i = 0; i < this.destroyX.length; i++) {
                    this.fieldSprites[this.destroyX[i]][this.destroyY[i]].destroy();
                    this.fieldTraverseMap[this.destroyX[i]][this.destroyY[i]] = 0;
                    this.field[this.destroyX[i]][this.destroyY[i]] = 0;
                    this.markedToCompact[this.destroyX[i]] = true;
                }
            }
            for (let i = 0; i < this.markedToCompact.length; i++) {
                if (this.markedToCompact[i]) {
                    let bottom = 0;
                    for (let j = 0; j < this.fieldHeight; j++) {
                        if (this.field[i][j] === 0) {
                            bottom = j;
                        }
                    }
                    let ceil = bottom - 1;
                    while (ceil >= 0) {
                        if (this.field[i][ceil] !== 0) {
                            this.field[i][bottom] = this.field[i][ceil];
                            this.field[i][ceil] = 0;
                            bottom -= 1;
                        }
                        ceil -= 1;
                    }
                    while (bottom >= 0) {
                        this.fillCell(i, bottom, 20);
                        bottom -= 1;
                    }
                }
            }
            this.destroyX = [];
            this.destroyY = [];
        }
        sprite.x = this.x + this.tsize * x;
        sprite.y = this.y + this.tsize * y;
        this.field[x][y] = tid;
        this.fieldSprites[x][y] = sprite;
        this.app.stage.addChild(sprite);
        return sprite
    }

    chainFill(x, y, tid) {
        this.fieldTraverseMap[x][y] = 1;
        const dx = [0, 1, -1, 0];
        const dy = [1, 0, 0, -1];
        for (let i = 0; i < dx.length; i++) {
            const nx = x + dx[i];
            const ny = y + dy[i];
            if (nx < 0 || nx >= this.fieldWidth || ny < 0 || ny >= this.fieldHeight || this.field[nx][ny] !== tid ||
                this.fieldTraverseMap[nx][ny] !== 0) {
                continue;
            }
            this.destroyX.push(nx);
            this.destroyY.push(ny);
            this.chainFill(nx, ny, tid);
        }
    }

    init() {
        for (let i = 0; i < this.fieldWidth; i++) {
            this.field.push([]);
            this.fieldSprites.push([]);
            this.fieldTraverseMap.push([]);
            this.markedToCompact.push(false);
            for (let j = 0; j < this.fieldHeight; j++) {
                const spriteNumber = getRandomInt(this.tidlower, this.tidupper);
                this.field[i].push(spriteNumber);
                this.fieldSprites[i].push(null);
                this.fieldTraverseMap[i].push(0);
                this.fillCell(i, j, spriteNumber)
            }
        }
    }

    redraw() {

    }
}