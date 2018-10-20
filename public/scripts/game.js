let fpsCounter = document.getElementById("fps");

let gameCanvas = document.getElementById("game-canvas");
let ctx = gameCanvas.getContext("2d");
let canvasWidth = 800;
let canvasHeight = 400;

let basicBlockImage = new Image(30,30);
basicBlockImage.src = "/img/basic.png";
let cannonImage = new Image(30,30);
cannonImage.src = "/img/cannon.png";
let bulletImage = new Image(6, 6);
bulletImage.src = "/img/bullet.png";

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
    ctx.drawImage(basicBlockImage, 0, 0, 30, 30, -block.width/2, -block.height/2, 30, 30);
    ctx.restore();
}

function drawCannon(cannon){
    ctx.save();
    ctx.translate(cannon.x, cannon.y);
    ctx.rotate(cannon.angle);
    if (!cannon.playerOne){
        ctx.scale(-1, 1);
    }
    ctx.drawImage(cannonImage, 0, 0, 30, 30, -cannon.width / 2, -cannon.height / 2, 30, 30);
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
    ctx.drawImage(bulletImage, 0, 0, 6, 6, -bullet.radius, -bullet.radius, 6, 6);
    ctx.restore();
}

function clear(){
    ctx.fillStyle = "#7aadff";
    ctx.fillRect(-canvasWidth/2, -canvasHeight/2, canvasWidth, canvasHeight);
}

gameCanvas.addEventListener('click', (event) => {
    const rect = gameCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left - 400;
    const y = (event.clientY - rect.top - 200) * -1;

    socket.emit('create-block', {
        token: gameToken,
        x: x,
        y: y
    }, (success) => {
        console.log(success);
    })
});