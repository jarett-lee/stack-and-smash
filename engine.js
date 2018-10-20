const p2 = require('p2');

module.exports = class Engine {

    constructor(player1, player2) {
        this.players = {};
        
        createFakeWorld();
        
        /*
        // Create a World
        const world = new p2.World({
            gravity: [0, -10]
        });

        // Set high friction so the wheels don't slip
        world.defaultContactMaterial.friction = 100;
        
        // Write properties
        this.world = world;
        this.bullets = [];

        // Physics properties
        this.maxSubSteps = 5; // Max physics ticks per render frame
        this.fixedDeltaTime = 1 / 30; // Physics "tick" delta time

        // Init players
        this.initPlayer(player1, -5);
        this.initPlayer(player2, 5);
        */
    }

    createFakeWorld() {
        this.players[playerId] = {};
        
        // Create a World
        const world = new p2.World({
            gravity: [0, -10]
        });

        this.world = world;

        // Set high friction so the wheels don't slip
        world.defaultContactMaterial.friction = 100;

        // Create a platform
        platformShape = new p2.Box({
            width: 5,
            height: 1
        });
        platformBody = new p2.Body({
            position: [-5, -1],
            mass: 0
        });
        platformBody.addShape(platformShape);
        world.addBody(platformBody);
        
        this.players['p1'].platformBody = platformBody;

        // Create a platform
        platformShape = new p2.Box({
            width: 5,
            height: 1
        });
        platformBody = new p2.Body({
            position: [5, -1],
            mass: 0
        });
        platformBody.addShape(platformShape);
        world.addBody(platformBody);

        this.players['p2'].platformBody = platformBody;

        // Create blocks
        this.players['p1'].blockBodies = [];
        
        for (let i = 0; i < 5; i++) {
            blockShape = new p2.Box({
                width: .5,
                height: .5
            });
            blockBody = new p2.Body({
                position: [-5, 5 + i],
                mass: .5
            });
            blockBody.addShape(blockShape);
            this.players['p1'].blockBodies.push(blockBody);
            world.addBody(blockBody);
        }

        // Create blocks
        this.players['p2'].blockBodies = [];
        
        for (let i = 0; i < 5; i++) {
            blockShape = new p2.Box({
                width: .5,
                height: .5
            });
            blockBody = new p2.Body({
                position: [5, 5 + i],
                mass: .5
            });
            blockBody.addShape(blockShape);
            this.players['p2'].blockBodies.push(blockBody);
            world.addBody(blockBody);
        }
    
        this.blockBodies.push(platformBody);
        
        // Create bullets
        this.bulletBodies = [];
        
        for (let i = 0; i < 5; i++) {
            bulletShape = new p2.Circle({
                radius: .05
            });
            bulletBody = new p2.Body({
                position: [-4, 1 + i],
                velocity: [5, 9],
                mass: .3
            });
            bulletBody.addShape(bulletShape);
            this.bulletBodies.push(bulletBody);
            world.addBody(bulletBody);
        }

        // Create bullets
        for (let i = 0; i < 5; i++) {
            bulletShape = new p2.Circle({
                radius: .05
            });
            bulletBody = new p2.Body({
                position: [4, 1.5 + i],
                velocity: [-5, 9],
                mass: .3
            });
            bulletBody.addShape(bulletShape);
            this.bulletBodies.push(bulletBody);
            world.addBody(bulletBody);
        }
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
        let bullets = getBulletBodies().map((bb) => (
            {
                x: bb.position[0],
                y: bb.position[1],
                radius: bb.shapes[0].radius,
                angle: bb.angle
            }
        ));

        let blocks = getBlockBodies().map((bb) => (
            {
                x: bb.position[0],
                y: bb.position[1],
                width: bb.shapes[0].width,
                height: bb.shapes[0].height,
                angle: bb.angle
            }
        ));

        let platforms = getBlockBodies().map((pb) => (
            {
                x: pb.position[0],
                y: pb.position[1],
                width: pb.shapes[0].width,
                height: pb.shapes[0].height,
                angle: pb.angle
            }
        ));
        
        const hrTime = process.hrtime();
        const milli = hrTime[0] * 1000 + hrTime[1] / 1000000;
        this.updatePhysics(milli);
        return {
            bullets: bullets,
            blocks: blocks,
            platforms: platforms
        };
    }

    updatePhysics(time) {
        const lastTime = this.lastTime;
        const maxSubSteps = this.maxSubSteps;
        const fixedDeltaTime = this.fixedDeltaTime;
        
        /*
        const world = this.world;
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

        // Delete all out of bound bodies
        // for (var i=0; i < world.bodies.length; i++){
        //   deleteIfOutOfBounds(world.bodies[i]);
        // }
        */

        // Get the elapsed time since last frame, in seconds
        let deltaTime = lastTime ? (time - lastTime) / 1000 : 0;
        // Make sure the time delta is not too big (can happen if user switches browser tab)
        deltaTime = Math.min(1 / 10, deltaTime);
        // Move physics bodies forward in time
        world.step(fixedDeltaTime, deltaTime, maxSubSteps);
        
        this.lastTime = time;
    }

    addBlock(playerId, x, y) {
        // this.addBodies.push(block)
        // return true; // placed the block
        return false; // failed to place the block
    }

    getBlockBodies(){
        let blockBodies = [];
        for (let playerValue of Object.entries(this.players)) {
            blockBodies = blockBodies.concat(playerValue.blockBodies);
        }

        return blockBodies;
    }

    getBulletBodies(){
        return this.bulletBodies;
    }

    getPlatformBodies(){
        const platformBodies = [];
        for (let playerValue of Object.entries(this.players)) {
            platformBodies.push(playerValue.platformBody);
        }

        return platformBodies;
    }

}
