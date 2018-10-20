const p2  = require('p2');
let tokengen = require('rand-token');

let worlds = {};

function initWorld(){

    let tok = "";
    while(!((tok = tokengen.generate(4)) in worlds));//Generate that doesn't already exist
    worlds[tok] = new p2.World();
    
    return tok;
}