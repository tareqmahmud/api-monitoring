/**
 * Controller to handle /check controller
 *
 * @param reqObject
 * @param returnCallback
 */
const libData = require('../lib/data');
const utilities = require('../helpers/utilities');
const {verify: verifyToken} = require('./tokenController')._token;

const controller = {};

controller.checkController = (reqObject, returnCallback) => {
    // Accepted methods
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(reqObject.method) > -1) {
        // Call the specific controller
        const generateMethod = controller._check[reqObject.method];
        // Call the method
        generateMethod(reqObject, returnCallback);
    } else {
        returnCallback(405);
    }
}

// Controller private scaffolding
controller._check = {};

// Post method
controller._check.post = (req, callback) => {
    // Validate the input data
    /**
     * Input Data
     * - protocol -> string in [http, https]
     * - url -> string
     * - method -> [GET, POST, PUT, DELETE]
     * - successCode -> [200, 201],
     * - timeoutSeconds -> number
     **/
    const protocol = typeof (req.body.protocol) === 'string' && ['http', 'https'].indexOf(req.body.protocol) > -1 ? req.body.protocol : false;
    const url = typeof (req.body.url) === 'string' && req.body.url.trim().length > 0 ? req.body.url : false;
    const method = typeof (req.body.method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(req.body.method) > -1 ? req.body.method : false;
    const successCode = typeof (req.body.successCode) === 'object' && req.body.successCode instanceof Array ? req.body.successCode : false;
    const timeoutSeconds = typeof (req.body.timeoutSeconds) === 'number' && req.body.timeoutSeconds % 1 === 0 && req.body.timeoutSeconds >= 1 && req.body.timeoutSeconds <= 5 ? req.body.timeoutSeconds : false;

    // Validate data
    if (protocol && url && method && successCode && timeoutSeconds) {
        // Retrieve the token from the header
        const authToken = req.headersObject.token;

        // find out user phone number from token
        libData.read('token', authToken, (err, tokenData) => {
            if (!err && tokenData) {
                const userPhone = {...utilities.parseJson(tokenData)}.phone;

                // Find out the user with userPhone number
                libData.read('users', userPhone, (err, userData) => {
                    if (!err && userData) {
                        // Authenticated
                        verifyToken(authToken, userPhone, (authenticated) => {
                            if (authenticated) {
                                const userObject = {...utilities.parseJson(userData)};
                                const userChecks = typeof (userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                                if (userChecks.length <= 5) {
                                    const checkId = utilities.createRandomString(20);
                                    const checkObject = {
                                        id: checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCode,
                                        timeoutSeconds
                                    }

                                    // Save the object to checks db
                                    libData.create('checks', checkId, checkObject, (err, data) => {
                                        if (!err && data) {
                                            // Add check it to the user
                                            userChecks.push(checkId);
                                            userObject.checks = userChecks;

                                            // Update the user
                                            libData.update('users', userPhone, userObject, (err) => {
                                                if (!err) {
                                                    callback(200, {
                                                        message: 'You new monitoring url is successfully added'
                                                    })
                                                } else {
                                                    callback(500, {
                                                        error: 'Something wrong in server!'
                                                    })
                                                }
                                            })

                                        } else {
                                            callback(500, {
                                                error: 'Something wrong in server!'
                                            })
                                        }
                                    })
                                } else {
                                    callback(401, {
                                        error: 'You already reached max check limit!'
                                    })
                                }
                            } else {
                                callback(403, {
                                    error: 'Unauthorized Access!'
                                })
                            }
                        })
                    } else {
                        callback(404, {
                            error: 'No user has been found!!'
                        })
                    }
                })
            } else {
                callback(404, {
                    error: 'Invalid token!'
                })
            }
        })

    } else {
        callback(400, {
            error: 'Please provide all the valid data'
        })
    }

}

// Get method
controller._check.get = (req, callback) => {
    const checkIdParam = req.params.get('id');
    const checkId = typeof (checkIdParam) === 'string' && checkIdParam.trim().length === 20 ? checkIdParam : false;

    if (checkId) {
        // Find out the check api object from DB
        libData.read('checks', checkId, (err, checkData) => {
            if (!err && checkData) {
                const authToken = req.headersObject.token;

                verifyToken(authToken, checkData.phone, (authenticated) => {
                    if (authenticated) {
                        callback(200, utilities.parseJson(checkData));
                    } else {
                        callback(403, {
                            error: 'Unauthorized Access'
                        })
                    }
                })
            } else {
                callback(404, {
                    error: 'Invalid check id'
                })
            }
        })
    } else {
        callback(400, {
            error: 'Please provide all the valid data'
        })
    }
}

// Put method
controller._check.put = (req, callback) => {

}

// Update method
controller._check.delete = (req, callback) => {

}

module.exports = controller;