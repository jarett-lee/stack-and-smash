
module.exports = (server) => {
    const io = require('socket.io')(server);
    
    io.on('connection', (socket) => {

        socket.on('create-game', () => {
            
            
        })
        console.log("connection!");
    });
}