module.exports = (server) => {
    const io = require('socket.io')(server);
    let tokengen = require('rand-token');
    require('./engine');
    let tokens = {};
    let worlds = {};
    io.on('connection', (socket) => {
        socket.on('create-game', () => {
            let tok = "";
            while(((tok = tokengen.generate(4)) in tokens));//Generate token that doesn't already exist
            tokens[tok] = {"playerOne" : socket.id};
            socket.emit("token", tok);
            socket.join(tok);
        })

        socket.on('join-game', (token) => {
            if(token in tokens){
                //Join Room
                socket.join(token);
                tokens[tok].playerTwo = socket.id;
                
                //create World
                let playerOne = tokens[token].playerOne;
                let playerTwo = socket.id;
                worlds[token] = new Engine(playerOne, playerTwo);

                //Start game cycle
                setInterval(() => {
                    worlds[token].step();//step game
                    //export game data
                }, 100/6);

                //alert client
                socket.emit('alert', 'game starting');
            } else {
                socket.emit('alert', 'invalid token');
            }
        })

        socket.on('create-block', (data) => {
            if(!data.token || !(data.token in tokens)){
                socket.emit('alert', 'invalid token');
                return;
            }

            let x = data.x;
            let y = data.y;
            if(!worlds[token].addBlock(socket.id, x, y)){
                socket.emit('alert', 'invalid block placement');
            }
        })

        

        
        console.log("connection!");
    });
}