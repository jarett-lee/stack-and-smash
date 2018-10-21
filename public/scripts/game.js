let fpsCounter = document.getElementById("fps");
let remainingTimeDisplay = document.getElementById("remainingTime");
let errorDisplay = document.getElementById("error");

let gameCanvas = document.getElementById("game-canvas");
let ctx = gameCanvas.getContext("2d");
let canvasWidth = 800;
let canvasHeight = 400;

let isRunning = true;

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
    bullet: new Image(6, 6),
    fire: new Image()
};
spriteSheet.cannon.src = "/img/cannon.png";
spriteSheet.bullet.src = "/img/bullet.png";
spriteSheet.fire.src = "/img/ARW-2D-Flame Sprite-Sheet-by-Chromaeleon.png";

spriteSheet.player1.lBlock.src = "/img/player1/lBlock.png";
spriteSheet.player1.longBlock.src = "/img/player1/long.png";
spriteSheet.player1.basicBlock.src = "/img/player1/basic.png";

spriteSheet.player2.lBlock.src = "/img/player2/lBlock.png";
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

    if (isRunning && s.winner) {
        endGame();
        isRunning = false;
    }

    clear();
    let local = s;
    local.blocks.forEach((block) => {
        if(block.blockType == "cannon"){
            drawCannon(block);
        }else {
            drawBasicBlock(block);
        }
    });
    local.platforms.forEach((platform) => {
        drawPlatform(platform);
    });
    local.bullets.forEach((bullet) => {
        drawBullet(bullet);
    });

    drawHeight(local);
    local.animates.forEach((animate) => {
        drawAnimate(animate);
    });

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

const allAnimates = [];
function drawAnimate(animate){
    if (!allAnimates[animate.id]) {
        allAnimates[animate.id] = createAnimate(animate);
    }
    const myAnimate = allAnimates[animate.id];
    myAnimate.update();
    if (animate.animateType === 'fire') {
        myAnimate.render(animate.x, animate.y + 5);
    }
    else {
        myAnimate.render(animate.x, animate.y);
    }
}

function createAnimate(animate) {
    return sprite({
        context: ctx,
        numberOfFrames: 7,
        loop: true,
        ticksPerFrame: 10,
        width: 24,
        height: 24,
        image: spriteSheet[animate.animateType]
    });
}

function clear(){
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-canvasWidth/2, -canvasHeight/2, canvasWidth, canvasHeight);
}

function drawHeight(state) {
    ctx.save();

    ctx.strokeStyle="#0000FF";
    ctx.beginPath();
    ctx.moveTo(-100, state.playerOneHeight);
    ctx.lineTo(-500, state.playerOneHeight);
    ctx.stroke();

    ctx.strokeStyle="#0000FF";
    ctx.beginPath();
    ctx.moveTo(100, state.playerTwoHeight);
    ctx.lineTo(500, state.playerTwoHeight);
    ctx.stroke();

    ctx.restore();
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

function endGame () {
    const results = document.getElementById("results");

    if (s.winner !== player) {
        results.style.background = "rgba(252, 86, 83, .85)";
        document.getElementById("results-message").innerText = "You Lose...";
    }

    let height;
    if (player === "player1")
        height = s.playerOneHeight;
    else
        height = s.playerTwoHeight;

    document.getElementById("height").innerText = "" + Math.floor(height);

    results.style.visibility = "initial";
    results.className += " animated bounceInDown";
}