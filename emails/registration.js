const keys = require("../keys")

module.exports = function (email, token) {
    return {
        to: email,
        from: keys.SENDER_EMAIL,
        subject: 'Please confirm your account',
        html: `
        <p>Click on the link to confirm your account creation</p>
        <p>${keys.BASE_URL}/auth/register/confirm/${token}</p>
        `
    }
}