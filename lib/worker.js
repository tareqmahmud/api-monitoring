const url = require('url');
const http = require('http');
const https = require('https');
const libDir = require('./data');
const utilities = require('../helpers/utilities');
const {sendTwilioSms} = require('../helpers/notifications');

// Module scaffolding
const worker = {};

/**
 * Lookup for all api checks
 */
worker.gatherAllChecks = () => {
    // Get all filenames
    libDir.list('checks', (err, fileNames) => {
        if (!err && fileNames && fileNames.length > 0) {
            fileNames.forEach(filename => {
                // Read the individual check
                libDir.read('checks', filename, (err, checkData) => {
                    if (!err && checkData) {
                        // Pass the data to the check validation
                        worker.validateCheckData(utilities.parseJson(checkData));
                    } else {
                        console.log('Error: reading the checks data');
                    }
                })
            })
        } else {
            console.log('Error: could not find any check to process!');
        }
    })
}

/**
 * Method to validate the checks json data
 *
 * @param checkData
 */
worker.validateCheckData = (checkData) => {
    const checkObj = {...utilities.parseJson(checkData)};
    if (checkObj && checkData.id) {
        checkObj.state = typeof (checkObj.state) === 'string' && ['up', 'down'].indexOf(checkObj.state) > -1 ? checkObj.state : 'down';
        checkObj.lastChecked = typeof (checkObj.lastChecked) === 'number' && checkObj.lastChecked > 0 ? checkObj.lastChecked : false;

        // Validation success now pass to the validate data to the next performCheck process
        worker.performCheck(checkObj);

    } else {
        console.log('Error: the checks are invalid or not properly formatted');
    }
}

/**
 * Method to perform each check
 *
 * @param checkObj
 */
worker.performCheck = (checkObj) => {
    // Prepare the initial check outcome
    let checkOutcome = {
        error: false,
        responseCode: false
    }

    // Mark the initial out false to set the status not started yet
    let outcomeSent = false;

    // Parse the hostName
    // Get the url path and parse it to object
    const baseUrl = `${checkObj.protocol}://${checkObj.url}`;
    const parseUrl = url.parse(baseUrl, true);
    const hostName = parseUrl.hostname;
    const path = parseUrl.path;

    // Build the request object
    const reqObject = {
        protocol: `${checkObj.protocol}:`,
        hostname: hostName,
        method: checkObj.method.toUpperCase(),
        path,
        timeout: checkObj.timeoutSeconds * 1000,
    }

    const protocolToUse = checkObj.protocol === 'http' ? http : https;

    const req = protocolToUse.request(reqObject, (res) => {
        // Grab the status code
        const statusCode = res.statusCode;

        // Update the check outcome and pass the process to next module
        checkOutcome.responseCode = statusCode;
        if (!outcomeSent) {
            worker.processCheckOutcome(checkObj, checkOutcome)
            outcomeSent = true;
        }
    })

    // Event listener for request error
    req.on('error', e => {
        checkOutcome = {
            error: true,
            value: e,
        };

        // Update the check outcome and pass the process to next module
        if (!outcomeSent) {
            worker.processCheckOutcome(checkObj, checkOutcome);
            outcomeSent = true;
        }
    })

    // Event listener for request time out
    req.on('timeout', e => {
        checkOutcome = {
            error: true,
            value: 'timeout',
        };

        // Update the check outcome and pass the process to next module
        if (!outcomeSent) {
            worker.processCheckOutcome(checkObj, checkOutcome);
            outcomeSent = true;
        }
    })

    // End the request
    req.end();
}

/**
 * Save the check outcome to db and send it to next process
 * @param checkObj
 * @param checkOutcome
 */
worker.processCheckOutcome = (checkObj, checkOutcome) => {
    // Check is outcome up or down
    const state = !checkOutcome.error && checkOutcome.responseCode && checkObj.successCode.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';

    // Decide whether we should alert the user or not
    const alertWanted = !!(checkObj.lastChecked && checkObj.state !== state);

    // Update the new check data
    const newCheckObj = checkObj;

    newCheckObj.state = state;
    newCheckObj.lastChecked = Date.now();

    // Update the check data to the db
    newCheckObj.update('checks', newCheckObj.id, newCheckObj, (err) => {
        if (!err) {
            if (alertWanted) {
                // Send the alert message
                worker.alertToTheUser(newCheckObj);
            } else {
                console.log('Alert is not needed as there is no state change!');
            }
        } else {
            console.log('Error: trying to save check data to the file');
        }
    })
}

/**
 * Method to alert the user about the status change
 *
 * @param checkObj
 */
worker.alertToTheUser = (checkObj) => {
    const msg = `Alert: Your check for ${checkObj.method.toUpperCase()} ${
        checkObj.protocol
    }://${checkObj.url} is currently ${checkObj.state}`;

    sendTwilioSms(checkObj.userPhone, msg, (err) => {
        if (!err) {
            console.log(`User was alerted to a status change via SMS: ${msg}`);
        } else {
            console.log('There was a problem sending sms to one of the user!');
        }
    });
}

// Continues loop for the Checks
worker.loopChecks = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 1000 * 60) // Loop per minutes -> milliseconds * 60 seconds = 1min
}

// Start the workers
worker.init = () => {
    // Execute all the checks
    worker.gatherAllChecks();

    // Call the loop for continue checks
    worker.loopChecks();
}

// Export module
module.exports = worker;