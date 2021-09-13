const {Router} = require('express');
const router   = Router();
const User     = require('../models/user');

router.get('/', (req, res) => {
    res.render('auth/auth', {
        title: 'Log in or create a new account'
    });
})

router.route('/register')
.get(async (req, res) => {
    res.render('auth/register-page', {
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

router.route('/login')
.get(async (req, res) => {
    res.render('auth/login-page', {
        title: `Login`
    })
})
.post(async (req, res) => {
    // const user = await User.findOne({
    //     email: req.body.email,
    //     password: req.body.password
    // })
    const user = await User.findById('6136cb142fa96ec8e16a120a');

    // Session cookie creation process
    req.session.user       = user;
    req.session.isLoggedIn = true;
    req.session.save(err => {
        if (err) throw err;

        console.log('Logged in!');
        res.redirect('/');
    });
})

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
})

module.exports = router;