const socket = io(window.location.href);
let gameToken;
let shownScreen = "main-menu";
// let shownScreen = "game";

document.getElementById(shownScreen).style.visibility = "initial";