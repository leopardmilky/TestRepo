const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isSignedIn, isAdmin } = require('../middleware');
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



router.get('/', isSignedIn, isAdmin, (req, res) => { // 미들웨어로 로그인, 어드민 권한 확인 필요.
    res.redirect('/admin/report-post');
});

router.get('/report-post', isSignedIn, isAdmin, catchAsync( async(req, res) => {
    const { role } = req.user;
    let { page } = req.query;
    if(!page) { page = 1; }

    const totalPost = await Board.find().countDocuments({});
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = myPagePostPaging(page, totalPost);
    const posts = await Board.aggregate([   // 신고수대로 정렬하기 위해 aggregate사용.
        {$lookup:{from:'users', localField:'author', foreignField:'_id', as:'authorData'}},
        {$addFields:{author:{$arrayElemAt:['$authorData', 0]},reportsCount:{$size:'$reports'}}},
        {$project:{_id:1, title:1 ,notice:1, createdAt:1, author:{_id:1, nickname:1}, comments:1, images:1, reports:1, reportsCount:1}},
        {$sort:{reportsCount:-1, createdAt:1}},
        { $skip: hidePost }, 
        { $limit: maxPost } 
    ]);
    
    res.render('admin/reportPost', { posts, startPage, endPage, totalPage, currentPage, maxPost, role, startDate:undefined, endDate:undefined, search:undefined });
}));

router.get('/report-post/search-date', isSignedIn, isAdmin, catchAsync( async(req, res) => {
    let {startDate, endDate, page} = req.query;
    const { role } = req.user;
    if(!page) { page = 1; }

    const query = {};
    if(startDate && endDate) {
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        query.createdAt = { $gte: startDateObj, $lte: endDateObj };
    }
    if(startDate && !endDate) {
        const startDateObj = new Date(startDate);
        query.createdAt = { $gte: startDateObj };
    }
    if(!startDate && endDate) {
        const endDateObj = new Date(endDate);
        query.createdAt = { $lte: endDateObj };
    }

    const totalPost = await Board.find(query).countDocuments({});
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = myPagePostPaging(page, totalPost);
    const posts = await Board.aggregate([
        {$match: query},
        {$lookup:{from:'users', localField:'author', foreignField:'_id', as:'authorData'}},
        {$addFields:{author:{$arrayElemAt:['$authorData', 0]},reportsCount:{$size:'$reports'}}},
        {$project:{_id:1, title:1 ,notice:1, createdAt:1, author:{_id:1, nickname:1}, comments:1, images:1, reports:1, reportsCount:1}},
        {$sort:{reportsCount:-1, createdAt:1}},
        {$skip: hidePost}, 
        {$limit: maxPost} 
    ]);

    return res.render('admin/reportPost', { posts, startPage, endPage, totalPage, currentPage, maxPost, role, startDate, endDate, search:undefined });
}));


router.get('/report-post/search', isSignedIn, isAdmin, catchAsync( async(req, res) => {
    let {selectOption, search, startDate, endDate, page} = req.query;
    const { role } = req.user;
    if(!page) { page = 1; }

    const query = {};
    let authorIds
    if(selectOption === 'title') {
        const regex = new RegExp(search, 'i'); // 'i' 플래그는 대소문자를 무시함.
        query.title = { $regex: regex };       // 와일드카드는 사용 못하고 정규식으로 사용가능.
    }
    if(selectOption === 'body') {
        const regex = new RegExp(search, 'i');
        query.mainText = { $regex: regex };
    }
    if(selectOption === 'author') {
        const author = search.trim()
        if(author){
            const regex = new RegExp(author, 'i');
            authorIds = await User.aggregate([{$match:{nickname:{$regex: regex }}}, {$project:{_id:1}}]);
            query.author = { $in: authorIds };
        }
    }

    if(startDate && endDate) {
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        query.createdAt = { $gte: startDateObj, $lte: endDateObj };
    }
    if(startDate && !endDate) {
        const startDateObj = new Date(startDate);
        query.createdAt = { $gte: startDateObj };
    }
    if(!startDate && endDate) {
        const endDateObj = new Date(endDate);
        query.createdAt = { $lte: endDateObj };
    }

    const totalPost = await Board.find(query).countDocuments({});
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = myPagePostPaging(page, totalPost);
    const posts = await Board.aggregate([
        {$match: query},
        {$lookup:{from:'users', localField:'author', foreignField:'_id', as:'authorData'}},
        {$addFields:{author:{$arrayElemAt:['$authorData', 0]},reportsCount:{$size:'$reports'}}},
        {$project:{_id:1, title:1 ,notice:1, createdAt:1, author:{_id:1, nickname:1}, comments:1, images:1, reports:1, reportsCount:1}},
        {$sort:{reportsCount:-1, createdAt:1}},
        {$skip: hidePost}, 
        {$limit: maxPost} 
    ]);

    return res.render('admin/reportPost', { posts, startPage, endPage, totalPage, currentPage, maxPost, role, startDate, endDate, search });
}));



router.get('/report-comment', isSignedIn, isAdmin, catchAsync( async(req, res) => {
    const { role } = req.user;
    let { page } = req.query;
    if(!page) { page = 1; }

    const totalPost = await Comment.find().countDocuments({});
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = myPageCommentPaging(page, totalPost);
    const comments = await Comment.aggregate([   // 신고수대로 정렬하기 위해 aggregate사용.
        {$lookup:{from:'users', localField:'author', foreignField:'_id', as:'authorData'}},
        {$lookup:{from:'boards', localField:'board', foreignField:'_id', as:'boardData'}},
        {$addFields:{author:{$arrayElemAt:['$authorData', 0]},reportsCount:{$size:'$reports'},board:{$arrayElemAt:['$boardData', 0]}}},
        {$project:{_id:1, body:1, createdAt:1, author:{_id:1, nickname:1}, board:{_id:1, title:1}, parentComment:1, reports:1, reportsCount:1, isDeleted:1}},
        {$sort:{reportsCount:-1, createdAt:1}},
        { $skip: hidePost },
        { $limit: maxPost }
    ]);

    res.render('admin/reportComment', { comments, startPage, endPage, totalPage, currentPage, maxPost, role, startDate:undefined, endDate:undefined, search:undefined });
}));

router.get('/report-comment/search-date', isSignedIn, isAdmin, catchAsync( async(req, res) => {
    let {startDate, endDate, page} = req.query;
    const { role } = req.user;
    if(!page) { page = 1; }

    const query = {};
    if(startDate && endDate) {
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        query.createdAt = { $gte: startDateObj, $lte: endDateObj };
    }
    if(startDate && !endDate) {
        const startDateObj = new Date(startDate);
        query.createdAt = { $gte: startDateObj };
    }
    if(!startDate && endDate) {
        const endDateObj = new Date(endDate);
        query.createdAt = { $lte: endDateObj };
    }

    const totalPost = await Comment.find(query).countDocuments({});
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = myPageCommentPaging(page, totalPost);
    const comments = await Comment.aggregate([
        {$match: query},
        {$lookup:{from:'users', localField:'author', foreignField:'_id', as:'authorData'}},
        {$lookup:{from:'boards', localField:'board', foreignField:'_id', as:'boardData'}},
        {$addFields:{author:{$arrayElemAt:['$authorData', 0]},reportsCount:{$size:'$reports'},board:{$arrayElemAt:['$boardData', 0]}}},
        {$project:{_id:1, body:1, createdAt:1, author:{_id:1, nickname:1}, board:{_id:1, title:1}, parentComment:1, reports:1, reportsCount:1, isDeleted:1}},
        {$sort:{reportsCount:-1, createdAt:1}},
        {$skip: hidePost}, 
        {$limit: maxPost} 
    ]);

    return res.render('admin/reportComment', { comments, startPage, endPage, totalPage, currentPage, maxPost, role, startDate, endDate, search:undefined });
}));


router.get('/report-comment/search', isSignedIn, isAdmin, catchAsync( async(req, res) => {
    let {selectOption, search, startDate, endDate, page} = req.query;
    const { role } = req.user;
    if(!page) { page = 1; }

    const query = {};
    let authorIds
    if(selectOption === 'body') {
        const regex = new RegExp(search, 'i');
        query.body = { $regex: regex };
    }
    if(selectOption === 'author') {
        const author = search.trim()
        if(author){
            const regex = new RegExp(author, 'i');
            authorIds = await User.aggregate([{$match:{nickname:{$regex: regex }}}, {$project:{_id:1}}]);
            query.author = { $in: authorIds };
        }
    }

    if(startDate && endDate) {
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        query.createdAt = { $gte: startDateObj, $lte: endDateObj };
    }
    if(startDate && !endDate) {
        const startDateObj = new Date(startDate);
        query.createdAt = { $gte: startDateObj };
    }
    if(!startDate && endDate) {
        const endDateObj = new Date(endDate);
        query.createdAt = { $lte: endDateObj };
    }
    const totalPost = await Comment.find(query).countDocuments({});
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = myPageCommentPaging(page, totalPost);
    const comments = await Comment.aggregate([
        {$match: query},
        {$lookup:{from:'users', localField:'author', foreignField:'_id', as:'authorData'}},
        {$lookup:{from:'boards', localField:'board', foreignField:'_id', as:'boardData'}},
        {$addFields:{author:{$arrayElemAt:['$authorData', 0]},reportsCount:{$size:'$reports'},board:{$arrayElemAt:['$boardData', 0]}}},
        {$project:{_id:1, body:1, createdAt:1, author:{_id:1, nickname:1}, board:{_id:1, title:1}, parentComment:1, reports:1, reportsCount:1, isDeleted:1}},
        {$sort:{reportsCount:-1, createdAt:1}},
        {$skip: hidePost}, 
        {$limit: maxPost} 
    ]);
    return res.render('admin/reportComment', { comments, startPage, endPage, totalPage, currentPage, maxPost, role, startDate, endDate, search });
}));

router.delete('/delete-post', isSignedIn, isAdmin, catchAsync( async(req, res) => {
    for(post of req.body) {
        await Board.findByIdAndDelete(post);
    }
    res.status(200).json('ok');
}));

router.delete('/delete-comment', isSignedIn, isAdmin, catchAsync( async(req, res) => {
    const commentArr = [...req.body];
    const comments = await Comment.find({_id:{$in:commentArr}}).populate('author').populate('board');
    for(comment of comments) {
        if(!comment._id.equals(comment.parentComment)){ // 대댓글일때

            await Comment.findByIdAndDelete(comment._id); // 해당 댓글도 찾아서 지움.
            await Board.findByIdAndUpdate(comment.board._id, {$pull: {comments: comment._id}}); // 게시물에 저장된 댓글목록 지우고.
            await Notification.deleteMany({recipient:comment.author._id}, {notificationType:'likeComment'}, {postId:comment.board._id}, {replyId:comment._id}); // 이 댓글로 받은 알림 다 삭제.
            await Notification.findOneAndDelete({sender:comment.author._id, notificationType:'commentReply',  postId:comment.board._id, commentId:comment.parentComment._id , replyId:comment._id}); // 부모댓글 작성자에게 간 알림(1개) 삭제.
            await LikeComment.deleteMany({likedComment: comment._id}, {relatedPost: comment.board._id}); // 좋아요 다 삭제.
            const countComments = await Comment.find({parentComment: comment.parentComment._id}).countDocuments();  // 그리고 parentComment필드의 갯수가
            if(countComments == 1) {    // 1개이면 더 이상 대댓글이 없는것임.
                const parentComment = await Comment.findById(comment.parentComment._id);
                if(parentComment.isDeleted) {
                    await Comment.findByIdAndDelete(comment.parentComment._id);
                } else {
                    parentComment.hasReply = false; // 대댓글이 없는 표시로 변경해 줘야함.
                    await parentComment.save();
                }
            }
        } else {
            await Notification.deleteMany({recipient:comment.author._id}, {notificationType:'likePost'}, {postId:comment.board._id}, {commentId:comment._id});   // 좋아요로 받은 알림 다 삭제.
            await Notification.deleteMany({recipient:comment.author._id}, {notificationType:'commentReply'}, {postId:comment.board._id}, {commentId:comment._id});   // 대댓글로 받은 알림 다 삭제.
            await Notification.findOneAndDelete({sender:comment.author._id, notificationType:'postComment',  postId:comment.board._id, commentId:comment.parentComment._id});  // 댓글작성시 게시물 글쓴이에게 간 알림 삭제.
            await LikeComment.deleteMany({likedComment: comment._id}, {relatedPost: comment.board._id}); // 좋아요 삭제.
        }

        if(comment.hasReply) {  // 어떤 댓글이 hasReply가 true이면 대댓글이 있는 부모댓글임.
            await Board.findByIdAndUpdate(comment.board._id, { $pull:{ comments: comment._id } });
            comment.isDeleted = true;
            await comment.save();
        } else {
            await Board.findByIdAndUpdate(comment.board._id, { $pull:{ comments: comment._id } });
            await Comment.findByIdAndDelete(comment._id);
        }

    }

    res.status(200).json('ok');
}));


module.exports = router;