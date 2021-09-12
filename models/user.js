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
    role: {
        type: String,
        required: true,
        default: 'regular'
    }
});

module.exports = model('User', userSchema)