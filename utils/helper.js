const crypto               = require('crypto');
const User                 = require('../models/user');
const Article              = require('../models/article')
const nodemailer           = require('nodemailer');
const sendgrid             = require('nodemailer-sendgrid-transport');
const keys                 = require('../keys');
const registerEmailConfig  = require('../emails/registration');
const passResetEmailConfig = require('../emails/password-reset');
const mongoose             = require('mongoose');
// End of imports

const trasporter = nodemailer.createTransport(sendgrid({
    auth: { api_key: keys.EMAIL_API_KEY }
}));

/**
 * Deletes rate from a user object
 * 
 * @param {*} userObject 
 * @param {*} articleId 
 * @param {*} rate 
 */
 async function deleteRateFromUserObject(userObject, articleId, rate) {
    try {
        const newUserRatesObj = userObject[rate].filter(rateObj => rateObj.article.toString() != new mongoose.Types.ObjectId(articleId));
        userObject[rate]      = newUserRatesObj;

        await userObject.save();
    } catch (error) {
        console.error(error);
    }
}

/**
 * Deletes rate from an article object
 * 
 * @param {*} articleObject 
 * @param {*} userId 
 * @param {*} rate 
 * @returns Document
 */
async function deleteRateFromArticleObject(articleObject, userId, rate) {
    try {
        const newArticleRatesObj = articleObject[rate].filter(rateObj => rateObj.user.toString() != userId);
        articleObject[rate]      = newArticleRatesObj;
        
        return await articleObject.save();
    } catch (error) {
        console.error(error);
    }
}

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
    try {
        const user = req.body.email ? await User.findOne({ email: req.body.email }) : null;
    
        if (user === null) {
            return res.end(JSON.stringify({
                status: 'error',
                error: 'You have to be authorized'
            }));
        }
    
        // End the response if user has already liked or disliked this post
        const userId                  = new mongoose.Types.ObjectId(user._id);
        const rateProperty            = (rate === 'like') ? 'likes' : 'dislikes';
        let query                     = {};
        query['_id']                  = req.params.id;
        query[`${rateProperty}.user`] = userId;
        let checkArticle              = await Article.findOne(query);
    
        if (checkArticle) {
            return res.end(JSON.stringify({
                status: 'ok',
                message: `You have already set ${rate} on this post`,
                likes: checkArticle.likes.length,
                dislikes: checkArticle.dislikes.length
            }));
        }
    
        const article = await Article.findById(req.params.id);
    
        // Check if a user set the opposite rate to an article and remove it from the objects
    
        const oppositeRate = (rateProperty === 'likes') ? 'dislikes' : 'likes';
        
        await deleteRateFromArticleObject(article, userId, oppositeRate);
        await deleteRateFromUserObject(user, article._id, oppositeRate);
    
        // Saving a new record to an article model
    
        let articleRates = [...article[rateProperty]];
    
        articleRates.push({ user });
    
        article[rateProperty] = articleRates;
    
        article.save().catch(err => console.error(err)).then(updatedArticle => {
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
    } catch (error) {
        console.error(error);
    }
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
    try {
        const user = req.body.email ? await User.findOne({ email: req.body.email }) : undefined;

        if (user === undefined) {
            return res.end(JSON.stringify({
                status: 'error',
                error: 'You have to be authorized'
            }));
        }

        // End the response if user hasn't liked or disliked this post yet
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

        const updatedArticle = await deleteRateFromArticleObject(article, userId, rateProperty);
        await deleteRateFromUserObject(user, article._id, rateProperty);

        res.end(JSON.stringify({
            status: "ok",
            likes: updatedArticle.likes.length,
            dislikes: updatedArticle.dislikes.length
        }));
    } catch (error) {
        console.error(error);
    }
};

/**
 * Checks if user has already rated an article
 * 
 * @param {*} user 
 * @param {*} article 
 * @returns 
 */
module.exports.checkIfUserRatedAnArticle = function (user, article) {
    let userRates    = {
        isLikedByUser: false,
        isDislikedByUser: false,
    }

    if (!user) {
        // Returns false if user is unauthorized
        return userRates;
    }

    let articleLikes = [...article.likes];

    articleLikes.forEach(array => {
        if (array.user.toString() === user._id.toString()) {
            userRates.isLikedByUser = true;
        }
    })

    let articleDislikes = [...article.dislikes];

    articleDislikes.forEach(array => {
        if (array.user.toString() === user._id.toString()) {
            userRates.isDislikedByUser = true;
        }
    })

    return userRates;
};