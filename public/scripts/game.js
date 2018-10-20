let fpsCounter = document.getElementById("fps");
let remainingTimeDisplay = document.getElementById("remainingTime");
let errorDisplay = document.getElementById("error");

let gameCanvas = document.getElementById("game-canvas");
let ctx = gameCanvas.getContext("2d");
let canvasWidth = 800;
let canvasHeight = 400;

const spriteSheet = {
    player1: {
        lBlock: new Image(30, 30),
        longBlock: new Image(15, 60),
        basicBlock: new Image(30, 30)
    },
    player2: {
        lBlock: new Image(30, 30),
        longBlock: new Image(15, 60),
        basicBlock: new Image(30, 30),
    },
    cannon: new Image(30,30),
    bullet: new Image(6, 6)
};
spriteSheet.cannon.src = "/img/cannon.png";
spriteSheet.bullet.src = "/img/bullet.png";

spriteSheet.player1.lBlock.src = "/img/player1/lBLock.png";
spriteSheet.player1.longBlock.src = "/img/player1/long.png";
spriteSheet.player1.basicBlock.src = "/img/player1/basic.png";

spriteSheet.player2.lBlock.src = "/img/player2/lBLock.png";
spriteSheet.player2.longBlock.src = "/img/player2/long.png";
spriteSheet.player2.basicBlock.src = "/img/player2/basic.png";

ctx.clearRect(0, 0, canvasWidth, canvasHeight);
ctx.translate(canvasWidth / 2, canvasHeight / 2)
ctx.scale(1, -1);

clear();
let handler = window.requestAnimationFrame(draw);

let d = Date.now();
function draw(){
    if(!s){
        window.requestAnimationFrame(draw);
        return;
    }
    clear();
    let local = s;
    local.blocks.forEach((block) => {
        drawBasicBlock(block);
    });
    local.cannons.forEach((cannon) => {
        drawCannon(cannon);
    })
    local.platforms.forEach((platform) => {
        drawPlatform(platform);
    });
    local.bullets.forEach((bullet) => {
        drawBullet(bullet);
    });

    drawMenu();
    
    remainingTimeDisplay.innerText = s.remainingTime;

    errorDisplay.innerText = s.errorMessage;

    const playerSprite = spriteSheet[player];
    if (s[player].leftBlock.type !== "cannon")
        document.getElementById("left-image").src = playerSprite[s[player].leftBlock.type].src;
    else
        document.getElementById("left-image").src = spriteSheet.cannon.src;

    if (s[player].rightBlock.type !== "cannon")
        document.getElementById("right-image").src = playerSprite[s[player].rightBlock.type].src;
    else
        document.getElementById("right-image").src = spriteSheet.cannon.src;

    // let fps = Math.round(1000 / (Date.now() - d));
    // fpsCounter.innerHTML = Math.round(1000/(Date.now() - d)) + " " + s.time;
    // d = Date.now();
    // if(fps > 90 || fps < 30){
    //     console.warn("Inadequate performance", fps);
    // }
    window.requestAnimationFrame(draw);
}

function drawMenu () {

}

function drawBasicBlock(block){
    ctx.save();
    ctx.translate(block.x, block.y);
    ctx.rotate(block.angle);
    ctx.fillStyle = "#FFFFFF";

    let sprite;
    if (block.playerOne)
        sprite = spriteSheet.player1[block.blockType];
    else
        sprite = spriteSheet.player2[block.blockType];

    switch (block.blockType) {
        case "lBlock":
            ctx.drawImage(sprite, 0, 0, 30, 30, -block.width / 2, -block.height / 2, 30, 30);
            break;
        case "basicBlock":
            ctx.drawImage(sprite, 0, 0, 30, 30, -block.width/2, -block.height/2, 30, 30);
            break;
        case "longBlock":
            ctx.drawImage(sprite, 0, 0, 15, 60, -block.width/2, -block.height/2, 15, 60);
            break;
    }

    ctx.restore();
}

function drawCannon(cannon){
    ctx.save();
    ctx.translate(cannon.x, cannon.y);
    ctx.rotate(cannon.angle);
    if (!cannon.playerOne){
        ctx.scale(-1, 1);
    }
    ctx.drawImage(spriteSheet.cannon, 0, 0, 30, 30, -cannon.width / 2, -cannon.height / 2, 30, 30);
    ctx.restore();
}

function drawPlatform(platform){
    ctx.save();
    ctx.translate(platform.x, platform.y);
    ctx.rotate(platform.angle * Math.PI / 180);
    ctx.fillStyle = "#bfbfbf";
    ctx.fillRect(-platform.width/2, -platform.height/2, platform.width, platform.height);
    ctx.restore();
}

function drawBullet(bullet){
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    ctx.fillStyle="#FF0000";
    ctx.drawImage(spriteSheet.bullet, 0, 0, 6, 6, -bullet.radius, -bullet.radius, 6, 6);
    ctx.restore();
}

function clear(){
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-canvasWidth/2, -canvasHeight/2, canvasWidth, canvasHeight);
}

gameCanvas.addEventListener('click', (event) => {
    const rect = gameCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left - 400;
    const y = (event.clientY - rect.top - 200) * -1;

    socket.emit('create-block', {
        token: gameToken,
        x: x,
        y: y,
        selection: "left"
    }, (success) => {
    });
});

gameCanvas.addEventListener('contextmenu', function(ev) {
    ev.preventDefault();
    const rect = gameCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left - 400;
    const y = (event.clientY - rect.top - 200) * -1;

    socket.emit('create-block', {
        token: gameToken,
        x: x,
        y: y,
        selection: "right"
    }, (success) => {
    });

    return false;
}, false);