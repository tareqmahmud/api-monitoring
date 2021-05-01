const crypto = require('crypto');
const config = require('../config');

// Module scaffolding
const utilities = {};

/**
 * Method to parseJson
 *
 * @param stringData
 * @returns {{}}
 */
utilities.parseJson = (stringData) => {
    let output;

    try {
        output = JSON.parse(stringData);
    } catch {
        output = {}
    }

    return output;
}

/**
 * Method to hash a string
 *
 * @param str
 * @returns {string|boolean}
 */
utilities.hash = (str) => {
    if (typeof (str) === 'string' && str.length > 0) {
        return crypto.createHmac('sha256', config.secret).update(str).digest('hex');
    }
    return false;
}


module.exports = utilities;