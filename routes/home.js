const {Router} = require('express');
const router   = Router();
const Article  = require('../models/article');

router.get('/', async (req, res) => {
    const articles = await Article.getAll();
    
    res.render('index', {
        title: `Edward's blog`,
        articles
    })
});

module.exports = router;