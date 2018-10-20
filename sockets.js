
   
module.exports = (server) => {
    const io = require('socket.io')(server);
    let tokengen = require('rand-token');
    let tokens = [];
    io.on('connection', (socket) => {

        socket.on('create-game', () => {
            let tok = "";
            while(!((tok = tokengen.generate(4)) in tokens));//Generate that doesn't already exist
            tokens.push(tok);
            return tok;
        })
        console.log("connection!");
    });
}