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
clear();

function drawBasicBlock(block){
    ctx.save();
    ctx.translate(block.x, block.y);
    ctx.rotate(block.angle * Math.PI / 180);
    ctx.drawImage(basicBlockImage, -block.width/2, -block.height/2, 30, 30);
    ctx.restore();
}

function drawCannon(cannon){
    ctx.save();
    ctx.translate(cannon.x, cannon.y);
    ctx.rotate(cannon.angle * Math.PI / 180);
    ctx.drawImage(cannonImage, -cannon.width / 2, -cannon.height / 2, 30, 30);
    ctx.restore();
}

function clear(){
    ctx.fillStyle = "#7aadff";
    ctx.fillRect(-canvasWidth/2, -canvasHeight/2, canvasWidth, canvasHeight);
}
