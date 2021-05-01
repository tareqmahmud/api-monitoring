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

/**
 * Method to create random string based on length
 *
 * @param strLength
 * @returns {string}
 */
utilities.createRandomString = (strLength) => {
    // validate strLength
    const generateStrLength = typeof (strLength) === 'number' ? strLength : false;

    // All characters to create random string
    const allCharacters = 'abcdefghijklmnopqrstubwxyz0123456789';

    let output = '';

    // Loop from beginning to strLength
    for (let i = 1; i <= generateStrLength; i++) {
        let randomIndex = Math.floor(Math.random() * 20);
        let selectedCharacter = allCharacters.charAt(randomIndex);

        output += selectedCharacter;
    }

    return output;
}

module.exports = utilities;