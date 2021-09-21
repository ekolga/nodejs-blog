const {Schema, model} = require('mongoose');
const userSchema      = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    comments: [{
        writtenTo: {
            type: Schema.Types.ObjectId,
            ref: 'Article'
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: 'Article'
        }
    }],
    restoreToken: String,
    restoreTokenExpirationDate: Date,
    role: {
        type: String,
        required: true,
        default: 'regular'
    },
    registrationToken: String,
    isActivated: {
        type: Boolean,
        required: true,
        default: false
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    }
});

module.exports = model('User', userSchema)