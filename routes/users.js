const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isSignedIn, notSignedIn, verifyUser, validateNickname, validatePassword, withdrawPermission, withdrawVerifycodePermission, deleteUserPermission, isWithdrawn } = require('../middleware');
const passport = require('passport');
const users = require('../controllers/users');


router.get('/signup2', notSignedIn, users.renderSignUpPage);
router.get('/signup/check', catchAsync(users.checkEmailNickname));
router.get('/signup/verifyemail', catchAsync(users.sendSignUpCode));
router.post('/signup/verifycode', catchAsync(users.submitSignUpCode));
router.post('/signup', catchAsync(users.signUp));
router.get('/forgotpwd', notSignedIn, users.renderForgotPwdPage);
router.post('/forgotpwd/check', catchAsync(users.checkEmail));
router.post('/forgotpwd/temppwd', catchAsync(users.sendTempPwd));
router.get('/userinfo', isSignedIn, users.renderCheckUserPage);
router.post('/modifyUserInfo', isSignedIn, verifyUser, catchAsync(users.renderModifyUserInfoPage));
router.put('/saveUserInfo', isSignedIn, validateNickname, validatePassword, catchAsync(users.modifyUserInfo));
router.get('/withdraw', isSignedIn, withdrawPermission, catchAsync(users.renderWithdrawPage));
router.post('/withdraw/verifycode', isSignedIn, withdrawVerifycodePermission, catchAsync(users.submitWithdrawalCode));
router.get('/withdraw/verifycode/deleteUser', isSignedIn, deleteUserPermission, catchAsync(users.withdrawUser));
router.get('/signin', users.renserSignInPage);
router.post('/signin', isWithdrawn, passport.authenticate('local', { failureFlash: true, failureRedirect: '/signin', keepSessionInfo: true }), users.signIn);
router.get('/signout', users.signOut);

router.get('/modifyUserInfo', (req, res) => {
    //페이지를 잘못 찾았을 때 표시할 페이지도 만들어야 할듯함.
    res.redirect('/index');
});

router.get('/currentUser', (req, res) => {
    res.json(req.user.nickname);
});

module.exports = router;