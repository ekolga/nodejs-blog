const { BASE_URL } = require("../keys")
const keys         = require("../keys")

module.exports = function (email, token) {
    return {
        to: email,
        from: keys.SENDER_EMAIL,
        subject: 'Your code for password reset',
        html: `<p>Click here if you want to reset your password - ${BASE_URL}/auth/password-reset/${token}</p>`
    }
}