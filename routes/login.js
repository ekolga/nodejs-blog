const { Router } = require('express');
const router = Router();
const User = require('../models/user');

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
        try {
            const { email, password, name } = req.body;
            const existedUser               = await User.findOne({ email })

            if (existedUser) {
                console.log('User already exists.');
                res.redirect('/')
            } else {
                const user = new User({
                    email,
                    password,
                    name,
                    comments: []
                });

                await user.save();

                res.redirect('/auth/login');
            }
        } catch (error) {
            console.error(error);
        }
    })

router.route('/login')
    .get(async (req, res) => {
        res.render('auth/login-page', {
            title: `Login`
        })
    })
    .post(async (req, res) => {
        try {
            const { email, password } = req.body;
            const existedUser         = await User.findOne({ email });

            if (existedUser) {
                const arePasswordsTheSame = password === existedUser.password;

                if (arePasswordsTheSame) {
                    // Session cookie creation process
                    req.session.user       = existedUser;
                    req.session.isLoggedIn = true;

                    req.session.save(err => {
                        if (err) throw err;

                        console.log('Logged in!');
                        res.redirect('/');
                    });
                } else {
                    console.log('Incorrect password');
                    res.redirect('/auth/login');
                }
            } else {
                console.log('User does not exist');
                res.redirect('/auth/register');
            }
        } catch (error) {
            console.error(error);
        }
    })

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
})

module.exports = router;