export class Gem extends PIXI.Container {
    dy;
    sy;
    distY;
    isMoving = false;
    moveTime;

    constructor(texture, tid, x, y, poofSpritesheet) {
        super();
        this.sprite = new PIXI.Sprite(texture);
        this.addChild(this.sprite);
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
        this.animation = new PIXI.AnimatedSprite(Object.values(poofSpritesheet.textures));
        this.animation.visible = false;
        this.animation.animationSpeed = 0.3;
        this.animation.loop = false;
        this.impact_animation = false;
        this.addChild(this.animation);
    }

    setupAnimation() {
        this.animation.x = this.width / 2;
        this.animation.y = this.height * 0.9;
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
        this.destroy()
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

    constructor(spritesheet, x, y, fieldWidth, fieldHeight, gemTypes) {
        super()
        this.spritesheet = spritesheet;
        this.fieldWidth = fieldWidth;
        this.fieldHeight = fieldHeight;
        this.x = x;
        this.y = y;
        this.tsize = this.spritesheet.textures[`tile1`].width;
        this.field = new Array(fieldHeight).fill(0).map(() => new Array(fieldWidth).fill(0));;
        this.gemTypes = gemTypes;
    }

    castXYToGem(x, y) {
        const i = Math.floor(x / this.tsize);
        const j = Math.floor(y / this.tsize);
        return this.field[i][j];
    }

    swapGems(gem1, gem2) {
        const i1 = Math.floor(gem1.x / this.tsize);
        const j1 = Math.floor(gem1.y / this.tsize);
        const i2 = Math.floor(gem2.x / this.tsize);
        const j2 = Math.floor(gem2.y / this.tsize);
        // console.log(`Swapping {${i1}; ${j1}} of {${i2}; ${j2}}`);
        // console.log(`Fieldxy {${this.x};${this.y}}`)
        // console.log(`Field ${this.width} ${this.height}`)
        if (!(Math.abs(i1 - i2) + Math.abs(j1 - j2) === 1 && Math.abs(i1 - i2) * Math.abs(j1 - j2) === 0)) {
            return false;
        }
        console.log("Swap is possible");
        this.checkForMatch.push([i1, j1], [i2, j2]);
        this.field[i1][j1] = gem2;
        this.field[i2][j2] = gem1;
        return true;
    }

    onPointerDownFunc(evt) {
        const local = this.toLocal(evt.data.global);
        this.gemDown = this.castXYToGem(local.x, local.y);
    }

    onPointerUpFunc(evt) {
        if (this.gemDown) {
            // console.log("Swapping");
            const local = this.toLocal(evt.data.global);
            this.interactiveChildren = false;
            this.interactive = false;
            this.gemUp = this.castXYToGem(local.x, local.y);
            if(!this.swapGems(this.gemDown, this.gemUp)) {
                this.gemDown = null;
                this.gemUp = null;
                return;
            }
            const gx = this.gemUp.x;
            const gy = this.gemUp.y;
            const gdx = this.gemDown.x;
            const gdy = this.gemDown.y;
            this.gemUp.moveTo(this.gemDown.x, this.gemDown.y, 4);
            this.gemDown.moveTo(gx, gy, 4);
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
        if (Math.random() < 0.01) {
            return 13;
        }
        do {
            tid = Math.floor(Math.random() * this.gemTypes) + 1;  // Generate a random gem (1 to 8)
        } while (!this.isValidPlacement(i, j, tid));
        return tid;
    }

    async init() {
        const poofSpritesheet = await this.loadSpritesheed();
        await poofSpritesheet.parse();
        this.poofSpritesheet = poofSpritesheet;
        const textureExample = this.spritesheet.textures["tile1"];
        this.textureHeight = textureExample.height;
        this.textureWidth = textureExample.width;
        for (let i = 0; i < this.fieldWidth; i++) {
            for (let j = 0; j < this.fieldHeight; j++) {
                const gemX = i * this.textureWidth;
                const gemY = j * this.textureHeight;
                let tid = this.generateTid(i, j);
                // do {
                //     tid = Math.floor(Math.random() * this.gemTypes) + 1;  // Generate a random gem (1 to 8)
                // } while (!this.isValidPlacement(i, j, tid));
                let gem = new Gem(this.spritesheet.textures[`tile${tid}`], tid, gemX, gemY, poofSpritesheet);
                this.field[i][j] = gem;
                this.addChild(gem);
            }
        }
        this.eventMode = 'static';
        this.on("pointerdown", this.onPointerDownFunc);
        this.on("pointerup", this.onPointerUpFunc);
    }

    async loadSpritesheed() {
        let config = await (await fetch('./tilesets/poof.json')).json()
        return new PIXI.Spritesheet(await PIXI.Assets.load(config["meta"]["image"]), config);
    }

    moveGemToCell(gem, i, j) {
        console.log(`MOVE GEM called on ${[i,j]}`)
        const x = i * this.tsize;
        const y = j * this.tsize;
        const ci = Math.floor(gem.x / this.tsize);
        const cj = Math.floor(gem.y / this.tsize);
        if (ci >= 0 && ci < this.fieldWidth && cj >= 0 && cj < this.fieldHeight ) {
            this.field[ci][cj] = null;
        }
        this.field[i][j] = gem;
        gem.moveTo(x, y, 2, true);
    }


    partialRefill() {
        // console.log("Refil start");
        for (let i = 0; i < this.fieldWidth; i++) {
            let j = this.fieldHeight - 1;
            while (j >= 0) {
                if (this.field[i][j] === null) {
                    let filled = false;
                    for (let k = j - 1; k >= 0; k--) {
                        if (this.field[i][k] !== null) {
                            this.moveGemToCell(this.field[i][k], i, j);
                            filled = true;
                            break;
                        }
                    }
                    if (!filled) {
                        console.log("Creating new gem");
                        const tid = this.generateTid(i, j);
                        const gemX = i * this.tsize;
                        const gemY = -10 * this.tsize;
                        const new_gem = new Gem(this.spritesheet.textures[`tile${tid}`], tid, gemX, gemY, this.poofSpritesheet);
                        this.addChild(new_gem);
                        this.moveGemToCell(new_gem, i, j);
                        if (tid !== 13) {
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
            console.log("Movement stopped");
            if (this.gemUp !== null) {
                // console.log("No one moved finishing swap")
                this.finishSwap();
            }
            if (this.destroyQueue.length > 0) {
                this.emptyDestroyQueue(this.anyMatch);
            }
            for (const child of this.children) {
                child.is_checked = false;
            }
            this.interactiveChildren = true;
            this.interactive = true;
        }
        if (this.children.length < this.fieldWidth * this.fieldHeight) {
            this.partialRefill();
        }
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
        console.log(`Cross explosion for ${cnt} elements`);
    }

    emptyDestroyQueue(destroy=false) {
        // console.log(`Called destroy queue ${destroy}`);
        if (destroy) {
            for (const pair of this.destroyQueue) {
                console.log(`Calling destroy on ${pair}`);
                if (this.field[pair[0]][pair[1]] !== null) {
                    if (this.field[pair[0]][pair[1]].tid === 13) {
                        this.crossExplosion(pair[0], pair[1]);
                    }
                    this.field[pair[0]][pair[1]].destroyGem();
                    this.field[pair[0]][pair[1]] = null;
                }
            }
        }
        this.destroyQueue = [];
        this.anyMatch = false;
    }

    compareTids(t1, t2) {
        if (t1 === 13) {
            return true;
        }
        return t1 === t2;

    }

    recursiveMatch(x, y) {
        // console.log(this.field[x][y]);
        this.tmpQueue.push([x, y]);
        this.field[x][y].is_checked = true;
        for (let i = 0; i < this.dx.length; i++) {
            const nx = x + this.dx[i];
            const ny = y + this.dy[i];
            if (nx < 0 || nx >= this.fieldWidth || ny < 0 || ny >= this.fieldHeight){
               continue;
            }
            console.log(`Trying match {${x}; ${y}} with {${nx}; ${ny}} ${this.field[x][y].tid} === ${this.field[nx][ny].tid}`);
            if (!this.compareTids(this.field[x][y].tid, this.field[nx][ny].tid) || this.field[nx][ny].is_checked) {
                continue;
            }
            console.log(`Match at {${nx}; ${ny}}`)
            this.recursiveMatch(nx, ny);
        }
    }

    checkLocalMatch() {
        console.log("LOCAL MATCH CALLED");
        let anyMatch = false;
        for (let pair of this.checkForMatch) {
            this.recursiveMatch(pair[0], pair[1]);
            console.log(`tmpQueue size ${this.tmpQueue.length}`);
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
        console.log("GLOBAL MATCH CALLED");
        let anyMatch = false;
        for (let i = 0; i < this.fieldWidth; i++) {
            for (let j = 0; j < this.fieldHeight; j++) {
                if (this.field[i][j].is_checked === false) {
                    this.recursiveMatch(i, j);
                }
                console.log("---");
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