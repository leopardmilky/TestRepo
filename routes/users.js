const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport')




router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async(req, res, next) => {
    try{
        const {email, nickname, password} = req.body;
        console.log(req.body)
        const user = new User({email, nickname});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) return next(err);
            res.redirect('/index');
        });
    } catch (e) {
        res.redirect('/register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), (req, res) => {
    // const redirectUrl = req.session.returnTo || '/index';
    // console.log(redirectUrl)
    // delete req.session.returnTo;
    // req.flash('success', 'hello~~');
    res.redirect('/index');
});


module.exports = router;