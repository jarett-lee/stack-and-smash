function show (id) {
    document.getElementById(id).style.visibility = "initial";
    document.getElementById(shownScreen).style.visibility = "hidden";

    shownScreen = id;
}