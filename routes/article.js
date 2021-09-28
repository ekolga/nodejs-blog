const { Router }           = require('express');
const router               = Router();
const Article              = require('../models/article');
const fnsDate              = require('date-fns/format')
const mongoose             = require('mongoose');
const adminCheck           = require('../middlewares/adminCheck.js');
const User                 = require('../models/user');
const validators           = require('../utils/validators');
const { validationResult } = require('express-validator');
//

const LIKE = 1;

const DISLIKE = 0;

// View an article and comments to it
router.get('/view/:id', async (req, res) => {
    try {
        const article         = await Article.findById(req.params.id).populate('comments.user', 'email name').lean();
        const articleComments = article.comments;
    
        res.render('article', {
            title: article.title,
            user: req.session.user,
            error: req.flash('error'),
            success: req.flash('success'),
            article,
            articleComments
        })
    } catch (error) {
        console.error(error);
    }
});

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
    })
    .post(async (req, res) => { // Check if user has already rated this article
        try {
            let article         = await Article.findById(req.params.id);
            let user            = await User.findOne({ email: req.body.email })
            const rate          = +req.body.rate; // 1 means like, 0 - dislike
            const toSet         = +req.body.toSet; // 1 means to set, 0 - to unset
            const ratingMongoId = new mongoose.Types.ObjectId()

            if (rate === undefined) {
                return res.end(JSON.stringify({
                    status: 'error',
                    error: 'Rate parameter is required'
                }));
            }

            if ([LIKE, DISLIKE].indexOf(rate) == -1) {
                return res.end(JSON.stringify({
                    status: 'error',
                    error: `Rate parameter is need to be ${LIKE} or ${DISLIKE}`
                }));
            }
            
            if (toSet) {
                if (User.findOne({ email: req.body.email, 'likes': new mongoose.Types.ObjectId(req.params.id) })) {
                    console.log('TRUE mazafaka')
                }

                // Saving a record to an article model

                const ratingObj  = {
                    "_id": ratingMongoId,
                    user
                };
                const rateWord   = rate ? 'likes' : 'dislikes';
                let articleRates = [...article[rateWord]];
                
                articleRates.push(ratingObj);

                article[rateWord] = articleRates;

                await article.save();

                // Saving a record to a user model

                let userRates = [...user[rateWord]];

                userRates.push({ "_id": req.params.id })

                user[rateWord] = userRates;

                user.save();
               
                article = await Article.findById(req.params.id).lean();

                return res.end(JSON.stringify({
                    status: "ok",
                    likes: article.likes.length,
                    dislikes: article.dislikes.length
                }))
            }

        } catch (error) {
            console.error(error);
        }
    });

// Post a comment
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
    const limit   = 999;
    const endChar = '…'

    return text.slice(0, limit) + endChar;
}

module.exports = router;