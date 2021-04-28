/**
 * Controller for handle 404 not found routes
 *
 * @param reqObject
 * @param returnCallback
 */
const notFoundController = (reqObject, returnCallback) => {
    returnCallback(404, {
        message: `404 Not Found!!`
    })
}

module.exports = notFoundController;

