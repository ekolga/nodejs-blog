const {Router} = require('express');
const router   = Router();

router.get('/', (req, res) => {
    res.render('index', {
        title: `Edward's blog`
    })
});

module.exports = router;