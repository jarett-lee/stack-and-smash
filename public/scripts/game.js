let fpsCounter = document.getElementById("fps");

let gameCanvas = document.getElementById("game-canvas");
let ctx = gameCanvas.getContext("2d");
let canvasWidth = 800;
let canvasHeight = 400;

let basicBlockImage = new Image(30, 30);
basicBlockImage.src = "/img/basic.png";
let cannonImage = new Image(30,30);
cannonImage.src = "/img/cannon.png";

ctx.clearRect(0, 0, canvasWidth, canvasHeight);
ctx.translate(canvasWidth / 2, canvasHeight / 2)
ctx.scale(1, -1);

b = {
    x: 0,
    y: 0,
    height: 30,
    width: 30,
    angle: 90
}
c = {
    x: 100,
    y: 100,
    height: 30,
    width: 30,
    angle: 0
}
let s = null;

clear();
let handler = window.requestAnimationFrame(draw);

socket.on('game-state', (state) => {
    s = state;
});
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
    local.platforms.forEach((platform) => {
        drawPlatform(platform);
    });
    // let fps = Math.round(1000 / (Date.now() - d));
    // fpsCounter.innerHTML = Math.round(1000/(Date.now() - d));
    // d = Date.now();
    // if(fps > 90 || fps < 30){
    //     console.warn("Inadequate performance", fps);
    // }
    window.requestAnimationFrame(draw);
}

function drawBasicBlock(block){
    ctx.save();
    ctx.translate(block.x, block.y);
    ctx.rotate(block.angle * Math.PI / 180);
    ctx.fillStyle = "#FFFFFF";
    ctx.drawImage(basicBlockImage, 0, 0, 30, 30, -block.width/2, -block.height/2, 30, 30);
    ctx.restore();
}

function drawCannon(cannon){
    ctx.save();
    ctx.translate(cannon.x, cannon.y);
    ctx.rotate(cannon.angle * Math.PI / 180);
    ctx.drawImage(cannonImage, -cannon.width / 2, -cannon.height / 2, 30, 30);
    ctx.restore();
}

function drawPlatform(platform){
    ctx.save();
    ctx.translate(platform.x, platform.y);
    ctx.rotate(platform.angle * Math.PI / 180);
    ctx.fillstyle = "#bfbfbf";
    ctx.fillRect(-platform.width/2, -platform.height/2, platform.width, platform.height);
    ctx.restore();
}

function clear(){
    ctx.fillStyle = "#7aadff";
    ctx.fillRect(-canvasWidth/2, -canvasHeight/2, canvasWidth, canvasHeight);
}
