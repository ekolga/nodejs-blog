const {Router} = require('express');
const router   = Router();
const Article  = require('../models/article');

router.get('/', async (req, res) => {
    const articles = await Article.find().lean();

    res.render('index', {
        title: `Edward's blog`,
        success: req.flash('success'),
        articles
    })
});

module.exports = router;