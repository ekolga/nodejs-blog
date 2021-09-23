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
const validators           = require('../utils/validators');
const { validationResult } = require('express-validator');
// End of imports

/**
 * Email sender
 */
const trasporter = nodemailer.createTransport(sendgrid({
    auth: { api_key: keys.EMAIL_API_KEY }
}));

/**
 * Main auth page
 */
router.get('/', (req, res) => {
    res.render('auth/auth', {
        title: 'Log in or create a new account'
    });
});

/**
 * User's registration process. Generates access-token and sends it to email
 */
router.route('/register')
    .get(async (req, res) => {
        res.render('auth/register-page', {
            title: `Registration`,
            error: req.flash('error'),
            success: req.flash('success')
        })
    })
    .post(validators.registerValidator, async (req, res) => {
        try {
            const { email, password, name } = req.body;
            const validationErrors          = validationResult(req).errors;

            if (validationErrors.length) {
                validationErrors.forEach(error => {
                    req.flash('error', error.msg);
                });

                return res.status(422).redirect('/auth/register');
            }

            crypto.randomBytes(32, async (err, buf) => {
                if (err) {
                    req.flash('error', 'Something went wrong. Please, try again and contact me to fix that issue.');

                    return res.redirect('register');
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                const token          = buf.toString('hex');
                const user           = new User({
                    email,
                    password: hashedPassword,
                    name,
                    comments: [],
                    registrationToken: token
                });

                await user.save();

                req.flash('success', 'Your account has been successfully created! However, you cannot log in yet. Check your email to finish the registration process.')
                res.redirect('login');

                await trasporter.sendMail(registerEmailConfig(email, token));
            })
        } catch (error) {
            console.error(error);
        }
    });

/**
 * User's register confirmation
 */
router.route('/register/confirm/:token')
    .get(validators.userValidatorByRegisterToken, async (req, res) => {
        // if (!req.params.token) {
        //     return res.redirect('/auth/login'); // Redirect doesn't work
        // }

        const validationErrors = validationResult(req).errors;

        if (validationErrors.length) {
            validationErrors.forEach(error => {
                req.flash('error', error.msg);
            });

            return res.status(422).redirect('/auth/login');
        }

        try {
            const user = await User.findOne({
                registrationToken: req.params.token,
                isActivated: false
            });

            // if (!user) {
            //     req.flash('error', `You can't access this link. Seems like you're already activated.`);

            //     return res.redirect('/auth/login');
            // }

            user.registrationToken = undefined;
            user.isActivated       = true;

            await user.save();

            req.flash('success', 'User has been successfully activated!');
            res.redirect('/auth/login');
        } catch (error) {
            console.error(error);
        }
    });

/**
 * User's authorization
 */
router.route('/login')
    .get(async (req, res) => {
        res.render('auth/login-page', {
            title: 'Log in',
            error: req.flash('error'),
            success: req.flash('success')
        })
    })
    .post(validators.loginValidator, async (req, res) => {
        try {
            const { email }        = req.body;
            const existedUser      = await User.findOne({ email });
            const validationErrors = validationResult(req).errors;

            if (validationErrors.length) {
                validationErrors.forEach(error => {
                    req.flash('error', error.msg);
                });

                return res.status(422).redirect('/auth/login');
            }

            // Session cookie creation process
            req.session.user       = existedUser;
            req.session.isLoggedIn = true;
            
            req.session.save(err => {
                if (err) throw err;
                
                req.flash('success', 'Logged in!');
                res.redirect('/');
            });
        } catch (error) {
            console.error(error);
        }
    });

/**
 * Starts user's password reset process. Generates restore token and sends it to user's email
 */
router.route('/password-reset')
    .get(async (req, res) => {
        res.render('auth/password-reset', {
            title: 'Restore the password',
            error: req.flash('error')
        })
    })
    .post(validators.userValidatorByEmail, async (req, res) => {
        try {
            const email            = req.body.email;
            const user             = await User.findOne({ email });
            const validationErrors = validationResult(req).errors;

            if (validationErrors.length) {
                validationErrors.forEach(error => {
                    req.flash('error', error.msg);
                });

                return res.status(422).redirect('password-reset');
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

/**
 * Checks if user has access to reset his password
 */
router.route('/password-reset/:token')
    .get(validators.userValidatorByRestoreToken, async (req, res) => {
        const validationErrors = validationResult(req).errors;

        if (validationErrors.length) {
            validationErrors.forEach(error => {
                req.flash('error', error.msg);
            });

            return res.status(422).redirect('/auth/login');
        }

        try {
            const user = await User.findOne({
                restoreToken: req.params.token,
                restoreTokenExpirationDate: {$gt: Date.now()}
            });

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

/**
 * Handles user's password reset finish process
 */
router.post('/password-reset-confirm', validators.resetPasswordValidator, async (req, res) => {
        const validationErrors = validationResult(req).errors;
        
        if (validationErrors.length) {
            validationErrors.forEach(error => {
                req.flash('error', error.msg);
            });
            
            return res.status(422).redirect(`/auth/password-reset/${req.body.token}`);
        }

        const user                      = await User.findOne({
            _id: req.body.userId,
            restoreToken: req.body.token,
            restoreTokenExpirationDate: {$gt: Date.now()}
        });
        user.password                   = await bcrypt.hash(req.body.password, 10);
        user.restoreToken               = undefined;
        user.restoreTokenExpirationDate = undefined;

        await user.save();

        req.flash('success', 'Your password has been successfully restored!');
        res.redirect('login');
    });

/**
 * Destroys user's session
 */
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router;