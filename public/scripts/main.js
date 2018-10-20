const socket = io('http://localhost:3000');
let gameToken;
let shownScreen = "main-menu";
// let shownScreen = "game";

document.getElementById(shownScreen).style.visibility = "initial";