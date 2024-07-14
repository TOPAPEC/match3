
let PIXI = require("./node_modules/pixi.js/lib/index.mjs");
const {valsWithSubstring} = require("./shared");
let FieldElement = require("./FieldElement.js").FieldElement;
let Position = require("./Position.js").Position;
let Gem = require("./FieldElement.js").Gem;
let SuperGem = require("./FieldElement.js").SuperGem;
let FieldWall = require("./FieldElement.js").FieldWall;
let GameOverLay = require("./GameOverLay.js").GameOverLay;
let Destructible2hpFieldWall = require("./FieldElement.js").Destructible2hpFieldWall;
let DestructibleFieldWall = require("./FieldElement.js").DestructibleFieldWall;

export class FieldManagerV2 extends PIXI.Container {
    field = [];
    wallPaperName;
    gems = [];
    walls = [];
    superGems = {};
    winConditions = [];
    winConditionIdx;
    fieldLayouts = []
    fieldLayoutIdx;
    managerState;
    chapterNumber;
    isSwappingGems = false;
    destroyQueue = [];
    wallDamageQueue = [];
    checkQueue = [];
    tmpQueue = [];
    currentScore = 0;
    dx = [0, 1, -1, 0];
    dy = [1, 0, 0, -1];
    states = Object.freeze({
        Moving: Symbol("Moving"),
        CheckMatchAndDestroy: Symbol("CheckMatchAndDestroy"),
        Monitoring: Symbol("Monitoring"),
        BackSwap: Symbol("BackSwap"),
        Refill: Symbol("Refill"),
        LoadingLevel: Symbol("LoadingLevel"),
    })
    powerUps = Object.freeze({
        DestroyRow: Symbol("DestroyRow"),
        DestroyColumn: Symbol("DestroyColumn"),
        Bomb: Symbol("Bomb"),
    })
    constructor(screenWidth, screenHeight, tileSize, spritesheet, playerData) {
        super();
        this.spritesheet = spritesheet;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.playerData = playerData;
        this.tileSize = tileSize;
        this.fieldRectangle = PIXI.Sprite.from(PIXI.Texture.WHITE);
        this.fieldRectangle.width = this.screenWidth;
        this.fieldRectangle.height = this.tsize * this.fieldHeight * 1.1;
        this.fieldRectangle.tint = 0x3d1a10;
        this.fieldRectangle.y = -0.05 * this.fieldHeight;
        this.fieldRectangle.alpha = 0.5;

        this.chapterNumber = 1;

        this.firstTouchPosition = null;
        this.secondTouchPosition = null;
        this.onpointerdown = (e) => {
            console.log("onpointerdown");
            this.firstTouchPosition = this.toLocal(e.global.clone());
        }
        this.onpointerup = (e) => {
            console.log("onpointerup");
            this.secondTouchPosition = this.toLocal(e.global.clone());
        }
        this.overlay = new GameOverLay(this.screenWidth, this.screenHeight, this.playerData, this.spritesheet);
        this.fieldElementNames = [FieldWall.name, FieldElement.name, Gem.name, SuperGem.name, Destructible2hpFieldWall.name, DestructibleFieldWall.name];
        this.wallNames = [Destructible2hpFieldWall.name, DestructibleFieldWall.name, FieldWall.name];
    }

    start() {
        this.visible = true;
        this.eventMode = "none";
        this.managerState = this.states.LoadingLevel;
    }

    end() {
        this.visible = false;
        this.eventMode = "none";
    }

    async _LevelConfigurationGenerator() {
        const layoutConfig = await (await fetch("levels/level1_1.json")).json();
        return {layout: layoutConfig.schema, gemNumber: 6};
    }

    _isValidPlacement(row, col, gem) {
        const numRows = this.field.length;
        const numCols = this.field[0].length;
        const field = this.field;
        const compare = (e, tid) => {
            if (e instanceof Gem) {
                return e.gemNumber === gem;
            }
            return false;
        }
        // Check horizontally
        if (col > 1 && compare(field[row][col - 1], gem) && compare(field[row][col - 2], gem)) return false;
        if (col < numCols - 2 && compare(field[row][col + 1], gem) && compare(field[row][col + 2], gem)) return false;
        if (col > 0 && col < numCols - 1 && compare(field[row][col - 1], gem) && compare(field[row][col + 1], gem)) return false;

        // Check vertically
        if (row > 1 && compare(field[row - 1][col], gem) && compare(field[row - 2][col], gem)) return false;
        if (row < numRows - 2 && compare(field[row + 1][col], gem) && compare(field[row + 2][col], gem)) return false;
        if (row > 0 && row < numRows - 1 && compare(field[row - 1][col], gem) && compare(field[row + 1][col], gem)) return false;
        return true;
    }


    _generateGemID(i, j) {
        let tid = 1;
        do {
            tid = Math.floor(Math.random() * (this.gems.length - 1)) + 1;  // Generate a random gem (1 to 8)
        } while (!this._isValidPlacement(i, j, tid));
        return tid;
    }

    _toFieldPosition(x, y) {
        const i = Math.floor(x / this.tileSize);
        const j = Math.floor(y / this.tileSize);
        return new Position(i, j);
    }

    _getGemTexture(typeStr, gemNumber) {
        return this.gems[gemNumber];
    }

    // Только обычные гемы, супер и стены по другой логике
    generateGem(x, y) {
        const fieldPosition = this._toFieldPosition(x, y);
        const gemID = this._generateGemID(fieldPosition.x, fieldPosition.y);
        return new Gem(x, y, this.spritesheet, gemID, this._getGemTexture(Gem.name, gemID), this.tileSize);
    }

    _getWallTexture(wallId) {
        if (wallId === 0) {
            const rectangle = PIXI.Texture.WHITE.clone();
            rectangle.tint = 0x757161;
            rectangle.alpha = 0.3;
            return rectangle;
        } else if (wallId === 1) {
            const rectangle = PIXI.Texture.WHITE.clone();
            rectangle.tint = 0x00000;
            rectangle.alpha = 0.3;
            return rectangle;
        }
    }

    generateWall(x, y) {
        const wallId = 0;
        return new Destructible2hpFieldWall(x, y, this.spritesheet, this._getWallTexture(wallId), this._getWallTexture(wallId + 1), this.tileSize);
    }

    async loadLevel(chapter) {
        const config = await this._LevelConfigurationGenerator();
        this.x = (this.screenWidth - this.tileSize * config.layout.length) / 2;
        this.y = (this.screenHeight - this.tileSize * config.layout[0].length) / 2;
        this.chapterNumber = chapter;
        this.background = new PIXI.Sprite(this.spritesheet.textures[`backgroundChapter${this.chapterNumber}.jpg`]);
        this.addChild(this.background);
        this.overlay.init();
        this.overlay.eventMode = 'none';
        this.background.x = -this.background.getGlobalPosition().x;
        this.background.y = -this.background.getGlobalPosition().y;
        this.background.width = this.screenWidth;
        this.background.height = this.screenHeight;
        if (this.chapterNumber === 1) {
            this.gems = valsWithSubstring(this.spritesheet.textures, `gemChapter${this.chapterNumber}_`).slice(0, config.gemNumber);
            this.superGems = valsWithSubstring(this.spritesheet.textures, `superGemChapter${this.chapterNumber}_`)
            this.walls = valsWithSubstring(this.spritesheet.textures, `wallChapter${this.chapterNumber}_`)
        }
        this.gemContainer = new PIXI.Container();
        this.addChild(this.gemContainer);
        for (let i = 0; i < config.layout.length; i++) {
            this.field.push([]);
            for (let j = 0; j < config.layout[0].length; j++) {
                const elementX = i * this.tileSize;
                const elementY = j * this.tileSize;
                if (config.layout[i][j] === -1) {
                    this.field[i].push(this.generateWall(elementX, elementY))
                } else {
                    this.field[i].push(this.generateGem(elementX, elementY));
                }
                // console.log(this.field[i][j]);
                this.gemContainer.addChild(this.field[i][j]);
            }
        }

        this.addChild(this.overlay);
        // console.log(this.x, this.y, this.field[0][0].x, this.field[0][0].y);
        this.managerState = this.states.Moving;
    }


    elementComparator(e1, e2) {
        return FieldElement.Compare(e1, e2);
    }

    _determineDirection(x, y, threshold=5) {
        const length = Math.sqrt(x * x + y * y);
        // console.log(x, y, length);
        if (length <= threshold) {
            return new Position(0, 0);
        }
        if (x === 0 && y === 0) {
            return new Position(0, 0);
        }
        if (Math.abs(x) > Math.abs(y)) {
            if (x > 0) {
                return new Position(1, 0);
            } else {
                return new Position(-1, 0);
            }
        } else {
            if (y > 0) {
                return new Position(0, 1);
            } else {
                return new Position(0, -1);
            }
        }
    }

    _swapGems(pos1, pos2) {
        if (this.wallNames.includes(this.field[pos1.x][pos1.y].constructor.name)|| this.wallNames.includes(this.field[pos2.x][pos2.y].constructor.name)) {
            return;
        }
        this.field[pos1.x][pos1.y].moveTo(
            new Position(
                pos2.x * this.tileSize,
                pos2.y * this.tileSize));
        this.field[pos2.x][pos2.y].moveTo(
            new Position(
                pos1.x * this.tileSize,
                pos1.y * this.tileSize));
        const first = this.field[pos1.x][pos1.y];
        this.field[pos1.x][pos1.y] = this.field[pos2.x][pos2.y];
        this.field[pos2.x][pos2.y] = first;
    }

    _checkMatch(x, y) {
        this.field[x][y].checked = true;
        if (this.wallNames.includes(this.field[x][y].constructor.name)) {
            this.wallDamageQueue.push([x, y]);
            return;
        }
        this.tmpQueue.push([x, y]);
        for (let i = 0; i < this.dx.length; i++) {
            const nx = x + this.dx[i];
            const ny = y + this.dy[i];
            if (nx < 0 || nx >= this.field.length || ny < 0 || ny >= this.field[0].length){
                continue;
            }
            // console.log(`Trying match {${x}; ${y}} with {${nx}; ${ny}} ${this.field[x][y].gemNumber} === ${this.field[nx][ny].gemNumber}`);
            if (!this.elementComparator(this.field[x][y], this.field[nx][ny]) || this.field[nx][ny].checked) {
                continue;
            }
            // console.log(`Match at {${nx}; ${ny}}`)
            this._checkMatch(nx, ny);
        }
    }

    process(delta) {
        console.log(this.managerState);
        this.overlay.process(delta);
        if (this.managerState === this.states.Moving) {
            let childMoved = false;
            // if (this.isSwappingGems) {
            //
            // }
            for (let child of this.gemContainer.children) {
                if (this.fieldElementNames.includes(child.constructor.name)) {
                    child.process(delta);
                    if (child.wasUpdatedThisTick) {
                        childMoved = true;
                    }
                }
            }
            if (!childMoved) {
                this.managerState = this.states.CheckMatchAndDestroy;
            }
        } else if (this.managerState === this.states.Monitoring) {
            if (this.currentScore > 0) {
                console.log("CHANGING SCORE", this.currentScore, this.playerData.getCurrentScore());
                this.playerData.updateCurrentScore(this.playerData.getCurrentScore() + this.currentScore);
                this.currentScore = 0;
            }
            this.eventMode = "static";
            if (this.firstTouchPosition !== null && this.secondTouchPosition !== null) {
                // console.log("Swapping", this.firstTouchPosition, this.secondTouchPosition);
                const dx = this.secondTouchPosition.x - this.firstTouchPosition.x;
                const dy = this.secondTouchPosition.y - this.firstTouchPosition.y;
                const swipeDir = this._determineDirection(dx, dy);
                const nx = this.firstTouchPosition.x + this.tileSize * swipeDir.x
                const ny = this.firstTouchPosition.y + this.tileSize * swipeDir.y
                this.swipeFirstPosition = this._toFieldPosition(this.firstTouchPosition.x, this.firstTouchPosition.y);
                this.swipeSecondPosition = this._toFieldPosition(nx, ny);
                if ((swipeDir.x !== 0 || swipeDir.y !== 0) && this.swipeSecondPosition.x >= 0 &&
                    this.swipeSecondPosition.x < this.field.length && this.swipeSecondPosition.y >= 0 &&
                    this.swipeSecondPosition.y < this.field[0].length) {
                    console.log("Swipedir", swipeDir);
                    this._swapGems(this.swipeFirstPosition, this.swipeSecondPosition);
                    this.checkQueue.push([this.swipeFirstPosition.x, this.swipeFirstPosition.y]);
                    this.checkQueue.push([this.swipeSecondPosition.x, this.swipeSecondPosition.y]);
                    this.isSwappingGems = true;
                    this.managerState = this.states.Moving;
                    this.eventMode = "none";
                }
            }
        } else if (this.managerState === this.states.BackSwap) {
            this._swapGems(this.swipeFirstPosition, this.swipeSecondPosition);
            this.swipeFirstPosition = null;
            this.swipeSecondPosition = null;
            this.isSwappingGems = false;
            this.firstTouchPosition = null;
            this.secondTouchPosition = null;
            this.managerState = this.states.Moving;
        } else if (this.managerState === this.states.CheckMatchAndDestroy) {
            let destroyedAny = false;
            for (let pos of this.checkQueue) {
                this._checkMatch(pos[0], pos[1]);
                // console.log("Tmpqueue", this.tmpQueue.length);
                if (this.tmpQueue.length >= 3) {
                    this.destroyQueue = this.destroyQueue.concat(this.tmpQueue);
                    this.destroyQueue = this.destroyQueue.concat(this.wallDamageQueue);
                }
                this.tmpQueue = [];
                this.wallDamageQueue = [];
            }
            for (let pos of this.destroyQueue) {
                // console.log("Destroying", pos[0], pos[1]);
                this.field[pos[0]][pos[1]].destroyElement();
                if (this.field[pos[0]][pos[1]].isDead()) {
                    this.currentScore += this.field[pos[0]][pos[1]].getReward();
                    this.field[pos[0]][pos[1]] = null;
                    destroyedAny = true;
                }
            }
            if (this.isSwappingGems && !destroyedAny) {
                this.managerState = this.states.BackSwap;
            } else if (destroyedAny) {
                this.isSwappingGems = false;
                this.firstTouchPosition = null;
                this.secondTouchPosition = null;
                this.managerState = this.states.Refill;
            } else {
                this.managerState = this.states.Monitoring;
            }
            this.checkQueue = [];
            this.tmpQueue = [];
            this.wallDamageQueue = [];
            this.destroyQueue = []
            for (let child of this.gemContainer.children) {
                if (this.fieldElementNames.includes(child.constructor.name)) {
                    child.checked = false;
                }
            }
        } else if (this.managerState === this.states.Refill) {
            for (let i = 0; i < this.field.length; i++) {
                let j = this.field[0].length - 1;
                while (j >= 0) {
                    if (this.field[i][j] === null) {
                        let filled = false;
                        for (let k = j - 1; k >= 0; k--) {
                            if (this.field[i][k] !== null && !(this.wallNames.includes(this.field[i][k].constructor.name))) {
                                this.field[i][k].moveTo(new Position(i * this.tileSize, j * this.tileSize));
                                this.field[i][j] = this.field[i][k];
                                this.field[i][k] = null;
                                this.checkQueue.push([i, j]);
                                filled = true;
                                break;
                            }
                        }
                        if (!filled) {
                            // console.log("Creating new gem");
                            const gemX = i * this.tileSize;
                            const gemY = -4 * this.tileSize;
                            const new_gem = this.generateGem(gemX, gemY);
                            this.gemContainer.addChild(new_gem);
                            new_gem.moveTo(new Position(i * this.tileSize, j * this.tileSize));
                            this.field[i][j] = new_gem;
                            this.checkQueue.push([i, j]);
                        }
                    }
                    j--;
                }
            }
            this.managerState = this.states.Moving;
        } else if (this.managerState === this.states.LoadingLevel) {}
    }
}