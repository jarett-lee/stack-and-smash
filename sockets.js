module.exports = (server) => {
    const io = require('socket.io')(server);
    let tokengen = require('rand-token');
    require('./engine');
    let tokens = [];
    let worlds = {};
    io.on('connection', (socket) => {
        socket.on('create-game', () => {
            let tok = "";
            while(!((tok = tokengen.generate(4)) in tokens));//Generate that doesn't already exist
            tokens.push({tok: socket.id});
            return tok;
        })

        socket.on('join-game', (token) => {
            if(token in tokens){
                socket.join(token);
                worlds[token] = new Engine();
            }
        })
        console.log("connection!");
    });
}