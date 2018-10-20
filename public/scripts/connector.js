/**
 * For API calls to the backend
 */

/**
 * Chuck the user in a game and get the game token
 */
function createGame () {
    // Request to make a game from the server
    socket.emit('create-game', function (token) {
        // Receive game token from server upon successful request
        document.getElementById("game-token").innerHTML = token;
        gameToken = token;
        show('game-id');
    });
}

/**
 *
 */
function cancelGame () {
    socket.emit('cancel-game', gameToken, function () {
        show('main-menu');
    });
}

/**
 * Request to join a game with the token in the token field
 */
function joinGame () {
    const token = document.getElementById("game-token-input").value;

    // Send the game token to the server
    socket.emit('join-game', token, function (success) {
        gameToken = token;

        // If successfully joined game from game token
        if (success) {
            show("game");
        } else {
            // Alert that the token was not right
            alert("The token entered is invalid!");
        }
    });
}

/**
 * On game state update received from server, update the game UI to reflect object positions
 */
socket.on('game-state', function () {
    if (shownScreen !== "game") {
        show("game");
    }

    // Redraw Game UI

});