const {Router} = require('express');
const router   = Router();
const Article  = require('../models/article');

router.get('/view/:id', async (req, res) => {
    const article = await Article.getOneById(req.params.id);

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
    const articleModel = new Article(req.body.title, req.body.text);
    articleModel.save();

    res.redirect('/');
});

module.exports = router;