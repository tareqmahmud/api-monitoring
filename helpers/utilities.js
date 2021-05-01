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
        output = JSON.stringify(stringData);
    } catch {
        output = {}
    }

    return output;
}


module.exports = utilities;