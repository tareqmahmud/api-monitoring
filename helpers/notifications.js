const https = require('https');
const querystring = require('querystring');
const {twilio} = require('../config');

// module scaffolding
const notifications = {};

// send sms to user using twilio api
notifications.sendTwilioSms = (phone, message, callback) => {
    // input validation
    const userPhone = typeof (phone) === 'string' && phone.trim().length === 11 ? phone.trim() : false;

    const userMessage = typeof message === 'string' && message.trim().length > 0 && message.trim().length <= 1600 ? message.trim() : false;

    if (userPhone && userMessage) {
        // configure the request payload
        const payload = {
            From: twilio.fromPhone,
            To: `+88${userPhone}`,
            Body: userMessage,
        };

        // stringify the payload
        const stringifyPayload = querystring.stringify(payload);

        // configure the request details
        const requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            auth: `${twilio.accountSid}:${twilio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        // Instance the request object
        const req = https.request(requestDetails, (res) => {
            // Get the status of the request
            const status = res.statusCode;
            // callback successfully if the request went through
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback(`Status code returned was ${status}`);
            }
        });

        req.on('error', (e) => {
            callback(e);
        });

        req.write(stringifyPayload);
        req.end();
    } else {
        callback('Given parameters were missing or invalid!');
    }
};

// export the module
module.exports = notifications;