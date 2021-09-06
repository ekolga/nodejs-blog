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
    comments: [{ name: String, body: String, date: Date }],
    tags: String,
    created_at: Date,
    visible_date: String,
    hidden: Boolean,
    favorites: Number
});

module.exports = model('Article', articleSchema)