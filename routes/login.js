const {Router} = require('express');
const router   = Router();
const User     = require('../models/user');

router.route('/register')
.get(async (req, res) => {
    res.render('register-page', {
        title: `Registration`
    })
})
.post(async (req, res) => {
    const existedUser = await User.findOne({
        email: req.body.email
    })

    if (existedUser) {
        console.log('User already exists.');

        res.end('User already exists.')
    }

    const user = new User({
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
    });

    user.save();

    res.redirect('/');
})

router.route('/signin')
.get(async (req, res) => {
    res.render('login-page', {
        title: `Login`
    })
})
.post(async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
        password: req.body.password
    })

    // Session cookie creation process
    console.log('Logged in!')
    res.redirect('/');
})

module.exports = router;