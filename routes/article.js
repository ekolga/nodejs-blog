const {Router} = require('express');
const router   = Router();
const Article  = require('../models/article');
const fnsDate  = require('date-fns/format')

router.get('/view/:id', async (req, res) => {
    const article = await Article.findById(req.params.id).lean();

    res.render('article', {
        title: article.title,
        article
    })
})

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
    console.log(id)
    try {
        await Article.findByIdAndUpdate(id, req.body);

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