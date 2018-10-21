const p2 = require('p2');
const BLOCK_SIZE = 15;
const BLOCK_MASS = 25;
module.exports = class Engine {
    
    constructor(player1, player2) {
        this.isRunning = true;

        this.timer = {
            start: Date.now(),
            duration: 30.0,
            running: true
        };

        this.players = {};
        this.playerOne = player1;
        this.players[player1] = {};
        this.players[player2] = {};

        this.errorMessage = "";

        this.cooldown = 200;
        this.players[player1].cooldownDoneTime = 0;
        this.players[player2].cooldownDoneTime = 0;
        
        this.players[player1].rightBlock = this.getRandBlockType();
        this.players[player1].leftBlock = this.getRandBlockType();
        this.players[player2].rightBlock = this.getRandBlockType();
        this.players[player2].leftBlock = this.getRandBlockType();

        // Create a World
        const world = new p2.World({
            gravity: [0, -1000]
        });

        this.world = world;
        this.cannonBodies = [];

        // Set high friction so the wheels don't slip
        world.defaultContactMaterial.friction = 100;
        world.solver.iterations = 20;
        world.solver.tolerance = 0.001;
        world.setGlobalStiffness(1e6);

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
            width: 200,
            height: 120
        });
        let platformBody = new p2.Body({
            position: [-250, -180],
            friction: 1,
            mass: 0
        });
        platformBody.addShape(platformShape);
        world.addBody(platformBody);
        
        this.players[player1].platformBody = platformBody;
        this.players[player1].blockBodies = [];
        this.players[player1].cannonBodies = [];
        platformBody.playerOne = true;

        // Create a platform
        platformShape = new p2.Box({
            width: 200,
            height: 120
        });
        platformBody = new p2.Body({
            position: [250, -180],
            friction: 1,
            mass: 0
        });
        platformBody.addShape(platformShape);
        world.addBody(platformBody);

        this.players[player2].platformBody = platformBody;
        this.players[player2].blockBodies = [];
        this.players[player2].cannonBodies = [];
        platformBody.playerOne = false;
        
        this.hasContactEver = {};
        const that = this;
        
        // Catch impacts in the world
        world.on("beginContact",function(evt){
            let bodyA = evt.bodyA;
            let bodyB = evt.bodyB;
            
            that.hasContactEver[bodyA.id] = true;
            that.hasContactEver[bodyB.id] = true;
            
            if (bodyA.animateType === "fire" && bodyB.blockType) {
                const temp = bodyB;
                bodyB = bodyA;
                bodyA = temp;
            }
            if (bodyB.animateType === "fire" && bodyA.blockType) {
                console.log('fire');
                bodyA.mass = Math.max(bodyA.mass * 0.1, 0);
                bodyA.friction = Math.max(bodyA.friction * 0.1, 0);
                that.removeAnimate(bodyB);
            }
        });
        
        this.createFakeWorld();
    }

    createFakeWorld() {
        const world = this.world;
        
        this.animateBodies = [];

        // Create bullets
        this.bulletBodies = [];
        
        /*
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
        
        let fireShape = new p2.Circle({
            radius: 5
        });
        let fireBody = new p2.Body({
            position: [0, 50],
            velocity: [250, 150],
            friction: .9,
            mass: 1
        });
        fireBody.addShape(fireShape);
        world.addBody(fireBody);
        fireBody.animateType = "fire";
        
        this.animateBodies.push(fireBody);
        */
    }

    endGame () {
        // Stop the cannons from firing
        for (let cannonBody of this.cannonBodies) {
            clearInterval(cannonBody.shootLoop);
        }
        
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

    step(playerId) {
        this.timer.remainingTime = Math.round((this.timer.duration - ((Date.now() - this.timer.start) / 1000)) * 100) / 100;
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
        this.players[playerId].cooldownLeft = Math.max(this.players[playerId].cooldownDoneTime - milli, 0);
        const cooldownLeft = this.players[playerId].cooldownLeft;

        let bullets = this.getBulletBodies().map((bb) => (
            {
                x: bb.position[0],
                y: bb.position[1],
                radius: bb.shapes[0].radius,
                angle: bb.angle,
                id: bb.id
            }
        ));
        
        let animates = this.getAnimateBodies().map((b) => (
            {
                x: b.position[0],
                y: b.position[1],
                radius: b.shapes[0].radius,
                angle: b.angle,
                animateType: b.animateType,
                id: b.id
            }
        ));

        let blocks = this.getBlockBodies().map((bb) => (
            {
                x: bb.position[0],
                y: bb.position[1],
                width: bb.shapes[0].width,
                height: bb.shapes[0].height,
                angle: bb.angle,
                playerOne: bb.playerOne,
                blockType: bb.blockType,
                id: bb.id
            }
        ));

        let platforms = this.getPlatformBodies().map((pb) => (
            {
                x: pb.position[0],
                y: pb.position[1],
                width: pb.shapes[0].width,
                height: pb.shapes[0].height,
                angle: pb.angle,
                playerOne: pb.playerOne,
                id: pb.id
            }
        ));

        let right = this.players[Object.keys(this.players)[0]].rightBlock;
        let left = this.players[Object.keys(this.players)[0]].leftBlock;

        const player1 = {
            leftBlock: left,
            rightBlock: right
        };

        right = this.players[Object.keys(this.players)[1]].rightBlock;
        left = this.players[Object.keys(this.players)[1]].leftBlock;

        const player2 = {
            leftBlock: left,
            rightBlock: right
        };

        const playerOneHeight = this.calcHeight(Object.keys(this.players)[0]);
        const playerTwoHeight = this.calcHeight(Object.keys(this.players)[1]);
        return {
            animates: animates,
            bullets: bullets,
            blocks: blocks,
            platforms: platforms,
            errorMessage: this.errorMessage,
            remainingTime: this.timer.remainingTime,
            winner: this.winner,
            player1: player1,
            player2: player2,
            playerOneHeight: playerOneHeight,
            playerTwoHeight: playerTwoHeight,
            cooldownLeft: cooldownLeft
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
        if (body.blockType && body.blockType === "cannon") {
            const cannonBody = body;
            clearInterval(cannonBody.shootLoop);
        }
    }

    removeAnimate(body){
        this.world.removeBody(body);
        this.animateBodies = this.animateBodies.filter( el => el.id !== body.id );
    }

    addBlock(playerId, x, y, selection, rotation) {
        if(rotation >= 360){
            rotation -= 360;
        }
        if (this.timer.remainingTime === 0) {
            this.errorMessage = "Game is over";
            return false;
        }

        if (playerId === this.playerOne) {
            if (x >= 0) {
                this.errorMessage = "Place on the other side of the screen";
                return false;
            }
        }
        else {
            if (x <= 0) {
                this.errorMessage = "Place on the other side of the screen";
                return false;
            }
        }

        if (y < this.calcHeight(playerId)) {
            this.errorMessage = "Place your block higher up";
            return false;
        }

        const hrTime = process.hrtime();
        const milli = hrTime[0] * 1000 + hrTime[1] / 1000000;
        if (this.players[playerId].cooldownDoneTime <= milli) {
            this.players[playerId].cooldownDoneTime = milli + this.cooldown;
        }
        else {
            this.errorMessage = "Placing is on cooldown";
            return false;
        }

        let blockType;
        if (selection === "left") {
            blockType = this.players[playerId].leftBlock.type;
            this.players[playerId].leftBlock = this.getRandBlockType();
        } else {
            blockType = this.players[playerId].rightBlock.type;
            this.players[playerId].rightBlock = this.getRandBlockType();
        }

        let blockBody = {};
        if(blockType === "basicBlock"){
            blockBody = this.newSquareBlock(x, y);
        }else if(blockType === "longBlock"){
            blockBody = this.newLongBlock(x, y);
        }else if(blockType === "lBlock"){
            blockBody = this.newLBlock(x, y);
        }else if(blockType === "jankBlock"){
            blockBody = this.newJankBlock(x, y);
        }else if(blockType ==="cannon"){
            blockBody = this.newCannonBlock(playerId, x, y);
        }else {
            blockBody = this.newSquareBlock(x, y);
        }

        
        this.players[playerId].blockBodies.push(blockBody);
        this.world.addBody(blockBody);
        blockBody.playerOne = this.playerOne === playerId;
        blockBody.blockType = blockType;
        
        blockBody.angle = rotation * (Math.PI / 180);
        this.errorMessage = "";
        
        if(selection === "right"){
            this.players[playerId].rightBlock = this.getRandBlockType();
        }else {
            this.players[playerId].leftBlock = this.getRandBlockType();
        }
        return true;
    }

    getRandBlockType(){
        let blockTypes = ["lBlock", "basicBlock", "longBlock"];
        let num = Math.random();

        if(num < .25){
            return {type: "cannon"};
        }
        else{
            let type = blockTypes[Math.floor(Math.random() * blockTypes.length)];
            let angle = Math.floor(Math.random() * 4) * 180;
            return {type: type, angle: angle};
        }
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

        blockBody.width = 30;
        blockBody.height = 30;
        blockBody.addShape(boxShape);
        return blockBody;
    }
    newLongBlock(x, y){
        let blockBody = this.newBody(x, y, BLOCK_MASS * 4);
        let longShape = new p2.Box({
            width: 15,
            height: 60
        });
        blockBody.width = 15;
        blockBody.height = 60;
        blockBody.addShape(longShape);
        return blockBody;
    }

    newCannonBlock(playerId, x, y) {
        if (this.timer.remainingTime === 0)
            return false;

        let cannonShape = new p2.Box({
            width: 30,
            height: 30
        });
        let cannonBody = new p2.Body({
            position: [x, y],
            velocity: [0, 0],
            mass: 150
        });
        cannonBody.addShape(cannonShape);
        cannonBody.playerOne = playerId === this.playerOne;
        let intId = setInterval((cannon, rightFacing) => {
            const radius = 21;
            let theta = cannon.angle + Math.PI/4;
            let x = cannon.position[0];
            let y = cannon.position[1];
            let xOrigin, yOrigin;
            if(!rightFacing){
                theta = theta - Math.PI/2;
                xOrigin = x - Math.cos(theta) * radius;
                yOrigin = y - Math.sin(theta)*radius;
            } else {
                xOrigin = x + Math.cos(theta) * radius;
                yOrigin = y + Math.sin(theta) * radius;
            }
            this.addBullet(rightFacing, xOrigin, yOrigin, theta);
        }, 1000, cannonBody, cannonBody.playerOne);
        cannonBody.height = 30;
        cannonBody.width = 30;
        cannonBody.shootLoop = intId;
        this.cannonBodies.push(cannonBody);
        return cannonBody;
    }

    addBullet(rightFacing, x, y, theta){
        let bulletShape = new p2.Circle({
            radius: 3
        });
        let v;
        if(rightFacing){
            v = [800 * Math.cos(theta), 800 * Math.sin(theta)]
        } else {
            v = [800 * -Math.cos(theta), 800 * -Math.sin(theta)]
        }
        let bulletBody = new p2.Body({
            position: [x,y],
            velocity: v,
            mass: 40
        });
        bulletBody.addShape(bulletShape);
        this.bulletBodies.push(bulletBody);
        this.world.addBody(bulletBody);
    }

    newJankBlock(x, y){
        let blockBody = this.newBody(x, y, BLOCK_MASS * 4);
        blockBody.height = 45;
        blockBody.width = 30;
        blockBody.addShape(this.newBlockShape(), [BLOCK_SIZE/2, 0]);
        blockBody.addShape(this.newBlockShape(), [BLOCK_SIZE/2, BLOCK_SIZE]);
        blockBody.addShape(this.newBlockShape(), [-BLOCK_SIZE/2, 0]);
        blockBody.addShape(this.newBlockShape(), [-BLOCK_SIZE/2, -BLOCK_SIZE]);
        return blockBody;
    }

    newLBlock(x, y){
        let blockBody = this.newBody(x, y, BLOCK_MASS * 3);
        blockBody.width = 15;
        blockBody.height = 15;
        blockBody.addShape(this.newBlockShape());
        blockBody.addShape(this.newBlockShape(), [BLOCK_SIZE, 0]);
        blockBody.addShape(this.newBlockShape(), [0, BLOCK_SIZE]);
        return blockBody;
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
    
    getAnimateBodies(){
        return this.animateBodies;
    }

    getCannonBodies() {
        let cannonBodies = [];
        for (let [key, val] of Object.entries(this.players)) {
            cannonBodies = cannonBodies.concat(val.cannonBodies);
        }

        return cannonBodies;
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
        const minHeight = -70;

        if (blocks.length === 0)
            return minHeight;

        let maxHeight = blocks[0].position[1] + blocks[0].boundingRadius;

        for (let i = 1; i < blocks.length; i++) {
            if (!this.hasContactEver[blocks[i].id]) {
                continue;
            }
            const height = blocks[i].position[1] + blocks[i].boundingRadius;
            if (height > maxHeight) {
                maxHeight = height;
            }
        }
        
        maxHeight = maxHeight; // Prevent collision

        return Math.max(Math.min(maxHeight, 400), minHeight);
    }
}
