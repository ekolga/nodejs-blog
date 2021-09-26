const { Router } = require('express');
const router     = Router();

router.get('/', (req, res) => {
    res.render('contact', {
        title: "Contact me",
        user: req.session.user,
        error: req.flash('error'),
        success: req.flash('success'),
    })
})

module.exports = router;