const {Schema, model} = require('mongoose');
const articleSchema   = new Schema({
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    shortText: String,
    comments: [{ 
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }, 
        text: String, 
        date: String 
    }],
    likes: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
    }],
    dislikes: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
    }],
    tags: String,
    created_at: {
        type: Date,
        default: new Date(Date.now).toISOString
    },
    visible_date: String,
    hidden: {
        type: Boolean,
        default: false
    },
});

module.exports = model('Article', articleSchema)