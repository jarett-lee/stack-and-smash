/**
 * For API calls to the backend
 */

const socket = io('http://localhost:3000');

function createGame () {
    // Request to make a game from the server
    socket.emit('create-game', function (token) {
        // Receive game token from server upon successful request
        document.getElementById("game-token").innerHTML = token;

        show('game-id');
    });
}

function joinGame () {
    const gameToken = document.getElementById("game-token-input").value;

    // Send the game token to the server or something

    // If successfully joined game from game token
    if (success) {
        show("game");
    } else {
        // Alert that the token was not right
    }
}