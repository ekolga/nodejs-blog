const keys = require("../keys")

module.exports = function (email) {
    return {
        to: email,
        from: keys.SENDER_EMAIL,
        subject: 'Account has been successfully created',
        html: `<p>test email</p>`
    }
}