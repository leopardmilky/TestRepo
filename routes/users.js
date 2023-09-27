const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { validatePassword } = require('../middleware');

const User = require('../models/user');
const passport = require('passport')






router.get('/signup', (req, res) => {
    res.render('users/signup');
});

router.get('/signup/check', catchAsync( async(req, res) => { 
    const {email, nickname} = req.query;
    if(email){
        const user = await User.find({email: email}); // user가 []인데 Boolean이 왜 true가 나오지?, query객체의 키값을(Object.keys()) 사용해서 한 줄로 하려고 했지만 변수를 인식하지 못함.
        if(user.length == 0){
            return res.send("ok");
        }
    }
    if(nickname){
        const user = await User.find({nickname: nickname}); 
        if(user.length == 0){
            return res.send("ok");
        }
    }
    res.send("duplicated")
}));

router.post('/signup', catchAsync( async(req, res, next) => {
    try{
        const {email, nickname, password} = req.body;
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

router.get('/currentUser', (req, res) => {
    res.json(req.user.nickname);
});

module.exports = router;