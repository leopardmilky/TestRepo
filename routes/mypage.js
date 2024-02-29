const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isSignedIn } = require('../middleware');
const mypage = require('../controllers/mypage');


router.get('/', mypage.renderMypage);
router.get('/mypost-post', isSignedIn, catchAsync(mypage.renderMyPostPage));
router.get('/mypost-comment', isSignedIn, catchAsync(mypage.renderMyCommentPage));
router.get('/mylike-post', isSignedIn, catchAsync(mypage.renderMyLikePostPage));
router.get('/mylike-comment', isSignedIn, catchAsync(mypage.renderMyLikeCommentPage));
router.get('/myreport-post', isSignedIn, catchAsync(mypage.renderMyReportPostPage));
router.get('/myreport-comment', isSignedIn, catchAsync(mypage.renderMyReportCommentPage));
router.get('/mynote-received', isSignedIn, catchAsync(mypage.renderMyNoteReceivedPage));
router.get('/mynote-sent', isSignedIn, catchAsync(mypage.renderMyNoteSentPage));
router.get('/mynote-inbox', isSignedIn, catchAsync(mypage.renderMyNoteInboxPage));
router.get('/send-note', isSignedIn, catchAsync(mypage.renderNoteForm));
router.post('/send-note', isSignedIn, catchAsync(mypage.sendNote));
router.get('/view-note', isSignedIn, catchAsync( mypage.viewNote));
router.put('/save-note', isSignedIn, catchAsync(mypage.saveNote));
router.delete('/delete-note', isSignedIn, catchAsync(mypage.deleteNote));
router.get('/mynotification', isSignedIn, catchAsync(mypage.renderMyNotiPage));
router.post('/mynotification-more', isSignedIn, catchAsync(mypage.loadMyNotiMore));
router.post('/mynotification-unread', isSignedIn, catchAsync(mypage.checkMyNotiUnread));
router.post('/mynotification-check', isSignedIn, catchAsync(mypage.checkMyNoti));
router.post('/mynotification-allcheck', isSignedIn, catchAsync(mypage.checkAllMyNoti));
router.post('/nav-noti', isSignedIn, catchAsync(mypage.loadNavNoti));

module.exports = router;