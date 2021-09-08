const {Router} = require('express');
const router   = Router();
const Article  = require('../models/article');
const fnsDate  = require('date-fns/format')

// View an article
router.get('/view/:id', async (req, res) => {
    const article = await Article.findById(req.params.id).populate('comments.user', 'email name').lean();
    
    res.render('article', {
        title: article.title,
        article
    })
})

// Post a comment
router.post('/view/:id/post-comment', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).lean();
        article.comments.push(req.body);

        await Article.findByIdAndUpdate(req.params.id, article);

        // TODO: Add a record about new comment to a user object

        res.end('Comment has been successfully added.');
    } catch (error) {
        console.error(error);
    }
})

// See comments to an article
router.get('/view/:id/comments', async (req, res) => {
    try {
        const article         = await Article.findById(req.params.id).populate('comments.user', 'email name').lean();
        const articleComments = article.comments;

        res.render('article-comments', {
            title: 'Discussion',
            articleComments
        })
    } catch (error) {
        console.error(error);
    }
})

// Add a new article
router.route('/add')
.get((req, res) => {
    res.render('add-article', {
        title: `Add a new article`
    })
})
.post((req, res) => {
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
        articleModel.save();

        res.redirect('/');
    } catch (error) {
        console.error(error);
    }
});

// Edit an article
router.route('/edit/:id')
.get(async (req, res) => {
    const article = await Article.findById(req.params.id).lean();

    res.render('edit-article', {
        title: `'${article.title}' editing`,
        article
    });
})
.post(async (req, res) => {
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
router.post('/delete/:id', async (req, res) => {
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