/**
 * Controller to handle /about users
 *
 * @param reqObject
 * @param returnCallback
 */
const libData = require('../lib/data');
const utilities = require('../helpers/utilities');

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
    return callback(200, {
        message: 'From Get Method'
    })
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

}

// Update method
controller._users.delete = (req, callback) => {

}

module.exports = controller;