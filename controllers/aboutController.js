/**
 * Controller to handle /about routes
 *
 * @param reqObject
 * @param returnCallback
 */
const aboutController = (reqObject, returnCallback) => {
    returnCallback(200, {
        message: 'Successfully Called'
    })
}

module.exports = aboutController;