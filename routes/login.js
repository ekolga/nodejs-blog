const { Router }           = require('express');
const router               = Router();
const crypto               = require('crypto');
const bcrypt               = require('bcryptjs');
const User                 = require('../models/user');
const nodemailer           = require('nodemailer');
const sendgrid             = require('nodemailer-sendgrid-transport');
const keys                 = require('../keys');
const registerEmailConfig  = require('../emails/registration');
const passResetEmailConfig = require('../emails/password-reset');
// End of imports

const trasporter = nodemailer.createTransport(sendgrid({
    auth: { api_key: keys.EMAIL_API_KEY }
}));

router.get('/', (req, res) => {
    res.render('auth/auth', {
        title: 'Log in or create a new account'
    });
});

router.route('/register')
    .get(async (req, res) => {
        res.render('auth/register-page', {
            title: `Registration`,
            registerError: req.flash('registerError')
        })
    })
    .post(async (req, res) => { // TODO: add symbols validation
        try {
            const { email, password, name } = req.body;
            const existedUser               = await User.findOne({ email })

            if (existedUser) {
                req.flash('registerError', 'User already exists.')
                res.redirect('/auth/register')
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                const user           = new User({
                    email,
                    password: hashedPassword,
                    name,
                    comments: []
                });

                await user.save();

                req.flash('success', 'Your account has been successfully created!')
                res.redirect('/auth/login');

                await trasporter.sendMail(registerEmailConfig(email));
            }
        } catch (error) {
            console.error(error);
        }
    });

router.route('/login')
    .get(async (req, res) => {
        res.render('auth/login-page', {
            title: 'Log in',
            error: req.flash('error'),
            success: req.flash('success')
        })
    })
    .post(async (req, res) => { // TODO: add symbols validation
        try {
            const { email, password } = req.body;
            const existedUser         = await User.findOne({ email });

            if (existedUser) {
                const arePasswordsTheSame = await bcrypt.compare(password, existedUser.password);

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
                    req.flash('error', 'Incorrect password')
                    res.redirect('/auth/login');
                }
            } else {
                req.flash('error', `User doesn't exist`)
                res.redirect('/auth/login');
            }
        } catch (error) {
            console.error(error);
        }
    });

router.route('/password-reset')
    .get(async (req, res) => {
        res.render('auth/password-reset', {
            title: 'Restore the password',
            error: req.flash('error')
        })
    })
    .post(async (req, res) => {
        try {
            const email = req.body.email;
            const user  = await User.findOne({ email });

            if (!user) {
                req.flash('error', `User doesn't exist`);
                return res.redirect('password-reset');
            }

            crypto.randomBytes(32, async (err, buf) => {
                if (err) {
                    req.flash('error', 'Something went wrong. Please, try again and contact me to fix that issue.');

                    return res.redirect('password-reset');
                }

                const token                     = buf.toString('hex');
                user.restoreToken               = token;
                user.restoreTokenExpirationDate = Date.now() + 60 * 60 * 1000;
                
                await user.save();
                req.flash('success', 'A letter with further instructions has been sent to your email.');
                res.redirect('login');
                await trasporter.sendMail(passResetEmailConfig(email, token));
            })
        } catch (error) {
            console.error(error);
        }
    });

router.route('/password-reset/:token')
    .get(async (req, res) => {
        if (!req.params.token) {
            return res.redirect('/auth/login');
        }

        try {
            const user = await User.findOne({
                restoreToken: req.params.token,
                restoreTokenExpirationDate: {$gt: Date.now()}
            });

            if (!user) {
                req.flash('error', `You can't access this link. Seems like your token has expired, try again.`);
                return res.redirect('/auth/login');
            }

            res.render('auth/password-reset-confirm', {
                title: 'Restore the password',
                error: req.flash('error'),
                userId: user._id,
                token: req.params.token
            });
        } catch (error) {
            console.error(error);
        }
    });

router.post('/password-reset-confirm', async (req, res) => {
        const user = await User.findOne({
            _id: req.body.userId,
            restoreToken: req.body.token,
            restoreTokenExpirationDate: {$gt: Date.now()}
        });

        if (!user) {
            req.flash('error', `An error occured. User hasn't been found. Seems like your token has expired, try again.`);
            return res.redirect('/auth/login');
        }

        if ((req.body.password.length < 6)) {
            req.flash('error', 'The password is too short. Please, create a better password');
            return res.redirect(`/auth/password-reset/${req.body.token}`);
        }

        user.password                   = await bcrypt.hash(req.body.password, 10);
        user.restoreToken               = undefined;
        user.restoreTokenExpirationDate = undefined;

        await user.save();

        req.flash('success', 'Your password has been successfully restored!');
        res.redirect('login');
    });

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
})

module.exports = router;