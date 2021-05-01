const server = require('./lib/server');

// Model scaffolding
const app = {};

app.init = () => {
    // Start the server
    server.init();
}

// Module Export
module.exports = app;