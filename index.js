const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const port = process.env.port || 3000;
var io = require('socket.io')(http);
const p2  = require('p2');
var tokengen = require('rand-token');

let world = new p2.World( 
    {gravity: [0, -9.82]}
);
let worlds = {};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World!'))

io.on('connection', (socket) => {
    
    socket.on('new-game', () => {
        let tok = "";
        while(!((tok = tokengen.generate(3)) in worlds));//Generate that doesn't already exist
        worlds[tok] = new p2.World();
    })
});

function runWorld(){
    
    world.step(1/60);
    
}

app.listen(port, () => {
    console.log('Listening on port', port);
})