const p2  = require('p2');

module.exports = class Engine {
    
    constructor(player1, player2) {
        this.player = {};
        
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
        this.boxes = [];

        // Init players
        this.initPlayer(player1, -5);
        this.initPlayer(player2, 5);
        */
    }
    
    createFakeWorld() {
        this.player[playerId] = {};
        
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
        
        this.player['p1'].platformBody = platformBody;
        
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
        
        this.player['p2'].platformBody = platformBody;
        
        // Create blocks
        this.player['p1'].blockBodies = [];
        
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
            this.player['p1'].blockBodies.push(blockBody);
            world.addBody(blockBody);
        }
        
        
        // Create blocks
        this.player['p2'].blockBodies = [];
        
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
            this.player['p2'].blockBodies.push(blockBody);
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
        this.player[playerId] = {};
        this.player[playerId].platformShape = platformShape;
        this.player[playerId].platformBody = platformBody;
    }
    
    step() {
        const hrTime = process.hrtime();
        let bullets = bulletBodies.map((bb) => bb);
        let blocks = []; 
        let platforms = [];


        // hrTime[0] * 1000 + hrTime[1] / 1000000
        return {};
    }
    
    addBlock(playerId, x, y) {
        // return true; // placed the block
        return false; // failed to place the block
    }

    getBlockBodies(){

    }

    getBulletBodies(){

    }

    getPlatformBodies(){

    }

}
