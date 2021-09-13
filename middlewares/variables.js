module.exports = function (req, res, next) {
    res.locals.isLoggedIn = req.session.isLoggedIn;

    next();
}