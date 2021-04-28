const http = require('http');
const {reqResHandlers} = require('./helpers/reqResHandlers')

// App Object -> Module Scaffolding
const app = {};

// Application Config
app.config = {
    port: 3000
};

// Create the server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);

    server.listen(app.config.port, () => {
        console.log(`App is on fire at ${app.config.port}`);
    })
}

// Handle request and response
app.handleReqRes = reqResHandlers;

// Run the server
app.createServer();