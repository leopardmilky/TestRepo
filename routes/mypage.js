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
const Notification = require('../models/notification');
const User = require('../models/user');
// require('dotenv').config();
const { myPagePostPaging, myPageCommentPaging } = require('../paging');
const mongoose = require('mongoose');


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

    res.render('mypage/myReportComment', {comments, startPage, endPage, totalPage, currentPage, maxPost, role});
}));

router.get('/mynote-received', isSignedIn, catchAsync( async(req, res) => { // 받은 쪽지 페이지
    const {id, role} = req.user;
    const { page } = req.query;

    const totalPost = await Note.find({recipient: id, recipientSaved: false, recipientDeleted: false}).countDocuments({});
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = myPageCommentPaging(page, totalPost);
    const notes = await Note.find({recipient: id, recipientSaved: false, recipientDeleted: false}).sort({ sentAt: -1 }).skip(hidePost).limit(maxPost).populate('sender'); //.populate('reportedComment') 

    res.render('mypage/myNoteReceived', {notes, startPage, endPage, totalPage, currentPage, maxPost, role, me:id});
}));

router.get('/mynote-sent', isSignedIn, catchAsync( async(req, res) => { // 보낸 쪽지 페이지
    const {id, role} = req.user;
    const { page } = req.query;

    const totalPost = await Note.find({sender: id, senderSaved: false, senderDeleted: false}).countDocuments({});
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = myPageCommentPaging(page, totalPost);
    const notes = await Note.find({sender: id, senderSaved: false, senderDeleted: false}).sort({ sentAt: -1 }).skip(hidePost).limit(maxPost).populate('recipient'); //.populate('reportedComment') 

    res.render('mypage/myNoteSent', {notes, startPage, endPage, totalPage, currentPage, maxPost, role, me:id});
}));

router.get('/mynote-inbox', isSignedIn, catchAsync( async(req, res) => { // 쪽지 보관함 페이지
    const {id, nickname, role} = req.user;
    let { page } = req.query;
    if(!page) { page = 1; }

    const userId = new mongoose.Types.ObjectId(id);
    const totalPost = await Note.aggregate([
        {
            $match: {
                $or: [
                    { recipient: userId, recipientSaved: true, recipientDeleted: false},
                    { sender: userId, senderSaved: true, senderDeleted: false }
                ]
            }
        },
        {
            $group: {
                _id: '$_id',
                note: { $first: '$$ROOT' }, 
            }
        },
        { $replaceRoot: { newRoot: '$note' } }, 
    ]);

    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = myPageCommentPaging(page, totalPost.length);

    const notes = await Note.aggregate([
        {
            $lookup: {
              from: 'users', // User 모델의 컬렉션 이름
              localField: 'recipient',
              foreignField: '_id',
              as: 'recipientInfo'
            }
        },
        {
            $lookup: {
                from: 'users', // User 모델의 컬렉션 이름
                localField: 'sender',
                foreignField: '_id',
                as: 'senderInfo'
            }
        },
        { $unwind: '$recipientInfo' },
        { $unwind: '$senderInfo' },
        {
            $match: {
                $or: [
                    { recipient: userId, recipientSaved: true, recipientDeleted: false},
                    { sender: userId, senderSaved: true, senderDeleted: false }
                ]
            }
        },
        {
            $group: {
                _id: '$_id', // 중복을 확인할 필드를 선택
                note: { $first: '$$ROOT' } // 중복된 첫 번째 노트를 선택
            }
        },
        { $replaceRoot: { newRoot: '$note' } },  // 선택된 노트를 새로운 루트로 설정
        {
            $project: {
                _id: 1,
                read: 1,
                senderSaved: 1,
                recipientSaved: 1,
                senderDeleted: 1,
                recipientDeleted: 1,
                sentAt: 1,
                content: 1,
                'recipientInfo._id': 1,
                'recipientInfo.nickname': 1,
                'senderInfo._id': 1,
                'senderInfo.nickname': 1
            }
        },
        { $sort: { sentAt: -1 } }, 
        { $skip: hidePost }, 
        { $limit: maxPost } 
    ]);


    res.render('mypage/myNoteInbox', {notes, startPage, endPage, totalPage, currentPage, maxPost, role, me:nickname})
}));


router.get('/send-note', isSignedIn, catchAsync( async(req, res) => {   // 쪽지 쓰기
    res.render('mypage/sendNote')
}));

router.post('/send-note', isSignedIn, catchAsync( async(req, res) => {  // 쪽지 보내기
    const { recipient, content } = req.body;
    const { id } = req.user;

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

    if(id !== recipientId.id) { // 나 자신에게 쓴건 알림 안함.
        const newNotification = new Notification();
        newNotification.sender = id;
        newNotification.recipient = recipientId.id;
        newNotification.notificationType = 'note';
        newNotification.noteId = newNote.id;
        await newNotification.save();
    }

    res.json('ok');
}));
 
router.get('/view-note', isSignedIn, catchAsync( async(req, res) => {   // 쪽지 보기
    const {noteId, type} = req.query;
    const {id, nickname} = req.user;
    
    if(type === 'received') {
        const note = await Note.findOne({_id: noteId, recipient: id}).populate('sender').populate('recipient');
        if(note.recipientDeleted) {
            return res.render('error/viewNoteError');
        }
        const noti = await Notification.findOne({noteId: noteId});
        note.read = true;
        note.readAt = Date.now();
        noti.isRead = true;
        await note.save();
        await noti.save();
        return res.render('mypage/viewNote', {note, type});
    }

    if(type === 'sent') {
        const note = await Note.findOne({_id: noteId, sender: id}).populate('sender').populate('recipient');
        return res.render('mypage/viewNote', {note, type});
    }

    if(type === 'inbox') {
        const note = await Note.findOne({_id: noteId}).populate('sender').populate('recipient');
        if(note.recipient.nickname === nickname){
            note.read = true;
            note.readAt = Date.now();
            await note.save();
        }
        return res.render('mypage/viewNote', {note, type});
    }

}));

router.put('/save-note', isSignedIn, catchAsync( async(req, res) => {   // 쪽지 저장(보관함)
    
    for(noteId of req.body) {
        const note = await Note.findById(noteId).populate('sender').populate('recipient');
        if(note.recipient.nickname === req.user.nickname) {
            note.recipientSaved = true;
        }
        if(note.sender.nickname === req.user.nickname) {
            note.senderSaved = true;
        }
        await note.save();
    }
    res.json('ok')
}));

router.delete('/delete-note', isSignedIn, catchAsync( async(req, res) => {  // 쪽지 삭제.

    for(noteId of req.body) {
        const note = await Note.findById(noteId).populate('sender').populate('recipient');
        if(note.recipient.nickname === req.user.nickname) { // 받은 쪽지 삭제할때
            note.recipientDeleted = true;
            await Notification.findOneAndDelete({recipient: req.user.id, noteId: noteId});  // 받은 알림도 삭제.
        }
        if(note.sender.nickname === req.user.nickname) { // 보낸 쪽지 삭제할때
            note.senderDeleted = true;
        }
        await note.save();
    }
    res.json('ok');
}));

router.get('/mynotification', isSignedIn, catchAsync( async(req, res) => {  // 알림 페이지
    const {id, role} = req.user;
    const notis = await Notification.find({recipient:id}).sort({createdAt: -1}).limit(10).populate('commentId').populate('noteId').populate('sender').populate('replyId').populate('postId');
    res.render('mypage/myNotification', {notis, role});
}));

router.get('/mynotification-more', isSignedIn, catchAsync( async(req, res) => { // 알림 페이지 무한스크롤 
    const {id} = req.user;
    const {skip} = req.query;
    const notis = await Notification.find({recipient:id}).sort({createdAt: -1}).skip(skip).limit(10).populate('commentId').populate('noteId').populate('sender').populate('replyId').populate('postId');
    res.json(notis);
}));

router.get('/mynotification-noread', isSignedIn, catchAsync( async(req, res) => {   // 안읽은 알림이 있는지 체크
    const {id} = req.user;
    const notis = await Notification.findOne({recipient:id, isRead:false});
    res.json(notis);
}));

router.post('/mynotification-check', isSignedIn, catchAsync( async(req, res) => {   // 알림 페이지 및 nav알림 체크
    const {notiId} = req.body;
    const noti = await Notification.findOne({_id: notiId, recipient: req.user.id});
    if(noti) {
        noti.isRead = true;
        await noti.save();
        return res.status(200).json('ok');
    }
    res.status(500).json('Server Error...0_0');
}));

router.get('/mynotification-allcheck', isSignedIn, catchAsync( async(req, res) => {   // 모든 알림 읽음 표시
    const {id} = req.user;
    await Notification.updateMany({recipient:id}, {$set:{isRead:true}});
    res.status(200).json();
}));

router.get('/nav-noti', isSignedIn, catchAsync( async(req, res) => {    // navbar알림
    const {id} = req.user;
    const notis = await Notification.find({recipient:id, isRead: false}).sort({createdAt: -1}).populate('commentId').populate('noteId').populate('sender').populate('replyId').populate('postId');
    res.json(notis);
}));

module.exports = router;