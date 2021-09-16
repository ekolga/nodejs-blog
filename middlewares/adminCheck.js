module.exports = function (req, res, next) {
    try {
        if (!req.session.user) {
            return res.redirect('/403nouser');
        }

        if (!req.session.user.isAdmin) {
            return res.redirect('/403noadmin');
        }
    } catch (error) {
        console.error(error);
    }

    next();
}