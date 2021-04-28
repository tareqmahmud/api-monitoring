const {StringDecoder} = require('string_decoder');
const routes = require('../routes');
const notFoundController = require('../controllers/notFoundController');

const handlers = {};

handlers.reqResHandlers = (req, res) => {
    // Get the url path and parse it to object
    const baseUrl = `http://${req.headers.host}/`;
    const parseUrl = new URL(req.url, baseUrl);

    // Clean route path
    const pathName = parseUrl.pathname;
    const trimmedPath = pathName.replace(/^\/+|\/+$/g, '')

    // Route method
    const method = req.method.toLowerCase();

    // Query string
    const queryParams = parseUrl.searchParams;

    // Request headers
    const headersObject = req.headers;

    // Get the body text
    const decoder = new StringDecoder('utf-8');
    let bodyData = '';

    // Get the stream data on data event
    req.on('data', (stream) => {
        bodyData += decoder.write(stream)
    })

    // Stop fetching data after stream end
    req.on('end', () => {
        bodyData += decoder.end();

        // Call the specific routes
        const callRoutesHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundController;

        // Generate req parse data
        const reqObject = {
            parseUrl,
            trimmedPath,
            method,
            queryParams,
            headersObject,
            bodyData
        };

        // Call the routes handler -> controller
        callRoutesHandler(reqObject, (statusCode, payload) => {
            const generateStatusCode = typeof (statusCode) === 'number' ? statusCode : 500;
            const generatePayload = typeof (payload) === 'object' ? payload : {};
            const payloadString = JSON.stringify(generatePayload);

            // Return response status code as header
            res.writeHead(generateStatusCode);

            // Return the payload
            res.end(payloadString);
        })
    })
};

module.exports = handlers;