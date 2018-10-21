const socket = io(window.location.href);
let gameToken;
let player;
let shownScreen = "main-menu";
//let shownScreen = "game";

document.getElementById(shownScreen).style.visibility = "initial";