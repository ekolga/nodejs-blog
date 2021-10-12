const { body, param } = require('express-validator');
const User            = require('../models/user');
const emailHelper     = require('./email-helper');
const bcrypt          = require('bcryptjs');

exports.registerValidator = [
    body('email').normalizeEmail(),
    body('email', `Email must contain numbers, symbols and digits in latin alphabet. Also don't forget to add your domain symbols. For example, email@gmail.com`).isEmail(),
    body('email', `Email cannot be less than 3 symbols and more than 70`).isLength({ max: 70, min: 3 }),
    body('email').custom(async (value, { req }) => {
        try {
            const existedUser = await User.findOne({ email: value });
            
            if (existedUser) {
                return Promise.reject('User already exists.')
            }
        } catch (error) {
            console.error(error);
        }
    }),
    body('password', `Password must contain numbers, symbols and digits in latin alphabet`).isAlphanumeric('en-US'),
    body('password', `Password must be at least 6 symbols length`).isLength({ min: 6}),
    body('password', `Password must be less than 70 symbols`).isLength({ max: 70}),
    body('name', `Name must be at least 2 symbols length`).isLength({ min: 2}),
    body('name', `Name must be less than 70 symbols`).isLength({ max: 70}),
];

exports.loginValidator = [
    body('email').normalizeEmail(),
    body('email', `Email must contain numbers, symbols and digits in latin alphabet. Also don't forget to add your domain symbols. For example, email@gmail.com`).isEmail(),
    body('email', `Email cannot be less than 3 symbols and more than 70`).isLength({ max: 70, min: 3 }),
    body('email').custom(async (value, { req }) => {
        try {
            const existedUser = await User.findOne({ email: value });
            
            if (!existedUser) {
                return Promise.reject(`User doesn't exist`)
            }

            if (!existedUser.isActivated) {
                const token                   = emailHelper.getToken();
                existedUser.registrationToken = token;
            
                await emailHelper.sendRegistrationEmail(existedUser.email, token);
                await existedUser.save();

                return Promise.reject(`User isn't activated yet. Please, check your email, we've resent the activation code.`)
            }
        } catch (error) {
            console.error(error);
        }
    }),
    body('password', `Password must contain numbers, symbols and digits in latin alphabet`).isAlphanumeric('en-US'),
    body('password', `Password must be at least 6 symbols length`).isLength({ min: 6}),
    body('password', `Password must be less than 70 symbols`).isLength({ max: 70}),
    body('password').custom(async (value, { req }) => {
        try {
            const existedUser = await User.findOne({ email: req.body.email });

            if (!existedUser) {
                return;
            }

            const arePasswordsTheSame = await bcrypt.compare(value, existedUser.password);
    
            if (!arePasswordsTheSame) {
                return Promise.reject('Incorrect password');
            }
        } catch (error) {
            console.error(error);
        }
    })
];

exports.resetPasswordValidator = [
    body('password', `Password must contain numbers, symbols and digits in latin alphabet`).isAlphanumeric('en-US'),
    body('password', `Password must be at least 6 symbols length`).isLength({ min: 6}),
    body('password', `Password must be less than 70 symbols`).isLength({ max: 70}),
    body('userId').custom(async (value, { req }) => {
        try {
            const user = await User.findOne({
                _id: value,
                restoreToken: req.body.token,
                restoreTokenExpirationDate: {$gt: Date.now()}
            });
    
            if (!user) {
                return Promise.reject(`An error occured. User hasn't been found. Seems like your token has expired, try again.`)
            }
        } catch (error) {
            console.error(error);

            return Promise.reject(`An error occured. User hasn't been found. Seems like you're modifying the HMTL-form. Reload the page and try again.`)
        }
    })
];

exports.userValidatorByEmail = [
    body('email').normalizeEmail(),
    body('email').custom(async (value, { req }) => {
        try {
            if (!value) {
                return Promise.reject('Please enter your email')
            }

            const user = await User.findOne({ email: value });

            if (!user) {
                return Promise.reject(`User doesn't exist`);
            }
        } catch (error) {
            console.error(error);
        }
    })
];

exports.userValidatorByRestoreToken = [
    param('token').custom(async (value, { req }) => {
        try {
            if (!value) {
                return Promise.reject('There is nothing to see')
            }
    
            const user = await User.findOne({
                restoreToken: value,
                restoreTokenExpirationDate: {$gt: Date.now()}
            });
    
            if (!user) {
                return Promise.reject(`You can't access this link. Seems like your token has expired or already used, try again.`);
            }
        } catch (error) {
            console.error(error);
        }
    })
];

exports.userValidatorByRegisterToken = [
    param('token').custom(async (value, { req }) => {
        try {
            if (!value) {
                return Promise.reject('There is nothing to see')
            }
    
            const user = await User.findOne({
                registrationToken: value
            });
    
            if (!user) {
                return Promise.reject(`You can't access this link. Seems like your token has expired or already used, try again.`);
            }
        } catch (error) {
            console.error(error);
        }
    })
];

exports.commentValidator = [
    body('email').normalizeEmail(),
    body('email').custom(async (value, { req }) => {
        try {
            const user = await User.findOne({ email: value });
            
            if (!user) {
                return Promise.reject('There is some problems with your account. Please contact me to fix that issue')
            }
        } catch (error) {
            console.error(error);
        }
    }),
    body('text').isLength({ min: 5, max: 1000 }).withMessage('Your comment must be from 5 to 1000 symbols length').trim().escape(),
];