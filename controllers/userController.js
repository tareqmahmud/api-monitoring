/**
 * Controller to handle /about users
 *
 * @param reqObject
 * @param returnCallback
 */
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

}

// Put method
controller._users.put = (req, callback) => {

}

// Update method
controller._users.delete = (req, callback) => {

}

module.exports = controller;