const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isSignedIn } = require('../middleware');
const Board = require('../models/board');
const Comment = require('../models/comment');
const LikeComment = require('../models/likeComment');
const LikePost = require('../models/likePost');
const ReportComment = require('../models/reportComment');
const ReportPost = require('../models/reportPost');
const Note = require('../models/note');
const User = require('../models/user');
require('dotenv').config();
const { myPagePostPaging, myPageCommentPaging } = require('../paging');


router.get('/', (req, res) => {
    res.redirect('/mypage/mypost-post');
});

router.get('/mypost-post', isSignedIn, catchAsync( async(req, res) => {
    const { id, role } = req.user;
    const { page } = req.query;

    const totalPost = await Board.find({author:id}).countDocuments({});
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = myPagePostPaging(page, totalPost);
    const posts = await Board.find({author:id}).sort({ notice: -1, createdAt: -1 }).skip(hidePost).limit(maxPost).populate('author');

    res.render('mypage/myPostPost', {posts, startPage, endPage, totalPage, currentPage, maxPost, role});
}));

router.get('/mypost-comment', isSignedIn, catchAsync( async(req, res) => {
    const { id, role } = req.user;
    const { page } = req.query;

    const totalPost = await Comment.find({author:id}).countDocuments({});
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = myPageCommentPaging(page, totalPost);
    const comments = await Comment.find({author:id, isDeleted: false}).sort({ createdAt: -1 }).skip(hidePost).limit(maxPost).populate('author').populate('board');

    res.render('mypage/myPostComment', {comments, startPage, endPage, totalPage, currentPage, maxPost, role});
}));

router.get('/mylike-post', isSignedIn, catchAsync( async(req, res) => {
    const { id, role } = req.user;
    const { page } = req.query;

    const totalPost = await LikePost.find({user: id}).countDocuments({});
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = myPagePostPaging(page, totalPost);
    const posts = await LikePost.find({user: id}).sort({ createdAt: -1 }).skip(hidePost).limit(maxPost).populate('likedPost'); //.populate('reportedComment') 

    res.render('mypage/myLikePost', {posts, startPage, endPage, totalPage, currentPage, maxPost, role})
}));

router.get('/mylike-comment', isSignedIn, catchAsync( async(req, res) => {
    const { id, role } = req.user;
    const { page } = req.query;

    const totalPost = await LikeComment.find({user: id}).countDocuments({});
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = myPageCommentPaging(page, totalPost);
    const comments = await LikeComment.find({user: id}).sort({ createdAt: -1 }).skip(hidePost).limit(maxPost).populate({path: 'likedComment', populate: {path: 'board'}});

    res.render('mypage/myLikeComment', {comments, startPage, endPage, totalPage, currentPage, maxPost, role});
}));

router.get('/myreport-post', isSignedIn, catchAsync( async(req, res) => {
    const { id, role } = req.user;
    const { page } = req.query;

    const totalPost = await ReportPost.find({user: id}).countDocuments({});
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = myPagePostPaging(page, totalPost);
    const posts = await ReportPost.find({user: id}).sort({ createdAt: -1 }).skip(hidePost).limit(maxPost).populate('reportedPost'); //.populate('reportedComment') 

    res.render('mypage/myReportPost', {posts, startPage, endPage, totalPage, currentPage, maxPost, role});
}));

router.get('/myreport-comment', isSignedIn, catchAsync( async(req, res) => {
    const { id, role } = req.user;
    const { page } = req.query;

    const totalPost = await ReportComment.find({user: id}).countDocuments({});
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = myPageCommentPaging(page, totalPost);
    const comments = await ReportComment.find({user: id}).sort({ createdAt: -1 }).skip(hidePost).limit(maxPost).populate({path: 'reportedComment', populate: {path: 'board'}}); //.populate('reportedComment') 

    res.render('mypage/myReportComment', {comments, startPage, endPage, totalPage, currentPage, maxPost, role})
}));

router.get('/mynote-received', catchAsync( async(req, res) => {
    const {id, role} = req.user;
    const { page } = req.query;

    const totalPost = await Note.find({recipient: id}).countDocuments({});
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = myPageCommentPaging(page, totalPost);
    const notes = await Note.find({recipient: id}).sort({ sentAt: -1 }).skip(hidePost).limit(maxPost).populate('sender'); //.populate('reportedComment') 
    console.log("notes: ", notes)
    res.render('mypage/myNoteReceived', {notes, startPage, endPage, totalPage, currentPage, maxPost, role});
}));

router.get('/mynote-sent', catchAsync( async(req, res) => {
    const {id, role} = req.user;
    const { page } = req.query;

    const totalPost = await Note.find({sender: id}).countDocuments({});
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = myPageCommentPaging(page, totalPost);
    const notes = await Note.find({sender: id}).sort({ sentAt: -1 }).skip(hidePost).limit(maxPost).populate('recipient'); //.populate('reportedComment') 

    res.render('mypage/myNoteSent', {notes, startPage, endPage, totalPage, currentPage, maxPost, role});
}));

router.get('/mynote-inbox', catchAsync( async(req, res) => {
    const {id, role} = req.user;
    const { page } = req.query;

    const totalPost = await Note.find({recipient: id}).countDocuments({});
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = myPageCommentPaging(page, totalPost);
    const comments = await Note.find({recipient: id}).sort({ sentAt: -1 }).skip(hidePost).limit(maxPost).populate('sender.nickname'); //.populate('reportedComment') 


    res.render('mypage/myNoteInbox', {comments, startPage, endPage, totalPage, currentPage, maxPost, role})
}));


router.get('/send-note', catchAsync( async(req, res) => {
    res.render('mypage/sendNote')
}));

router.post('/send-note', catchAsync( async(req, res) => {
    const {recipient, content} = req.body;
    const {id} = req.user;

    if(!recipient.trim() || !content.trim()) {
        return res.json('nk');
    }

    const recipientId = await User.findOne({nickname: recipient});
    if(!recipientId) {
        return res.json('nk2');
    }

    const newNote = new Note();
    newNote.recipient = recipientId.id;
    newNote.content = content;
    newNote.sender = id;
    await newNote.save();

    res.json('ok');
}));

router.get('/view-note', catchAsync( async(req, res) => {
    res.render('mypage/viewNote');
}));


module.exports = router;