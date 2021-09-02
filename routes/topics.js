const {Router} = require('express');
const router   = Router();

router.get('/', (req, res) => {
    res.render('topics',  {
        title: `Topic's page`
    });
});

module.exports = router;