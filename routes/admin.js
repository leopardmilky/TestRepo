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

    const dateQuery = {};
    if(startDate && endDate) {
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        dateQuery.createdAt = { $gte: startDateObj, $lte: endDateObj };
    }
    if(startDate && !endDate) {
        const startDateObj = new Date(startDate);
        dateQuery.createdAt = { $gte: startDateObj };
    }
    if(!startDate && endDate) {
        const endDateObj = new Date(endDate);
        dateQuery.createdAt = { $lte: endDateObj };
    }

    const totalPost = await Board.find(dateQuery).countDocuments({});
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = myPagePostPaging(page, totalPost);
    const posts = await Board.aggregate([
        {$match: dateQuery},
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

    const selectOptionQuery = {};
    let authorIds
    if(selectOption === 'title') {
        const regex = new RegExp(search, 'i'); // 'i' 플래그는 대소문자를 무시함.
        selectOptionQuery.title = {$regex: regex };     // 와일드카드는 사용 못하고 정규식으로 사용가능.
    }
    if(selectOption === 'body') {
        const regex = new RegExp(search, 'i');
        selectOptionQuery.mainText = {$regex: regex };
    }
    if(selectOption === 'author') {
        const regex = new RegExp(search, 'i');
        authorIds = await User.aggregate([{$match:{nickname:{$regex: regex }}}, {$project:{_id:1}}]);
        selectOptionQuery.author = {$in: authorIds};
    }

    const dateQuery = {};
    if(startDate && endDate) {
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        dateQuery.createdAt = { $gte: startDateObj, $lte: endDateObj };
    }
    if(startDate && !endDate) {
        const startDateObj = new Date(startDate);
        dateQuery.createdAt = { $gte: startDateObj };
    }
    if(!startDate && endDate) {
        const endDateObj = new Date(endDate);
        dateQuery.createdAt = { $lte: endDateObj };
    }

    const totalPost = await Board.find(selectOptionQuery, dateQuery).countDocuments({});
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = myPagePostPaging(page, totalPost);
    const posts = await Board.aggregate([
        {$match: dateQuery},
        {$match: selectOptionQuery},
        {$lookup:{from:'users', localField:'author', foreignField:'_id', as:'authorData'}},
        {$addFields:{author:{$arrayElemAt:['$authorData', 0]},reportsCount:{$size:'$reports'}}},
        {$project:{_id:1, title:1 ,notice:1, createdAt:1, author:{_id:1, nickname:1}, comments:1, images:1, reports:1, reportsCount:1}},
        {$sort:{reportsCount:-1, createdAt:1}},
        {$skip: hidePost}, 
        {$limit: maxPost} 
    ]);

    return res.render('admin/reportPost', { posts, startPage, endPage, totalPage, currentPage, maxPost, role, startDate, endDate, search });
}));














router.delete('/delete-post', isSignedIn, isAdmin, catchAsync( async(req, res) => {
    for(post of req.body) {
        await Board.findByIdAndDelete(post);
    }
    res.status(200).json('ok');
}));







module.exports = router;