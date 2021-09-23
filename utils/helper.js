const crypto               = require('crypto');
const User                 = require('../models/user');
const nodemailer           = require('nodemailer');
const sendgrid             = require('nodemailer-sendgrid-transport');
const keys                 = require('../keys');
const registerEmailConfig  = require('../emails/registration');
const passResetEmailConfig = require('../emails/password-reset');

const trasporter = nodemailer.createTransport(sendgrid({
    auth: { api_key: keys.EMAIL_API_KEY }
}));

/**
 * Sends an email with new token for account confirmation
 * 
 * @param {User} user 
 * @returns 
 */
module.exports.sendMailWithNewRegistrationToken = function(user) {
    return crypto.randomBytes(32, async (err, buf) => {
        if (err) {
            req.flash('error', 'Something went wrong. Please, try again and contact me to fix that issue.');

            return res.redirect('/auth/login');
        }

        const token            = buf.toString('hex');
        user.registrationToken = token;

        await user.save();
        trasporter.sendMail(registerEmailConfig(user.email, token));
    })
}