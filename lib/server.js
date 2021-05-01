const http = require('http');
const {reqResHandlers} = require('../helpers/reqResHandlers');
const config = require('../config');

// Server object
const server = {};

// Create the server
server.createServer = () => {
    const server = http.createServer(server.handleReqRes);

    server.listen(config.port, () => {
        console.log(`App is on fire at ${config.port}`);
    })
}

// Handle request and response
server.handleReqRes = reqResHandlers;

// Start the server
server.init = () => {
    server.createServer();
}

// export
module.exports = server;