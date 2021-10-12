const nodemailer           = require('nodemailer');
const sendGridTransport    = require('nodemailer-sendgrid-transport');
const keys                 = require('../keys');
const registerEmailConfig  = require('../emails/registration');
const passResetEmailConfig = require('../emails/password-reset');
const { randomBytes }      = require('crypto');

/**
 * Some kind of tunnel for emails
 */
const trasporter = nodemailer.createTransport(sendGridTransport({
    auth: {
        api_key: keys.EMAIL_API_KEY
    }
}));

/**
 * Generates and returns pseudorandom token
 * 
 * @returns {string}
 */
 module.exports.getToken = function () {
    const buf = randomBytes(32);

    return buf.toString('hex');
}

/**
 * Sends email to reset account`s password
 * 
 * @param {string} email 
 * @param {string} token 
 */
module.exports.sendResetPasswordMail = async function (email, token) {
    await trasporter.sendMail(passResetEmailConfig(email, token));
}

/**
 * Sends email to confirm account registration
 * 
 * @param {string} email 
 * @param {string} token 
 */
module.exports.sendRegistrationEmail = async function (email, token) {
    await trasporter.sendMail(registerEmailConfig(email, token));
}

// Tear up connection between models and email sendings