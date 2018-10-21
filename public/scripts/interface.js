/**
 * For all the functions that change how things look on the screen
 */

function show (id) {
    document.getElementById(id).style.visibility = "initial";
    document.getElementById(shownScreen).style.visibility = "hidden";

    shownScreen = id;
}

var doubleTouchStartTimestamp = 0;
document.addEventListener("touchstart", function(event){
    var now = +(new Date());
    if (doubleTouchStartTimestamp + 500 > now){
        event.preventDefault();
    };
    doubleTouchStartTimestamp = now;
});