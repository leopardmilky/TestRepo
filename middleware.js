module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        // 로그인이 필요하다는 알림 메세지 필요...
        req.session.backTo = req.originalUrl
        return res.redirect('/signin');
    }
    next();
}
