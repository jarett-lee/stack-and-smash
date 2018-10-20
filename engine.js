const p2 = require('p2');
const BLOCK_SIZE = 15;
const BLOCK_MASS = 25;
module.exports = class Engine {
    
    constructor(player1, player2) {
        this.isRunning = true;

        this.timer = {
            start: Date.now(),
            duration: 30,
            running: true
        };

        this.players = {};
        this.playerOne = player1;
        this.players[player1] = {};
        this.players[player2] = {};
        
        this.cooldown = 200;
        this.players[player1].cooldownDoneTime = 0;
        this.players[player2].cooldownDoneTime = 0;
        
        // Create a World
        const world = new p2.World({
            gravity: [0, -1000]
        });

        this.world = world;

        // Set high friction so the wheels don't slip
        world.defaultContactMaterial.friction = 100;
        world.solver.iterations = 20;
        world.solver.tolerance = 0.001;
        world.setGlobalStiffness(1e6)

        // Physics properties
        this.maxSubSteps = 5; // Max physics ticks per render frame
        this.fixedDeltaTime = 1 / 60; // Physics "tick" delta time

        /*
        // Init players
        this.initPlayer(player1, -5);
        this.initPlayer(player2, 5);
        */

        // Create a platform
        let platformShape = new p2.Box({
            width: 100,
            height: 5
        });
        let platformBody = new p2.Body({
            position: [-150, -100],
            mass: 0
        });
        platformBody.addShape(platformShape);
        world.addBody(platformBody);
        
        this.players[player1].platformBody = platformBody;
        this.players[player1].blockBodies = [];
        platformBody.playerOne = true;

        // Create a platform
        platformShape = new p2.Box({
            width: 100,
            height: 5
        });
        platformBody = new p2.Body({
            position: [150, -100],
            mass: 0
        });
        platformBody.addShape(platformShape);
        world.addBody(platformBody);

        this.players[player2].platformBody = platformBody;
        this.players[player2].blockBodies = [];
        platformBody.playerOne = false;
        
        this.createFakeWorld();
    }

    createFakeWorld() {
        const world = this.world;

        // Create bullets
        this.bulletBodies = [];
        
        for (let i = 0; i < 5; i++) {
            let bulletShape = new p2.Circle({
                radius: 3
            });
            let bulletBody = new p2.Body({
                position: [-100, 10 + 20*i],
                velocity: [500, 100],
                mass: .3
            });
            bulletBody.addShape(bulletShape);
            this.bulletBodies.push(bulletBody);
            world.addBody(bulletBody);
        }

        // Create bullets
        for (let i = 0; i < 5; i++) {
            let bulletShape = new p2.Circle({
                radius: 3
            });
            let bulletBody = new p2.Body({
                position: [100, 20*i],
                velocity: [-500, 100],
                mass: .3
            });
            bulletBody.addShape(bulletShape);
            this.bulletBodies.push(bulletBody);
            world.addBody(bulletBody);
        }
    }

    endGame () {
        // Wait for blocks to settle and then calc the highest
        setTimeout(() => {
            this.isRunning = false;

            const playerOneHeight = this.calcHeight(Object.keys(this.players)[0]);
            const playerTwoHeight = this.calcHeight(Object.keys(this.players)[1]);

            if (playerOneHeight > playerTwoHeight) {
                // Player One wins
                this.winner = 'player1';
            } else {
                // Player Two wins
                this.winner = 'player2';
            }
        }, 5000);
    }

    initPlayer(playerId, x) {
        const world = this.world;

        // Add platform
        const platformShape = new p2.Box({
            width: 3,
            height: 1
        });
        const platformBody = new p2.Body({
            position: [x, 0],
            mass: 0
        });
        platformBody.addShape(platformShape);
        world.addBody(platformBody);

        // Write properties
        this.players[playerId] = {};
        this.players[playerId].platformShape = platformShape;
        this.players[playerId].platformBody = platformBody;
    }

    step() {
        this.timer.remainingTime = Math.floor(this.timer.duration - ((Date.now() - this.timer.start) / 1000));
        if (this.timer.remainingTime < 0) {
            this.timer.remainingTime = 0;

            if (this.timer.running) {
                this.timer.running = false;
                this.endGame();
            }
        }

        const hrTime = process.hrtime();
        const milli = hrTime[0] * 1000 + hrTime[1] / 1000000;
        this.updatePhysics(milli);

        let bullets = this.getBulletBodies().map((bb) => (
            {
                x: bb.position[0],
                y: bb.position[1],
                radius: bb.shapes[0].radius,
                angle: bb.angle
            }
        ));

        let blocks = this.getBlockBodies().map((bb) => (
            {
                x: bb.position[0],
                y: bb.position[1],
                width: bb.shapes[0].width,
                height: bb.shapes[0].height,
                angle: bb.angle,
                playerOne: bb.playerOne
            }
        ));

        let platforms = this.getPlatformBodies().map((pb) => (
            {
                x: pb.position[0],
                y: pb.position[1],
                width: pb.shapes[0].width,
                height: pb.shapes[0].height,
                angle: pb.angle,
                playerOne: pb.playerOne
            }
        ));
        
        return {
            bullets: bullets,
            blocks: blocks,
            platforms: platforms,
            remainingTime: this.timer.remainingTime,
            winner: this.winner
        };
    }

    updatePhysics(time) {
        const world = this.world;
        const lastTime = this.lastTime;
        const maxSubSteps = this.maxSubSteps;
        const fixedDeltaTime = this.fixedDeltaTime;
        
        /*
        const bulletBodies = this.bulletBodies;

        // allowShipCollision = true;
        // if(keyShoot && !hideShip && world.time - lastShootTime > shipReloadTime){
        //   shoot();
        // }

        for (let i = 0; i < bulletBodies.length; i++) {
            const b = bulletBodies[i];
            // If the bullet is old, delete it
            if (b.dieTime <= world.time) {
                bulletBodies.splice(i, 1);
                world.removeBody(b);
                i--;
                continue;
            }
        }

        // Remove bodies scheduled to be removed
        for (let i = 0; i < removeBodies.length; i++) {
            world.removeBody(removeBodies[i]);
        }
        removeBodies.length = 0;

        // Add bodies scheduled to be added
        for (let i = 0; i < addBodies.length; i++) {
            world.addBody(addBodies[i]);
        }
        addBodies.length = 0;
        */

        // Delete all out of bound bodies
        world.bodies.forEach((body) => {
            if(body.position[1] < -200){
                this.removeBody(body);
            }
        });

        // Get the elapsed time since last frame, in seconds
        let deltaTime = lastTime ? (time - lastTime) / 1000 : 0;

        // Make sure the time delta is not too big (can happen if user switches browser tab)
        deltaTime = Math.min(1 / 10, deltaTime);

        // Move physics bodies forward in time
        if (this.isRunning)
            world.step(fixedDeltaTime, deltaTime, maxSubSteps);

        this.lastTime = time;
    }

    removeBody(body){
        this.world.removeBody(body);
        Object.keys(this.players).forEach((playerKey) => {
            let player = this.players[playerKey];
            let index = -1;
            if((index = player.blockBodies.indexOf(body)) != -1){
                player.blockBodies.splice(index, 1);
                
            }
            index = -1;
            if((index = this.bulletBodies.indexOf(body)) != -1){
                this.bulletBodies.splice(index, 1);
            }
        });
    }

    addBlock(playerId, x, y, blockType) {
        if (this.timer.remainingTime === 0)
            return false;

        if (playerId === this.playerOne) {
            if (x >= 0) {
                return false;
            }
        }
        else {
            if (x <= 0) {
                return false;
            }
        }

        const hrTime = process.hrtime();
        const milli = hrTime[0] * 1000 + hrTime[1] / 1000000;
        if (this.players[playerId].cooldownDoneTime <= milli) {
            this.players[playerId].cooldownDoneTime = milli + this.cooldown;
        }
        else {
            return false;
        }

        let blockBody = {};
        if(blockType === "square-block"){
            blockBody = this.newSquareBlock(x, y);
        }else if(blockType === "long-block"){
            blockBody = this.newLongBlock(x, y);
        }else if(blockType === "l-block"){
            blockBody = this.newLBlock(x, y);
        }else if(blockType === "jank-block"){
            blockBody = this.newJankBlock(x, y);
        }else {
            blockBody = this.newSquareBlock(x, y);
        }
        
        this.players[playerId].blockBodies.push(blockBody);
        this.world.addBody(blockBody);
        return true; // failed to place the block
    }

    newBody(x, y, mass){
        return new p2.Body({
            position: [x, y],
            velocity: [0,0],
            mass: mass
        })
    }
    newSquareBlock(x, y){
        let blockBody = this.newBody(x, y, BLOCK_MASS * 4);
        let boxShape = new p2.Box({
            width: 30,
            height: 30
        });
        blockBody.addShape(boxShape);
        return blockBody;
    }
    newLongBlock(x, y){
        let blockBody = this.newBody(x, y, BLOCK_MASS * 4);
        let longShape = new p2.Box({
            width: 15,
            height: 60
        })
        blockBody.addShape(longShape);
        return blockBody;
    }

    newJankBlock(x, y){
        let blockBody = this.newBody(x, y, BLOCK_MASS * 4);

        blockBody.addShape(this.newBlockShape(), [BLOCK_SIZE/2, 0]);
        blockBody.addShape(this.newBlockShape(), [BLOCK_SIZE/2, BLOCK_SIZE]);
        blockBody.addShape(this.newBlockShape(), [-BLOCK_SIZE/2, 0]);
        blockBody.addShape(this.newBlockShape(), [-BLOCK_SIZE/2, -BLOCK_SIZE]);
        return blockBody;
    }

    newLBlock(x, y){
        let blockBody = new Body(x, y, BLOCK_MASS * 3);
        
        blockBody.addShape(this.newBlockShape());
        blockBody.addShape(this.newBlockShape(), [BLOCK_SIZE, 0]);
        blockBody.addShape(this.newBlockShape(), [0, BLOCK_SIZE]);
    }


    newBlockShape(){
        return new p2.Box({
            width: BLOCK_SIZE,
            height: BLOCK_SIZE
        });
    }
    getBlockBodies(){
        let blockBodies = [];
        for (let [ key, val ] of Object.entries(this.players)) {
            blockBodies = blockBodies.concat(val.blockBodies);
        }

        return blockBodies;
    }

    getBulletBodies(){
        return this.bulletBodies;
    }

    getPlatformBodies(){
        const platformBodies = [];
        for (let [ key, val ] of Object.entries(this.players)) {
            platformBodies.push(val.platformBody);
        }

        return platformBodies;
    }

    calcHeight (playerId) {
        const blocks = this.players[playerId].blockBodies;

        if (blocks.length === 0)
            return 0;

        let height = blocks[0].position[1];

        for (let i = 0; i < blocks.length; i++) {
            if (blocks[i].position[1] > height)
                height = blocks[i].position[1];
        }

        return height + 400;
    }
}
