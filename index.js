const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const  server = require('http').createServer(app);
const port = process.env.port || 3000;
var io = require('socket.io')(http);
const p2  = require('p2');
var tokengen = require('rand-token');

let world = new p2.World( 
    {gravity: [0, -9.82]}
);
let worlds = {};

require('./sockets.js')(server, { origins: '*:*' });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

app.get('/*.*', (req, res) => {
    res.sendFile(`${req.params[0]}.${req.params[1]}`, { root: 'public' });
})

server.listen(port, () => {
    console.log("Listening on port", port);
});
