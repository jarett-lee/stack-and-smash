/**
 * For all the functions that change how things look on the screen
 */

function show (id) {
    document.getElementById(id).style.visibility = "initial";
    document.getElementById(shownScreen).style.visibility = "hidden";

    shownScreen = id;
}