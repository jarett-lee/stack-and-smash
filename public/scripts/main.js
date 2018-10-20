const socket = io('http://localhost:3000');
let shownScreen = "main-menu";

window.onload = function () {
    document.getElementById(shownScreen).style.visibility = "initial";
    console.log("asdf");
};