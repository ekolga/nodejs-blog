const crypto               = require('crypto');
const User                 = require('../models/user');
const Article              = require('../models/article')
const nodemailer           = require('nodemailer');
const sendgrid             = require('nodemailer-sendgrid-transport');
const keys                 = require('../keys');
const registerEmailConfig  = require('../emails/registration');
const passResetEmailConfig = require('../emails/password-reset');
const mongoose             = require('mongoose');

const trasporter = nodemailer.createTransport(sendgrid({
    auth: { api_key: keys.EMAIL_API_KEY }
}));

/**
 * Sends an email with new token for account confirmation
 * 
 * @param {User} user 
 * @returns 
 */
module.exports.sendMailWithNewRegistrationToken = function (user) {
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

/**
 * Sets rate to an article and a user objects
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} rate 
 * @returns 
 */
module.exports.setRate = async function (req, res, rate) {
    console.log(req.body)
    const user = req.body.email ? await User.findOne({ email: req.body.email }) : null;
    console.log(user)
    
    if (user === null) {
        return res.end(JSON.stringify({
            status: 'error',
            error: 'User have to be authorized'
        }));
    }

    // End the response if user has already liked or disliked this post
    const rateProperty            = (rate === 'like') ? 'likes' : 'dislikes';
    let query                     = {}
    query['_id']                  = req.params.id
    query[`${rateProperty}.user`] = new mongoose.Types.ObjectId(user._id)
    const checkArticle            = await Article.findOne(query);

    if (checkArticle) {
        return res.end(JSON.stringify({
            status: 'ok',
            message: `You have already set ${rate} on this post`,
            likes: checkArticle.likes.length,
            dislikes: checkArticle.dislikes.length
        }));
    }

    const article = await Article.findById(req.params.id);

    // Saving a record to an article model

    let articleRates = [...article[rateProperty]];

    articleRates.push({ user });

    article[rateProperty] = articleRates;

    article.save().then(updatedArticle => {
        return res.end(JSON.stringify({
            status: "ok",
            likes: updatedArticle.likes.length,
            dislikes: updatedArticle.dislikes.length
        }))
    });

    // Saving a record to a user model

    let userRates = [...user[rateProperty]];

    userRates.push({ article })

    user[rateProperty] = userRates;

    await user.save();
};

/**
 * Unsets a rate from an article and a user objects
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} rate 
 * @returns 
 */
module.exports.unsetRate = async function (req, res, rate) {
    const user = req.body.email ? await User.findOne({ email: req.body.email }) : undefined;
    
    if (user === undefined) {
        return res.end(JSON.stringify({
            status: 'error',
            error: 'User have to be authorized'
        }));
    }

    // End the response if user has already liked or disliked this post
    const userId                  = new mongoose.Types.ObjectId(user._id);
    const rateProperty            = (rate === 'like') ? 'likes' : 'dislikes';
    let query                     = {}
    query['_id']                  = req.params.id
    query[`${rateProperty}.user`] = userId;
    const article                 = await Article.findOne(query);

    if (!article) {
        return res.end(JSON.stringify({
            status: 'error',
            error: 'You have not rated this article yet'
        }))
    }

    // Deleting a like from an article object

    const newArticleRatesObj = article[rateProperty].filter(rateObj => rateObj.user.toString() != userId);
    article[rateProperty]    = newArticleRatesObj;
    
    article.save().then(updatedArticle => {
        return res.end(JSON.stringify({
            status: "ok",
            likes: updatedArticle.likes.length,
            dislikes: updatedArticle.dislikes.length
        }))
    })

    // Deleting a like from a user object
    const newUserRatesObj = user[rateProperty].filter(rateObj => rateObj.article.toString() != new mongoose.Types.ObjectId(article._id));
    user[rateProperty]    = newUserRatesObj;

    await user.save();
}