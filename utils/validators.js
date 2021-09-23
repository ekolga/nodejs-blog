const { body } = require('express-validator');
const User     = require('../models/user');
const helper   = require('./helper');
const bcrypt   = require('bcryptjs');

exports.registerValidator = [
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
    body('email', `Email must contain numbers, symbols and digits in latin alphabet. Also don't forget to add your domain symbols. For example, email@gmail.com`).isEmail(),
    body('email', `Email cannot be less than 3 symbols and more than 70`).isLength({ max: 70, min: 3 }),
    body('email').custom(async (value, { req }) => {
        try {
            const existedUser = await User.findOne({ email: value });
            
            if (!existedUser) {
                return Promise.reject(`User doesn't exist`)
            }

            if (!existedUser.isActivated) {
                helper.sendMailWithNewRegistrationToken(existedUser);

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
            const existedUser         = await User.findOne({ email: req.body.email });
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