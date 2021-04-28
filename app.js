const http = require('http');
const {reqResHandlers} = require('./helpers/reqResHandlers')
const config = require('./config');

// App Object -> Module Scaffolding
const app = {};

// Create the server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);

    server.listen(config.port, () => {
        console.log(`App is on fire at ${config.port}`);
    })
}

// Handle request and response
app.handleReqRes = reqResHandlers;

// Run the server
app.createServer();