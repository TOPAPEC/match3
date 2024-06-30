import {Gem} from "./Gem.js";
import {GameOverLay} from "./GameOverLay.js";

export class FieldManagerOptimized extends PIXI.Container {
    field;
    gemDown = null;
    checkForMatch = []
    dx = [0, 1, -1, 0];
    dy = [1, 0, 0, -1];
    destroyQueue = [];
    tmpQueue = [];
    destroyThreshold = 3;
    swapValidCombination;
    gemUp = null;
    anyMatch = false;
    poofSpritesheet;
    superJemIds = [9, 10];
    destroyed = 0;

    isSuperGem(tid) {
        return this.superJemIds.includes(tid);
    }

    constructor(screenWidth, screenHeight, spritesheet, x, y, fieldWidth, fieldHeight, gemTypes, background, rectangle, playerData) {
        super();
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.spritesheet = spritesheet;
        this.fieldBackground = background;
        this.fieldRectangle = rectangle;
        this.fieldWidth = fieldWidth;
        this.fieldHeight = fieldHeight;
        this.x = x;
        this.y = y;
        this.tsize = this.spritesheet.textures[`tile1`].width;
        this.field = new Array(fieldHeight).fill(0).map(() => new Array(fieldWidth).fill(0));;
        this.gemTypes = gemTypes;
        this.playerData = playerData;
    }

    castXYToCoordinates(x, y) {
        const i = Math.floor(x / this.tsize);
        const j = Math.floor(y / this.tsize);
        return [i, j];
    }

    castXYToGem(x, y) {
        const i = Math.floor(x / this.tsize);
        const j = Math.floor(y / this.tsize);
        return this.field[i][j];
    }

    isWall(i, j) {
        return this.field[i][j].tid === -1;
    }

    swapGems(gem1, gem2) {
        const i1 = Math.floor(gem1.x / this.tsize);
        const j1 = Math.floor(gem1.y / this.tsize);
        const i2 = Math.floor(gem2.x / this.tsize);
        const j2 = Math.floor(gem2.y / this.tsize);
        // console.log(`Swapping {${i1}; ${j1}} of {${i2}; ${j2}}`);
        // console.log(`Fieldxy {${this.x};${this.y}}`)
        // console.log(`Field ${this.width} ${this.height}`)
        if (!(Math.abs(i1 - i2) + Math.abs(j1 - j2) === 1 && Math.abs(i1 - i2) * Math.abs(j1 - j2) === 0) ||
            (this.isWall(i1, j1) || this.isWall(i2, j2))) {
            return false;
        }
        // console.log("Swap is possible");
        this.checkForMatch.push([i1, j1], [i2, j2]);
        this.field[i1][j1] = gem2;
        this.field[i2][j2] = gem1;
        return true;
    }

    onPointerDownFunc(evt) {
        const local = this.toLocal(evt.data.global);
        this.gemDown = this.castXYToGem(local.x, local.y);
    }

    determineDirection(x, y, threshold=0) {
        const length = Math.sqrt(x * x + y * y);

        if (length <= threshold) {
            return [0, 0];
        }

        if (x === 0 && y === 0) {
            return [0, 0];
        }

        if (Math.abs(x) > Math.abs(y)) {
            if (x > 0) {
                return [1, 0];
            } else {
                return [-1, 0];
            }
        } else {
            if (y > 0) {
                return [0, 1];
            } else {
                return [0, -1];
            }
        }
    }

    onPointerUpFunc(evt) {
        if (this.gemDown) {
            // console.log("Swapping");
            const local = this.toLocal(evt.data.global);
            this.locknCountDestroyed()
            const dx = local.x - (this.gemDown.x + this.tsize / 2);
            const dy = local.y - (this.gemDown.y + this.tsize / 2);
            const direction = this.determineDirection(dx, dy);
            // console.log(direction);
            this.gemUp = this.castXYToGem(this.gemDown.x + direction[0] * this.tsize, this.gemDown.y + direction[1] * this.tsize);
            if(!this.swapGems(this.gemDown, this.gemUp)) {
                this.gemDown = null;
                this.gemUp = null;
                return;
            }
            const gx = this.gemUp.x;
            const gy = this.gemUp.y;
            const gdx = this.gemDown.x;
            const gdy = this.gemDown.y;
            this.gemUp.moveTo(this.gemDown.x, this.gemDown.y, 8);
            this.gemDown.moveTo(gx, gy, 8);
            this.swapValidCombination = this.checkLocalMatch();
        }
    }


    finishSwap() {
        if (!this.swapValidCombination) {
            const gx = this.gemUp.x;
            const gy = this.gemUp.y;
            const gdx = this.gemDown.x;
            const gdy = this.gemDown.y;
            this.swapGems(this.gemUp, this.gemDown);
            this.gemUp.moveTo(gdx, gdy, 4);
            this.gemDown.moveTo(gx, gy, 4);
            this.swapValidCombination = false;
        }
        this.gemUp = null;
        this.gemDown = null;
    }


    isValidPlacement(row, col, gem) {
        const numRows = this.field.length;
        const numCols = this.field[0].length;
        const field = this.field;
        // Check horizontally
        if (col > 1 && field[row][col - 1] === gem && field[row][col - 2] === gem) return false;
        if (col < numCols - 2 && field[row][col + 1] === gem && field[row][col + 2] === gem) return false;
        if (col > 0 && col < numCols - 1 && field[row][col - 1] === gem && field[row][col + 1] === gem) return false;

        // Check vertically
        if (row > 1 && field[row - 1][col] === gem && field[row - 2][col] === gem) return false;
        if (row < numRows - 2 && field[row + 1][col] === gem && field[row + 2][col] === gem) return false;
        if (row > 0 && row < numRows - 1 && field[row - 1][col] === gem && field[row + 1][col] === gem) return false;

        // No matches found, placement is valid
        return true;
    }


    generateTid(i, j) {
        let tid = 1;
        do {
            tid = Math.floor(Math.random() * this.gemTypes) + 1;  // Generate a random gem (1 to 8)
        } while (!this.isValidPlacement(i, j, tid));
        const rand = Math.random();
        if (rand < 0.005) {
            return this.superJemIds[0];
        }
        if (rand > 0.005 && rand < 0.01) {
            return this.superJemIds[1];
        }
        return tid;
    }

    createGem(tid, gemX, gemY) {
        const coordinates = this.castXYToCoordinates(gemX, gemY);
        let texture = null;
        if (tid === -1) {
            texture = PIXI.Sprite.from(PIXI.Texture.WHITE);
            texture.alpha = 0;
            texture.width = this.tsize;
            texture.height = this.tsize;
        }
        else {
            texture = new PIXI.Sprite(this.spritesheet.textures[`tile${tid}`]);
        }
        const gem = new Gem(texture, tid, gemX, gemY, this.poofSpritesheet, this.chargedAnimation, this.isSuperGem(tid), this.destoyAnimation);
        return gem;

    }

    async init() {
        this.addChild(this.fieldBackground);
        this.addChild(this.fieldRectangle);
        this.fieldBackground.x = -this.fieldBackground.getGlobalPosition().x;
        this.fieldBackground.y = -this.fieldBackground.getGlobalPosition().y;
        this.fieldRectangle.x = -this.fieldRectangle.getGlobalPosition().x;
        this.fieldRectangle.y = -this.width * 0.05
        this.poofSpritesheet = await this.loadSpritesheed();
        await this.poofSpritesheet.parse();
        const chargedAnimationTexture = await (await fetch('./tilesets/charged_animation.json')).json();
        this.chargedAnimation = new PIXI.Spritesheet(await PIXI.Assets.load(chargedAnimationTexture["meta"]["image"]), chargedAnimationTexture);
        await this.chargedAnimation.parse();
        const destroyAnimationTexture = await (await fetch('./tilesets/gem_destroy_animation.json')).json();
        this.destoyAnimation = new PIXI.Spritesheet(await PIXI.Assets.load(destroyAnimationTexture["meta"]["image"]), destroyAnimationTexture);
        await this.destoyAnimation.parse();
        const textureExample = this.spritesheet.textures["tile1"];
        this.textureHeight = textureExample.height;
        this.textureWidth = textureExample.width;
        for (let i = 0; i < this.fieldWidth; i++) {
            for (let j = 0; j < this.fieldHeight; j++) {
                const gemX = i * this.textureWidth;
                const gemY = j * this.textureHeight;
                let tid = this.generateTid(i, j);
                let gem = this.createGem(tid, gemX, gemY);
                this.field[i][j] = gem;
                this.addChild(gem);
            }
        }
        this.eventMode = 'static';
        this.on("pointerdown", this.onPointerDownFunc);
        this.on("pointerup", this.onPointerUpFunc);

        this.overlay = new GameOverLay(this.screenWidth, this.screenHeight, this.playerData);
        this.addChild(this.overlay);
        await this.overlay.init();
    }

    async loadSpritesheed() {
        let config = await (await fetch('./tilesets/poof.json')).json()
        return new PIXI.Spritesheet(await PIXI.Assets.load(config["meta"]["image"]), config);
    }

    moveGemToCell(gem, i, j, speed) {
        const x = i * this.tsize;
        const y = j * this.tsize;
        const ci = Math.floor(gem.x / this.tsize);
        const cj = Math.floor(gem.y / this.tsize);
        if (ci >= 0 && ci < this.fieldWidth && cj >= 0 && cj < this.fieldHeight ) {
            this.field[ci][cj] = null;
        }
        this.field[i][j] = gem;
        gem.moveTo(x, y, speed, true);
    }


    partialRefill() {
        this.locknCountDestroyed();
        for (let i = 0; i < this.fieldWidth; i++) {
            let j = this.fieldHeight - 1;
            while (j >= 0) {
                if (this.field[i][j] === null) {
                    let filled = false;
                    for (let k = j - 1; k >= 0; k--) {
                        if (this.field[i][k] !== null && !this.isWall(i, k)) {
                            this.moveGemToCell(this.field[i][k], i, j, 8);
                            if (!this.superJemIds.includes(this.field[i][j].tid)) {
                                this.checkForMatch.push([i, j]);
                            }
                            filled = true;
                            break;
                        }
                    }
                    if (!filled) {
                        // console.log("Creating new gem");
                        const tid = this.generateTid(i, j);
                        const gemX = i * this.tsize;
                        const gemY = -4 * this.tsize;
                        const new_gem = this.createGem(tid, gemX, gemY);
                        this.addChild(new_gem);
                        this.moveGemToCell(new_gem, i, j, 8);
                        if (!this.superJemIds.includes(tid)) {
                            this.checkForMatch.push([i, j]);
                        }
                    }
                }
                j--;
            }
        }
        this.checkLocalMatch();
        // console.log("Refil end");
    }

    process(delta) {
        let anyoneMoved = false;
        for (const el of this.children) {
            if (el.isMoving) {
                anyoneMoved = true;
                el.process(delta);
            }
        }
        if (!anyoneMoved) {
            // console.log("Movement stopped");
            if (this.gemUp !== null) {
                // console.log("No one moved finishing swap")
                this.finishSwap();
            }
            if (this.destroyQueue.length > 0 || this.children.length < this.fieldWidth * this.fieldHeight) {
                this.emptyDestroyQueue(this.anyMatch);
                this.partialRefill();
            } else {
                const destroyedGems = this.unlocknGetDestroyed();
                console.log(destroyedGems);
            }
            for (const child of this.children) {
                child.is_checked = false;
            }
        }
    }

    setInteractive(isInteractive) {
        this.interactiveChildren = isInteractive;
        this.interactive = isInteractive;
    }

    locknCountDestroyed() {
        this.setInteractive(false);
    }

    unlocknGetDestroyed() {
        this.setInteractive(true);
        const destroyed = this.destroyed;
        this.destroyed = 0;
        return destroyed;
    }

    crossExplosion(i, j) {
        let cnt = 0;
        for (let k = 0; k < this.fieldWidth; k++) {
            if (k === i) {
                continue;
            }
            cnt++;
            this.destroyQueue.push([k, j]);
        }
        for (let k = 0; k < this.fieldHeight; k++) {
            if (k === j) {
                continue;
            }
            cnt++;
            this.destroyQueue.push([i, k]);
        }
        // console.log(`Cross explosion for ${cnt} elements`);
    }

    emptyDestroyQueue(destroy=false) {
        // console.log(`Called destroy queue ${destroy}`);
        if (destroy) {
            for (const pair of this.destroyQueue) {
                // console.log(`Calling destroy on ${pair}`);
                if (this.field[pair[0]][pair[1]] !== null) {
                    if (this.superJemIds.includes(this.field[pair[0]][pair[1]].tid)) {
                        this.crossExplosion(pair[0], pair[1]);
                    }
                    this.field[pair[0]][pair[1]].destroyGem();
                    this.field[pair[0]][pair[1]] = null;
                    this.destroyed++;
                }
            }
        }
        this.destroyQueue = [];
        this.anyMatch = false;
    }

    compareTids(t1, t2) {
        if (this.superJemIds.includes(t1)) {
            return true;
        }
        return t1 === t2;

    }

    recursiveMatch(x, y) {
        // console.log(this.field[x][y]);
        this.field[x][y].is_checked = true;
        if (this.isWall(x, y)) {
            if (this.isWall(x, y)) {
                return;
            }
            return;
        }
        this.tmpQueue.push([x, y]);
        for (let i = 0; i < this.dx.length; i++) {
            const nx = x + this.dx[i];
            const ny = y + this.dy[i];
            if (nx < 0 || nx >= this.fieldWidth || ny < 0 || ny >= this.fieldHeight){
               continue;
            }
            // console.log(`Trying match {${x}; ${y}} with {${nx}; ${ny}} ${this.field[x][y].tid} === ${this.field[nx][ny].tid}`);
            if (!this.compareTids(this.field[x][y].tid, this.field[nx][ny].tid) || this.field[nx][ny].is_checked) {
                continue;
            }
            // console.log(`Match at {${nx}; ${ny}}`)
            this.recursiveMatch(nx, ny);
        }
    }

    checkLocalMatch() {
        // console.log("LOCAL MATCH CALLED");
        let anyMatch = false;
        for (let pair of this.checkForMatch) {
            this.recursiveMatch(pair[0], pair[1]);
            // console.log(`tmpQueue size ${this.tmpQueue.length}`);
            if (this.tmpQueue.length >= this.destroyThreshold) {
                this.destroyQueue = this.destroyQueue.concat(this.tmpQueue);
                // console.log(`DestroyQueue len ${this.destroyQueue.length}`);
                anyMatch = true;
            }
            this.tmpQueue = [];
        }
        this.checkForMatch = [];
        this.anyMatch = anyMatch;
        return anyMatch;
    }

    checkGlobalMatch() {
        // console.log("GLOBAL MATCH CALLED");
        let anyMatch = false;
        for (let i = 0; i < this.fieldWidth; i++) {
            for (let j = 0; j < this.fieldHeight; j++) {
                if (this.field[i][j].is_checked === false) {
                    this.recursiveMatch(i, j);
                }
                // console.log("---");
                if (this.tmpQueue.length >= this.destroyThreshold) {
                    this.destroyQueue = this.destroyQueue.concat(this.tmpQueue);
                    anyMatch = true;
                }
                this.tmpQueue = [];
            }
        }
        this.anyMatch = anyMatch;
        return anyMatch;
    }

}