/**
 * Controller to handle /about users
 *
 * @param reqObject
 * @param returnCallback
 */
const libData = require('../lib/data');
const utilities = require('../helpers/utilities');

const controller = {};

controller.tokenController = (reqObject, returnCallback) => {
    // Accepted methods
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(reqObject.method) > -1) {
        // Call the specific controller
        const generateMethod = controller._token[reqObject.method];
        // Call the method
        generateMethod(reqObject, returnCallback);
    } else {
        returnCallback(405);
    }
}

// Controller private scaffolding
controller._token = {};

// Post method
controller._token.post = (req, callback) => {
    const phone = typeof (req.body.phone) === 'string' && req.body.phone.trim().length === 11 ? req.body.phone : false;
    const password = typeof (req.body.password) === 'string' && req.body.password.trim().length > 0 ? req.body.password : false;

    if (phone && password) {
        // Check is user available with the phone number and password or not
        libData.read('users', phone, (err, user) => {
            if (!err && user) {
                const hashedPassword = utilities.hash(password);
                const userObject = {...utilities.parseJson(user)}

                if (userObject.password === hashedPassword) {
                    // User available

                    // Create token object
                    const id = utilities.createRandomString(20);
                    const tokenObject = {
                        id,
                        phone,
                        expireIn: new Date() * 1000 * 60 * 60
                    }

                    // Save this token
                    libData.create('token', id, tokenObject, (err) => {
                        if (!err) {
                            callback(200, {
                                token: tokenObject
                            })
                        } else {
                            callback(500, {
                                error: 'Something went wrong in server!'
                            })
                        }
                    })
                } else {
                    callback(404, {
                        error: 'Sorry Invalid password!'
                    })
                }

            } else {
                callback(404, {
                    error: 'Sorry no user has been found'
                })
            }
        })

    } else {
        callback(400, {
            error: 'Please provide all the required field'
        })
    }
}

// Get method
controller._token.get = (req, callback) => {
    // At first retrieve the phone number from the query
    const tokenIdParam = req.params.get('id');
    const tokenId = typeof (tokenIdParam) === 'string' && tokenIdParam.trim().length === 20 ? tokenIdParam : false;

    if (tokenId) {
        // Check is file available or not
        libData.read('token', tokenId, (err, tokenData) => {
            const tokenObject = {...utilities.parseJson(tokenData)}
            if (!err) {
                callback(200, {
                    token: tokenObject
                })
            } else {
                callback(404, {
                    error: 'Sorry invalid token!!'
                })
            }
        })
    } else {
        callback(404, {
            error: 'Sorry invalid token!!'
        })
    }

}

// Put method
controller._token.put = (req, callback) => {
    const tokenId = typeof (req.body.id) === 'string' && req.body.id.trim().length === 20 ? req.body.id : false;
    const extend = typeof (req.body.extend) === 'boolean' && req.body.extend === true;

    if (tokenId && extend) {
        // Read the token
        libData.read('token', tokenId, (err, tokenData) => {
            if (!err && tokenData) {
                const tokenObject = {...utilities.parseJson(tokenData)};
                tokenObject.expireIn = new Date() * 1000 * 60 * 60;

                // Update the token file
                libData.update('token', tokenId, tokenObject, (err) => {
                    if (!err) {
                        callback(200, {
                            message: 'Successfully Extend the token time'
                        })
                    } else {
                        callback(500, {
                            error: 'Internal server error'
                        })
                    }
                })
            } else {
                callback(404, {
                    error: 'Sorry no token has been found'
                })
            }
        })
    } else {
        callback(400, {
            error: 'Please provide all the valid required field'
        })
    }

}

// Update method
controller._token.delete = (req, callback) => {
    // At first retrieve the phone number from the query
    const tokenIdParam = req.params.get('id');
    const tokenId = typeof (tokenIdParam) === 'string' && tokenIdParam.trim().length === 20 ? tokenIdParam : false;

    if (tokenId) {
        // Check is file available or not
        libData.read('token', tokenId, (err, tokenData) => {
            const tokenObject = {...utilities.parseJson(tokenData)}
            if (!err && tokenObject) {
                libData.delete('token', tokenId, (err) => {
                    if (!err) {
                        callback(200, {
                            message: 'Successfully deleted the token'
                        })
                    } else {
                        callback(500, {
                            error: 'Something wrong in database'
                        })
                    }
                })
            } else {
                callback(400, {
                    error: 'Sorry, invalid token'
                })
            }
        })
    } else {
        callback(400, {
            error: 'Please provide all the valid required field'
        })
    }


}

// Method for verify token
controller._token.verify = (id, phone, callback) => {
    libData.read('token', id, (err, tokenData) => {
        if (!err && tokenData) {
            const tokenObject = {...utilities.parseJson(tokenData)};
            if (tokenObject.phone === phone && tokenObject.expireIn > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    })
}

module.exports = controller;