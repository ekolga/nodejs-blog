module.exports = function (req, res, next) {
    res.locals.isLoggedIn = req.session.isLoggedIn; // Writes info about session taken from the 'session' object
    res.locals.csrf       = req.csrfToken(); // Writes csrf token

    try {
        if (req.session.user) {
            res.locals.isAdmin = req.session.user.isAdmin; // Writes info if it's admin or not
        }
    } catch (error) {
        console.error(error);
    }

    next();
}