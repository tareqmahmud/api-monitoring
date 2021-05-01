/**
 * Controller to handle /about users
 *
 * @param reqObject
 * @param returnCallback
 */
const libData = require('../lib/data');
const utilities = require('../helpers/utilities');
const {verify: verifyToken} = require('./tokenController')._token;

const controller = {};

controller.userController = (reqObject, returnCallback) => {
    // Accepted methods
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(reqObject.method) > -1) {
        // Call the specific controller
        const generateMethod = controller._users[reqObject.method];
        // Call the method
        generateMethod(reqObject, returnCallback);
    } else {
        returnCallback(405);
    }
}

// Controller private scaffolding
controller._users = {};

// Get method
controller._users.get = (req, callback) => {
    // At first retrieve the phone number from the query
    const phoneParam = req.params.get('phone');
    const phone = typeof (phoneParam) === 'string' && phoneParam.trim().length === 11 ? phoneParam : false;

    if (phone) {
        // Verify Authentication
        const authToken = req.headersObject.authToken;
        verifyToken(authToken, phone, (authenticated) => {
            if (authenticated) {
                // Check is file available or not
                libData.read('users', phone, (err, user) => {
                    const userObject = {...utilities.parseJson(user)}
                    if (!err) {
                        delete userObject.password;

                        callback(200, {
                            user: userObject
                        })
                    } else {
                        callback(404, {
                            error: 'Sorry user not found!'
                        })
                    }
                })
            } else {
                callback(403, {
                    error: 'Unauthorized Access'
                })
            }
        })
    } else {
        callback(400, {
            error: 'Please provide all the required valid field!'
        })
    }
}

// Post method
controller._users.post = (req, callback) => {
    // Validate the input body data
    const firstName = typeof (req.body.firstName) === 'string' && req.body.firstName.trim().length > 0 ? req.body.firstName : false;
    const lastName = typeof (req.body.lastName) === 'string' && req.body.lastName.trim().length > 0 ? req.body.lastName : false;
    const phone = typeof (req.body.phone) === 'string' && req.body.phone.trim().length === 11 ? req.body.phone : false;
    const password = typeof (req.body.password) === 'string' && req.body.password.trim().length > 0 ? req.body.password : false;
    const toAgreement = typeof (req.body.toAgreement) === 'boolean' ? req.body.toAgreement : false;

    // Condition for all required data available
    if (firstName && lastName && phone && password && toAgreement) {
        // Check is user already available or not,
        libData.read('users', phone, (err, user) => {
            if (err) {
                // User not available
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: utilities.hash(password),
                    toAgreement
                }

                // Store user to the file db
                libData.create('users', phone, userObject, (err, user) => {
                    if (!err) {
                        callback(200, {
                            message: 'User successfully created'
                        })
                    } else {
                        callback(500, {
                            error: 'Could not create the user!'
                        })
                    }
                })

            } else {
                callback(500, {
                    error: 'There is a problem in server side!'
                })
            }
        });

    } else {
        callback(400, {
            error: 'You\'ve to provide all the required data'
        })
    }
}

// Put method
controller._users.put = (req, callback) => {
    // Validate the input body data
    const firstName = typeof (req.body.firstName) === 'string' && req.body.firstName.trim().length > 0 ? req.body.firstName : false;
    const lastName = typeof (req.body.lastName) === 'string' && req.body.lastName.trim().length > 0 ? req.body.lastName : false;
    const phone = typeof (req.body.phone) === 'string' && req.body.phone.trim().length === 11 ? req.body.phone : false;
    const password = typeof (req.body.password) === 'string' && req.body.password.trim().length > 0 ? req.body.password : false;
    const toAgreement = typeof (req.body.toAgreement) === 'boolean' ? req.body.toAgreement : false;

    if (phone) {
        // Verify Authentication
        const authToken = req.headersObject.authToken;
        verifyToken(authToken, phone, (authenticated) => {
            if (authenticated) {
// Only update data if user at least provide one data except phone and agreement
                if (firstName || lastName || password) {
                    libData.read('users', phone, (err, user) => {
                        if (!err) {
                            // Retrieve existing user
                            const userObject = {...utilities.parseJson(user)}

                            // Only update userObject which is available
                            if (firstName) {
                                userObject.firstName = firstName;
                            }

                            if (lastName) {
                                userObject.lastName = lastName;
                            }

                            if (password) {
                                userObject.password = utilities.hash(password);
                            }

                            // Finally update the data
                            libData.update('users', phone, userObject, (err, user) => {
                                if (!err) {
                                    // Return the updated user
                                    delete userObject.password;

                                    callback(200, {
                                        user: userObject
                                    })
                                } else {
                                    callback(500, {
                                        error: 'Something wrong in server!'
                                    })
                                }
                            })
                        } else {
                            callback(400, {
                                error: 'Invalid phone number'
                            })
                        }
                    })
                }
            } else {
                callback(403, {
                    error: 'Unauthorized Access'
                })
            }
        })
    } else {
        callback(400, {
            error: 'Please input all the required fields'
        })
    }
}

// Update method
controller._users.delete = (req, callback) => {
    // At first retrieve the phone number from the query
    const phoneParam = req.params.get('phone');
    const phone = typeof (phoneParam) === 'string' && phoneParam.trim().length === 11 ? phoneParam : false;

    if (phone) {
        // Verify Authentication
        const authToken = req.headersObject.authToken;
        verifyToken(authToken, phone, (authenticated) => {
            if (authenticated) {
                // Check is file available or not
                libData.read('users', phone, (err, user) => {
                    const userObject = {...utilities.parseJson(user)}
                    if (!err && userObject) {
                        libData.delete('users', phone, (err) => {
                            if (!err) {
                                callback(200, {
                                    message: 'Successfully created the user'
                                })
                            } else {
                                callback(500, {
                                    error: 'Something wrong in database'
                                })
                            }
                        })
                    } else {
                        callback(404, {
                            error: 'Sorry user not found!'
                        })
                    }
                })
            } else {
                callback(403, {
                    error: 'Unauthorized Access'
                })
            }
        })
    } else {
        callback(400, {
            error: 'Please input all the required fields'
        })
    }
}

module.exports = controller;