let fpsCounter = document.getElementById("fps");
let remainingTimeDisplay = document.getElementById("remainingTime");
let errorDisplay = document.getElementById("error");

let gameCanvas = document.getElementById("game-canvas");
let ctx = gameCanvas.getContext("2d");
let canvasWidth = 800;
let canvasHeight = 400;

let isRunning = true;
let isPlaying = true;

const spriteSheet = {
    player1: {
        lBlock: new Image(30, 30),
        longBlock: new Image(15, 60),
        basicBlock: new Image(30, 30),
        horizLongBlock: new Image(60, 15)
    },
    player2: {
        lBlock: new Image(30, 30),
        longBlock: new Image(15, 60),
        basicBlock: new Image(30, 30),
        horizLongBlock: new Image(60, 15)
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
spriteSheet.player1.horizLongBlock.src = "/img/player1/horizontalLong.png"

spriteSheet.player2.lBlock.src = "/img/player2/lBlock.png";
spriteSheet.player2.longBlock.src = "/img/player2/long.png";
spriteSheet.player2.basicBlock.src = "/img/player2/basic.png";
spriteSheet.player2.horizLongBlock.src = "/img/player2/horizontalLong.png"

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

    if (isPlaying && s.remainingTime === 0) {
        timeUp();
        isPlaying = false;
    }

    if (!isPlaying)
        document.getElementById("timer").style.visibility = "hidden";
    else
        document.getElementById("timer").style.visibility = "initial";

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

    let time = s.remainingTime.toString();
    let decimal = time.split('.');
    if (!decimal[1])
        time += ".00";
    else if (decimal[1].length === 1)
        time += "0";

    remainingTimeDisplay.innerText = time;

    errorDisplay.innerText = s.errorMessage;

    document.getElementById("player1-score").innerText = "" + Math.round((local.playerOneHeight + 70) * 10) / 10;
    document.getElementById("player2-score").innerText = "" + Math.round((local.playerTwoHeight + 70) * 10) / 10;

    const playerSprite = spriteSheet[player];
    if (s[player].leftBlock.type !== "cannon"){
        document.getElementById("left-image").src = playerSprite[s[player].leftBlock.type].src;
        document.getElementById("left-image").setAttribute('style', 'transform:rotate(' + s[player].leftBlock.angle + 'deg)');
        document.getElementById("left-image").style.opacity = (200 - s.cooldownLeft)/200;
    }else{
        document.getElementById("left-image").src = spriteSheet.cannon.src;
       
    }
    
    if (s[player].rightBlock.type !== "cannon"){
        document.getElementById("right-image").src = playerSprite[s[player].rightBlock.type].src;
        document.getElementById("right-image").setAttribute('style', 'transform:rotate(' + s[player].rightBlock.angle + 'deg)');
        document.getElementById("right-image").style.opacity = (200 - s.cooldownLeft)/ 200;
    }else
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
        case "horizLongBlock":
            ctx.drawImage(sprite, 0, 0, 60, 15, -block.width/2, -block.height/2,  60, 15);
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
    ctx.fillStyle = "#000000";
    ctx.strokeRect(-platform.width / 2, -platform.height / 2, platform.width, platform.height);
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
        selection: "left",
        rotation: s[player].leftBlock.type === "lBlock" ? s[player].leftBlock.angle + 270 : s[player].leftBlock.angle
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
        selection: "right",
        rotation: s[player].rightBlock.type === "lBlock" ? s[player].rightBlock.angle + 270 : s[player].rightBlock.angle
    }, (success) => {
    });

    return false;
}, false);

function timeUp () {
    const timeUp = document.getElementById("time-up");

    timeUp.style.visibility = "initial";
    timeUp.className += "animated zoomIn";

    let addDot = (num) => {
        let string = '';
        for (let i = 0; i < num; i++) {
            string += '.';
        }

        document.getElementById('dots').innerText = string;

        if (num < 5) {
            setTimeout(() => {addDot(num + 1)}, 1000);
        }
    };

    addDot(1);
}

function endGame () {
    document.getElementById("time-up").className = "";
    document.getElementById("time-up").className = "animated zoomOut";

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

    document.getElementById("height").innerText = "" + Math.round((height + 70) * 10) / 10;

    results.style.visibility = "initial";
    results.className += " animated bounceInDown";
}