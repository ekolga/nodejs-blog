const { Router }             = require('express');
const router                 = Router();
const Article                = require('../models/article');
const fnsDate                = require('date-fns/format')
const mongoose               = require('mongoose');
const adminCheck             = require('../middlewares/adminCheck.js');
const User                   = require('../models/user');
const validators             = require('../utils/validators');
const { validationResult }   = require('express-validator');
const { setRate, unsetRate, checkIfUserRatedAnArticle } = require('../utils/helper');
// End of imports

/**
 * Shows an article and all comments to it
 */
router.get('/view/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate('comments.user', 'email name').lean();
        let userRates = checkIfUserRatedAnArticle(req.session.user, article);


        res.render('article', {
            title: article.title,
            user: req.session.user,
            error: req.flash('error'),
            success: req.flash('success'),
            article,
            articleComments: article.comments,
            likes: article.likes.length,
            dislikes: article.dislikes.length,
            isLikedByUser: userRates.isLikedByUser,
            isDislikedByUser: userRates.isDislikedByUser
        })
    } catch (error) {
        console.error(error);
    }
});

/**
 * Sets like to an article and to a user objects
 */
 router.post('/view/:id/rating/setLike', async (req, res) => {
    try {
        setRate(req, res, 'like');
    } catch (error) {
        console.error(error);
    }
});

/**
 * Sets dislike to an article and to a user objects
 */
router.post('/view/:id/rating/setDislike', async (req, res) => {
    try {
        setRate(req, res, 'dislike');
    } catch (error) {
        console.error(error);
    }
});

/**
 * Removes like from an article and from a user objects
 */
router.post('/view/:id/rating/unsetLike', async (req, res) => {
    try {
        unsetRate(req, res, 'like');
    } catch (error) {
        console.error(error);
    }
});

/**
 * Removes dislike from an article and from a user objects
 */
 router.post('/view/:id/rating/unsetDislike', async (req, res) => {
    try {
        unsetRate(req, res, 'dislike');
    } catch (error) {
        console.error(error);
    }
});

/**
 * Returns number of rates to the specified article
 */
router.route('/view/:id/rating')
    .get(async (req, res) => {
        try {
            const article  = await Article.findById(req.params.id).lean();
            const likes    = article.likes.length;
            const dislikes = article.dislikes.length;

            res.end(JSON.stringify({
                likes,
                dislikes
            }))
        } catch (error) {
            console.error(error);
        }
    });

/**
 * Writes a comment to an article and a user objects
 */
router.post('/view/:id/post-comment', validators.commentValidator, async (req, res) => {
    try {
        // Add a comment to an article
        const commentMongoId  = new mongoose.Types.ObjectId()
        let article           = await Article.findById(req.params.id).lean();
        let user              = await User.findOne({ email: req.body.email }); // Add an ability to comment without being authorized
        const commentObject   = {
            "_id": commentMongoId,
            "text": req.body.text,
            "date": fnsDate(new Date(Date.now()), 'PPPp'),
            "user": user
        }
        const validationErrors = validationResult(req).errors;
        
        if (validationErrors.length) {
            validationErrors.forEach(error => {
                req.flash('error', error.msg);
            });

            return res.status(422).redirect(`/article/view/${req.params.id}`);
        }

        article.comments.push(commentObject);

        await Article.findByIdAndUpdate(req.params.id, article);
        
        // Add a record about comment to a user
        const userComments = [...user.comments];

        userComments.push({
            writtenTo: article._id,
            comment: commentMongoId
        })

        user.comments = userComments;

        await user.save();

        req.flash('success', 'Your comment has been successfully added!')

        res.redirect(`/article/view/${req.params.id}`);
    } catch (error) {
        console.error(error);
    }
})

// Add a new article
router.route('/add')
.get(adminCheck, (req, res) => {
    res.render('add-article', {
        title: `Add a new article`
    })
})
.post(adminCheck, async (req, res) => {
    const article = {
        title: req.body.title, 
        text: req.body.text,
        shortText: shortenTheText(req.body.text),
        comments: [],
        tags: req.body.tags,
        created_at: new Date(Date.now()).toISOString(),
        visible_date: fnsDate(new Date(Date.now()), 'PPP'),
        hidden: req.body.hidden,
        favorites: 0
    }

    const articleModel = new Article(article);

    try {
        res.redirect('/');

        await articleModel.save();
    } catch (error) {
        console.error(error);
    }
});

// Edit an article
router.route('/edit/:id')
.get(adminCheck, async (req, res) => {
    const article = await Article.findById(req.params.id).lean();

    res.render('edit-article', {
        title: `'${article.title}' editing`,
        article
    });
})
.post(adminCheck, async (req, res) => {
    const { id } = req.body;
    delete req.body.id;
    
    req.body.shortText = shortenTheText(req.body.text); // Remake the short text too

    try {
        await Article.findByIdAndUpdate(id, req.body);

        res.redirect('/');
    } catch (error) {
        console.error(error);
    }
});

// Delete an article
router.post('/delete/:id', adminCheck, async (req, res) => {
    try {
        await Article.findByIdAndDelete(req.body.id);

        res.redirect('/');
    } catch (error) {
        console.error(error);
    }
})

// Helper functions
let shortenTheText = function(text) {
    const limit   = 700;
    const endChar = '…'

    return text.slice(0, limit) + endChar;
}

module.exports = router;