const p2 = require('p2');

module.exports = class Engine {

    constructor(player1, player2) {
        this.player = {};

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

    step(time) {
        const hrTime = process.hrtime();
        let bullets = bulletBodies.map((bb) => (
            {
                x: bb.position[0],
                y: bb.position[2],
                radius: bb.shapes[0].radius,
                angle: bb.angle
            }
        ));

        let blocks = blockBodies.map((bb) => (
            {
                x: bb.position[0],
                y: bb.position[2],
                width: bb.shapes[0].width,
                height: bb.shapes[0].height,
                angle: bb.angle
            }
        ));

        let platforms = blockBodies.map((pb) => (
            {
                x: pb.position[0],
                y: pb.position[2],
                width: pb.shapes[0].width,
                height: pb.shapes[0].height,
                angle: pb.angle
            }
        ));
        
        // hrTime[0] * 1000 + hrTime[1] / 1000000

        this.world.step(time);
        return {
            bullets: bullets,
            blocks: blocks,
            platforms: platforms
        };
    }

    addBlock(playerId, x, y) {
        // return true; // placed the block
        return false; // failed to place the block
    }

    getBlockBodies() {

    }

    getBulletBodies() {

    }

    getPlatformBodies() {

    }

}
