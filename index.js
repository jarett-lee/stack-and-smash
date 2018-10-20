const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const  server = require('http').createServer(app);
const port = process.env.port || 3000;
var tokengen = require('rand-token');

require('./sockets.js')(server, { origins: '*:*' });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile("/", {root: 'public'});
});

app.get('/*.*', (req, res) => {
    res.sendFile(`${req.params[0]}.${req.params[1]}`, { root: 'public' });
})

server.listen(port, () => {
    console.log("Listening on port", port);
});