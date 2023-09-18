const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { signOut } = require('../middleware');

const User = require('../models/user');
const passport = require('passport')



router.get('/signup', (req, res) => {
    res.render('users/signup');
});

router.post('/signup', catchAsync(async(req, res, next) => {
    try{
        const {email, nickname, password} = req.body;
        console.log(req.body)
        const user = new User({email, nickname});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {  // req.login()  => passport doc 참고
            if(err) return next(err);
            res.redirect('/index');
        });
    } catch (e) {
        res.redirect('/signup');
    }
}));

router.get('/signin', (req, res) => {
    const {redirectUrl} = req.query
    if(!req.session.backTo){    // navbar를 클릭해서 로그인 후 페이지 돌아가기 관련.
        req.session.backTo = redirectUrl
    }
    res.render('users/signin', {redirectUrl});
});

router.post('/signin', passport.authenticate('local', { failureFlash: true, failureRedirect: '/signin', keepSessionInfo: true }), (req, res) => {
    const redirectUrl = req.session.backTo || `/index`;
    delete req.session.backTo;
    res.redirect(redirectUrl);
});

router.get('/signout', (req, res) => {
    const redirectUrl = req.query.redirectUrl;
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        if(redirectUrl){
            return res.redirect(`${redirectUrl}`);
        }
        res.redirect(`/index`);
    });
});

module.exports = router;