const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isSignedIn, isSignedIn2, validateBoard, isAuthor } = require('../middleware');
const Board = require('../models/board');
const Comment = require('../models/comment');
const ReportPost = require('../models/reportPost');
const LikePost = require('../models/likePost');
const Notification = require('../models/notification');
const { boardPaging, commentPaging } = require('../paging');
const multer = require('multer');
const  { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require( '@aws-sdk/client-s3' );
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require('crypto');
const sharp = require('sharp');
require('dotenv').config();
const mongoose = require('mongoose');


const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_S3_REGION
})
const storage = multer.memoryStorage();
const upload = multer({storage: storage});
const randomImageName = (bytes = 16) => crypto.randomBytes(bytes).toString('hex');

router.get('/', catchAsync( async(req, res) => {
    let { page } = req.query;
    if(!page) { page = 1; }
    try {
        const totalPost = await Board.countDocuments({});
        let { startPage, endPage, hidePost, maxPost, totalPage, currentPage, maxPage } = boardPaging(page, totalPost);
        const board = await Board.find().sort({ notice: -1, createdAt: -1 }).skip(hidePost).limit(maxPost).populate('author'); // .populate({path: 'comments', populate: {path: 'nestedComments'}})

        res.render("board/index", { contents: board, currentPage, startPage, endPage, maxPage, totalPage });
    } catch (error) {
        res.render("board/index", { contents: board });
    }
}));

router.get('/new', isSignedIn, (req, res) => {
    res.render('board/new');
});

router.get('/new2', isSignedIn, (req, res) => {
    const {role} = req.user;
    res.render('board/new2', {role});
});

router.post('/', isSignedIn, upload.array('images', 5), validateBoard, catchAsync( async(req, res) => {    // 게시물 등록하기
    const board = new Board();
    board.title = req.body.title;
    board.mainText = req.body.mainText;
    board.author = req.user._id;
    board.notice = req.body.notice;

    const imgIndex = JSON.parse(req.body.imgIndex);
    for(let i = 0; i < req.files.length; i++) {
        const maxwidth = 1920;
        const originalImage = await sharp(req.files[i].buffer);
        const { width } = await originalImage.metadata();
        let buffer = req.files[i].buffer;
        if( width > maxwidth ) { // 이미지가 너무 클 경우.
            buffer = await sharp(req.files[i].buffer).resize({ width: 1920, height: 1080, fit: 'inside' }).toBuffer();
        } 
        const imageKey = `${req.user._id}/${board.id}/${randomImageName()}${Buffer.from(req.files[i].originalname, 'latin1').toString('utf8')}`
        const fileName = `${Buffer.from(req.files[i].originalname, 'latin1').toString('utf8')}`

        for(let i = 0; i < Object.keys(imgIndex).length; i++) {
            if(imgIndex[i] == fileName){
                imgIndex[i] = imageKey;
            }
        }
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: imageKey,
            Body: buffer,
            ContentType: req.files[i].mimetype
        }
        const command = new PutObjectCommand(params);
        await s3.send(command);
    }

    board.images.push(imgIndex);
    await board.save();
    
    res.json(board.id);
}));

router.get('/:id', catchAsync( async(req, res) => { // 게시물 불러오기
    const { id } = req.params;
    let { commentId, page } = req.query;
    if(!page) { page = 1; }
    let data = {};  // 이곳에 페이지 로딩에 필요한 데이터를 담아서 보낼 예정.
    const board = await Board.findById(id).populate('author'); // 해당 게시물이 있는지 확인        populate()가 있어야 참조함
    data.board = board;
    data.page = page; // 목록 버튼에 필요한 페이지넘버

    await Board.updateOne({_id:id}, {$inc:{views:1}}); // 조회수 1추가

    // 댓글
    const totalComments = await Comment.find({ board: id }).countDocuments();  // 총 댓글갯수
    if(totalComments == 0) {    // 댓글 없을 때
        data.pagination = false;
        data.comments = [];

    } else if(commentId) {  // 알림 기능을 통해 해당 댓글을 확인할때(쿼리스트링)

        const hasComments = await Comment.findById(commentId);
        if(!hasComments){
            const referringURL = req.headers.referer || req.headers.referrer;   // 이전 URL정보
            return res.redirect(referringURL);
            // return res.render('error/postPageError');
        }

        const sortComments = await Comment.find({ board: id }).sort({ parentComment: 1, createdAt: 1 }) // 해당 게시물의 모든 댓글 순서에 맞춰 정렬
        let cnt = 0
        for(comment of sortComments) {  // 찾는 댓글의 순번 찾기. (뭔가 노가다식으로 찾는 느낌인데 좋은 방법이 안떠오름)
            if(comment.id !== commentId) { cnt += 1; } else { cnt += 1; break; }
        }

        const targetCommentPage = Math.ceil(cnt / 10);  // 나누는 값은 바로아래 commentPaging()의 maxComment와 일치해야함.
        const { startCommentPage, endCommentPage, hideComment, maxComment, totalCommentPage, currentCommentPage, maxCommentPage } = commentPaging(targetCommentPage, totalComments);
        const comments = await Comment.find({ board: id }).sort({ parentComment: 1, createdAt: 1 }).skip(hideComment).limit(maxComment).populate('author');
        data.pagination = true;
        data.comments = comments;
        data.startCommentPage = startCommentPage;
        data.endCommentPage = endCommentPage;
        data.totalCommentPage = totalCommentPage;
        data.currentCommentPage = currentCommentPage;
        data.maxCommentPage = maxCommentPage;

    } else {
        
        const commentPage = req.query.commentPage || Math.ceil(totalComments / 10);
        const { startCommentPage, endCommentPage, hideComment, maxComment, totalCommentPage, currentCommentPage, maxCommentPage } = commentPaging(commentPage, totalComments);
        const comments = await Comment.find({ board: id }).sort({ parentComment: 1, createdAt: 1 }).skip(hideComment).limit(maxComment).populate('author');
        data.pagination = true;
        data.comments = comments;
        data.startCommentPage = startCommentPage;
        data.endCommentPage = endCommentPage;
        data.totalCommentPage = totalCommentPage;
        data.currentCommentPage = currentCommentPage;
        data.maxCommentPage = maxCommentPage;
    }

    // 베스트 댓글
    const boardId = new mongoose.Types.ObjectId(id);
    const searchBestComment = await Comment.aggregate([
        { $match: { board: boardId, isDeleted: false } }, // 같은 게시물 중, isDeleted가 false인것.
        { $project: { _id: 1, likesCount: { $size: '$likes' } } }, // likes 배열의 길이를 likesCount로 프로젝션.
        { $sort: { likesCount: -1, createdAt: -1 } }, // likesCount, createdAt를 기준으로 내림차순 정렬.
        { $limit: 1 } // 최상위 결과 하나만.
    ])
    if(searchBestComment.length === 1) {
        const bestComment = await Comment.findById(searchBestComment[0]._id).populate('author');
        if(bestComment.likes.length >= 3) { // 좋아요 3개 이상일 경우 Best Comment 조건 만족.
            data.bestComment = bestComment;
        } else {
            data.bestComment = undefined;
        }
    } else {
        data.bestComment = undefined;
    }


    // 게시물 이미지 불러오기
    const boardImgObject = {};
    for(let i = 0; i < Object.keys(board.images[0]).length; i++) {
        const getObjectParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: board.images[0][i]
        }
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3 });
        boardImgObject[i] = url;
    }
    const boardImg = JSON.stringify(boardImgObject);
    data.boardImg = boardImg;
    

    // 게시물 하단 index
    const totalPost = await Board.countDocuments({});
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage, maxPage } = boardPaging(page, totalPost);
    const post = await Board.find().sort({ notice: -1, createdAt: -1 }).skip(hidePost).limit(maxPost).populate('author');
    data.contents = post;
    data.currentPage = currentPage;
    data.startPage = startPage;
    data.endPage = endPage;
    data.maxPage = maxPage;
    data.totalPage = totalPage;

    res.render('board/show2', data);
}));

router.post('/:id', catchAsync( async(req, res) => {    // 페이징된 댓글 불러오기
    const { id } = req.params;
    const totalComments = await Comment.find({ board: id }).countDocuments();  // .skip(hidePost).limit(maxPost)
    const commentPage = req.query.commentPage;
    const { startCommentPage, endCommentPage, hideComment, maxComment, totalCommentPage, currentCommentPage, maxCommentPage } = commentPaging(commentPage, totalComments);
    const comments = await Comment.find({ board: id }).sort({ parentComment: 1, createdAt: 1 }).skip(hideComment).limit(maxComment).populate('author');  // .skip(hidePost).limit(maxPost)
    const resData = {};
    const commentsArr = [];
    const pageArr = [];

    for(comment of comments) {        
        if(comment._id.toString() == comment.parentComment.toString()){ // 부모 댓글인 경우.
            if(!comment.isDeleted) {    // 삭제되지 않은것.
                if(req.user == undefined) { // 유저가 로그인 안했을때.
                    const data =   `<div class="parent-comments-wrap">
                                <div id="parent-comments-info" class="comments-info">
                                    <div id="info-left" class="info-left">
                                        <p class="nickname">${comment.author.nickname}</p>
                                    </div>
                                    <div id="info-right" class="info-right">
                                        <p class="comment-date">${comment.createdAt.getFullYear()}-${String(comment.createdAt.getMonth()+1).padStart(2,'0')}-${String(comment.createdAt.getDate()).padStart(2,'0')} ${String(comment.createdAt.getHours()).padStart(2,'0')}:${String(comment.createdAt.getMinutes()).padStart(2,'0')}:${String(comment.createdAt.getSeconds()).padStart(2,'0')}</p>
                                    </div>
                                </div>
                                <div id="parent-comments-content" class="comments-content">
                                    <p class="main-text">${comment.body}</p>
                                </div>
                                <div id="parent-comments-btn-group" class="comments-btn-group">
                                    <div class="comment-like-wrap">
                                        <button class="comment-like" onclick="commentLike(this)" data-postId="${comment.board.toHexString()}" data-commentId="${comment._id.toHexString()}"><i id="commnet-thumb" class="fa-solid fa-thumbs-up"></i><p class="count-comment-likes">${comment.likes.length}</p></button>
                                    </div>
                                    <div class="comment-control-btn"> 
                                        <button class="report control-btn">신고</button>
                                    </div>
                                </div>
                            </div>`
                            commentsArr.push(data);
                } else {
                    if(req.user.nickname == comment.author.nickname) {  // 자기가 쓴글일때.
                        if(!comment.hasReply) { // 대댓글이 없을때.
          const data = `<div class="parent-comments-wrap">
                            <div id="parent-comments-info" class="comments-info">
                                <div id="info-left" class="info-left">
                                    <p class="nickname">${comment.author.nickname}</p>
                                </div>
                                <div id="info-right" class="info-right">
                                    <p class="comment-date">${comment.createdAt.getFullYear()}-${String(comment.createdAt.getMonth()+1).padStart(2,'0')}-${String(comment.createdAt.getDate()).padStart(2,'0')} ${String(comment.createdAt.getHours()).padStart(2,'0')}:${String(comment.createdAt.getMinutes()).padStart(2,'0')}:${String(comment.createdAt.getSeconds()).padStart(2,'0')}</p>
                                </div>
                            </div>
                            <div id="parent-comments-content" class="comments-content">
                                <p class="main-text">${comment.body}</p>
                            </div>
                            <div id="parent-comments-btn-group" class="comments-btn-group">
                                <div class="comment-like-wrap">
                                    <button class="comment-like" onclick="commentLike(this)" data-postId="${comment.board.toHexString()}" data-commentId="${comment._id.toHexString()}"><i id="commnet-thumb" class="fa-solid fa-thumbs-up"></i><p class="count-comment-likes">${comment.likes.length}</p></button>
                                </div>
                                <div class="comment-control-btn"> 
                                    <button class="reply control-btn" onclick="createReplyInputBox(this)" data-postId="${comment.board.toHexString()}" data-commentId="${comment._id.toHexString()}">답변</button>
                                    <button class="modify control-btn" onclick="createEditCommentInputBox(this)" data-postId="${comment.board.toHexString()}" data-commentId="${comment._id.toHexString()}">수정</button>
                                    <button class="delete control-btn" onclick="commentDelete(this)" data-postId="${comment.board.toHexString()}" data-commentId="${comment._id.toHexString()}">삭제</button>
                                </div>
                            </div>
                        </div>`
                        commentsArr.push(data);
                        } else {
          const data = `<div class="parent-comments-wrap">
                            <div id="parent-comments-info" class="comments-info">
                                <div id="info-left" class="info-left">
                                    <p class="nickname">${comment.author.nickname}</p>
                                </div>
                                <div id="info-right" class="info-right">
                                    <p class="comment-date">${comment.createdAt.getFullYear()}-${String(comment.createdAt.getMonth()+1).padStart(2,'0')}-${String(comment.createdAt.getDate()).padStart(2,'0')} ${String(comment.createdAt.getHours()).padStart(2,'0')}:${String(comment.createdAt.getMinutes()).padStart(2,'0')}:${String(comment.createdAt.getSeconds()).padStart(2,'0')}</p>
                                </div>
                            </div>
                            <div id="parent-comments-content" class="comments-content">
                                <p class="main-text">${comment.body}</p>
                            </div>
                            <div id="parent-comments-btn-group" class="comments-btn-group">
                                <div class="comment-like-wrap">
                                    <button class="comment-like" onclick="commentLike(this)" data-postId="${comment.board.toHexString()}" data-commentId="${comment._id.toHexString()}"><i id="commnet-thumb" class="fa-solid fa-thumbs-up"></i><p class="count-comment-likes">${comment.likes.length}</p></button>
                                </div>
                                <div class="comment-control-btn"> 
                                    <button class="reply control-btn" onclick="createReplyInputBox(this)" data-postId="${comment.board.toHexString()}" data-commentId="${comment._id.toHexString()}">답변</button>
                                    <button class="delete control-btn" onclick="commentDelete(this)" data-postId="${comment.board.toHexString()}" data-commentId="${comment._id.toHexString()}">삭제</button>
                                </div>
                            </div>
                        </div>`
                        commentsArr.push(data);
                        }
                    } else {    // 로그인한 유저가 쓴글이 아닐때.
                        const data =   `<div class="parent-comments-wrap">
                                            <div id="parent-comments-info" class="comments-info">
                                                <div id="info-left" class="info-left">
                                                    <p class="nickname">${comment.author.nickname}</p>
                                                </div>
                                                <div id="info-right" class="info-right">
                                                    <p class="comment-date">${comment.createdAt.getFullYear()}-${String(comment.createdAt.getMonth()+1).padStart(2,'0')}-${String(comment.createdAt.getDate()).padStart(2,'0')} ${String(comment.createdAt.getHours()).padStart(2,'0')}:${String(comment.createdAt.getMinutes()).padStart(2,'0')}:${String(comment.createdAt.getSeconds()).padStart(2,'0')}</p>
                                                </div>
                                            </div>
                                            <div id="parent-comments-content" class="comments-content">
                                                <p class="main-text">${comment.body}</p>
                                            </div>
                                            <div id="parent-comments-btn-group" class="comments-btn-group">
                                                <div class="comment-like-wrap">
                                                    <button class="comment-like" onclick="commentLike(this)" data-postId="${comment.board.toHexString()}" data-commentId="${comment._id.toHexString()}"><i id="commnet-thumb" class="fa-solid fa-thumbs-up"></i><p class="count-comment-likes">${comment.likes.length}</p></button>
                                                </div>
                                                <div class="comment-control-btn"> 
                                                    <button class="reply control-btn" onclick="createReplyInputBox(this)" data-postId="${comment.board.toHexString()}" data-commentId="${comment._id.toHexString()}">답변</button>
                                                    <button class="report control-btn">신고</button>
                                                </div>
                                            </div>
                                        </div>`
                                        commentsArr.push(data);
                    }
                }
            } else {
                const data = `<div id="deleted-parent-comments-wrap"> 해당 댓글은 삭제되었습니다. </div>`
                commentsArr.push(data);
            }
        } else {    // 대댓글인 경우.
            if(req.user == undefined) {
                const data =   `<div class="child-comments-wrap">
                <div id="child-comments-info" class="comments-info">
                    <div id="info-left" class="info-left">
                        <p class="nickname">${comment.author.nickname}</p>
                    </div>
                    <div id="info-right">
                        <p class="comment-date">${comment.createdAt.getFullYear()}-${String(comment.createdAt.getMonth()+1).padStart(2,'0')}-${String(comment.createdAt.getDate()).padStart(2,'0')} ${String(comment.createdAt.getHours()).padStart(2,'0')}:${String(comment.createdAt.getMinutes()).padStart(2,'0')}:${String(comment.createdAt.getSeconds()).padStart(2,'0')}</p>
                    </div>
                </div>
                <div id="child-comments-content" class="comments-content">
                    <p class="main-text">${comment.body}</p>
                </div>
                <div id="child-comments-btn-group" class="comments-btn-group">
                    <div class="comment-like-wrap">
                        <button class="comment-like reply-btn" onclick="commentLike(this)" data-postId="${comment.board.toHexString()}" data-commentId="${comment._id.toHexString()}"><i id="commnet-thumb" class="fa-solid fa-thumbs-up"></i><p class="count-comment-likes">${comment.likes.length}</p></button>
                    </div>
                    <div class="comment-control-btn">
                        <button class="report reply-btn">신고</button>
                    </div>
                </div>
            </div>`
            commentsArr.push(data);
            } else {
                if(req.user.nickname == comment.author.nickname) {
                    const data =   `<div class="child-comments-wrap">
                                        <div id="child-comments-info" class="comments-info">
                                            <div id="info-left" class="info-left">
                                                <p class="nickname">${comment.author.nickname}</p>
                                            </div>
                                            <div id="info-right">
                                                <p class="comment-date">${comment.createdAt.getFullYear()}-${String(comment.createdAt.getMonth()+1).padStart(2,'0')}-${String(comment.createdAt.getDate()).padStart(2,'0')} ${String(comment.createdAt.getHours()).padStart(2,'0')}:${String(comment.createdAt.getMinutes()).padStart(2,'0')}:${String(comment.createdAt.getSeconds()).padStart(2,'0')}</p>
                                            </div>
                                        </div>
                                        <div id="child-comments-content" class="comments-content">
                                            <p class="main-text">${comment.body}</p>
                                        </div>
                                        <div id="child-comments-btn-group" class="comments-btn-group">
                                            <div class="comment-like-wrap">
                                                <button class="comment-like reply-btn" onclick="commentLike(this)" data-postId="${comment.board.toHexString()}" data-commentId="${comment._id.toHexString()}"><i id="commnet-thumb" class="fa-solid fa-thumbs-up"></i><p class="count-comment-likes">${comment.likes.length}</p></button>
                                            </div>
                                            <div class="comment-control-btn">
                                                <button class="delete reply-btn" onclick="commentDelete(this)" data-postId="${comment.board.toHexString()}" data-commentId="${comment._id.toHexString()}">삭제</button>
                                            </div>
                                        </div>
                                    </div>`
                                    commentsArr.push(data);
                } else {
                    const data =   `<div class="child-comments-wrap">
                <div id="child-comments-info" class="comments-info">
                    <div id="info-left" class="info-left">
                        <p class="nickname">${comment.author.nickname}</p>
                    </div>
                    <div id="info-right">
                        <p class="comment-date">${comment.createdAt.getFullYear()}-${String(comment.createdAt.getMonth()+1).padStart(2,'0')}-${String(comment.createdAt.getDate()).padStart(2,'0')} ${String(comment.createdAt.getHours()).padStart(2,'0')}:${String(comment.createdAt.getMinutes()).padStart(2,'0')}:${String(comment.createdAt.getSeconds()).padStart(2,'0')}</p>
                    </div>
                </div>
                <div id="child-comments-content" class="comments-content">
                    <p class="main-text">${comment.body}</p>
                </div>
                <div id="child-comments-btn-group" class="comments-btn-group">
                    <div class="comment-like-wrap">
                        <button class="comment-like reply-btn" onclick="commentLike(this)" data-postId="${comment.board.toHexString()}" data-commentId="${comment._id.toHexString()}"><i id="commnet-thumb" class="fa-solid fa-thumbs-up"></i><p class="count-comment-likes">${comment.likes.length}</p></button>
                    </div>
                    <div class="comment-control-btn">
                        <button class="report reply-btn">신고</button>
                    </div>
                </div>
            </div>`
            commentsArr.push(data);
                }
            }
        }
    }

    if(startCommentPage > maxCommentPage) {
        const prev = `<button class="commentPage" onclick="commentPage(this)" data-postId="${id}" data-page="${ startCommentPage - 1 }">prev</button>`
        pageArr.push(prev);
    } else {
        const prev = `<button class="commentPage" style="color: grey;">prev</button>`
        pageArr.push(prev);
    }
    for(let i = startCommentPage; i <= endCommentPage; i++) {
        if(i === currentCommentPage) {
            const currPage = `<button id="currentPage" class="commentPage" style="color: red;" onclick="commentPage(this)" data-postId="${id}">${i}</button>`
            pageArr.push(currPage);
        } else {
            const page = `<button class="commentPage" onclick="commentPage(this)" data-postId="${id}">${i}</button>`
            pageArr.push(page);
        }
    }
    if(endCommentPage < totalCommentPage) {
        const next = `<button class="commentPage" onclick="commentPage(this)" data-postId="${id}" data-page="${ endCommentPage + 1 }">next</button>`
        pageArr.push(next);
    } else {
        const next = `<button class="commentPage" style="color: grey;">next</button>`
        pageArr.push(next);
    }

    resData.commentsArr = commentsArr;
    resData.pageArr = pageArr;

    res.json(resData);
}));

router.get('/:id/postLike', isSignedIn, catchAsync( async(req, res) => {    // 비로그인 상태에서 신고버튼 누르고 로그인 후 보고있던 페이지로 리다이렉트 (안그럼 post라우트로감)
    const { id } = req.params;
    res.redirect(`/index/${id}`);
}));

router.post('/:id/postLike', isSignedIn2, catchAsync( async(req, res) => {  // 게시물 좋아요.
    const { id } = req.params;
    if(req.user){
        const board = await Board.find({_id: id, likes: req.user._id});
        if(board.length === 0) {
            const addLike = await Board.findById(id).populate('author');
            const newLike = new LikePost();

            newLike.user = req.user._id;
            newLike.likedPost = id;
            addLike.likes.push(req.user._id);
            await addLike.save();
            await newLike.save();

            if(addLike.author.id !== req.user.id) { // 자신의 글에 좋아요는 알림 안함.
                const newNotification = new Notification();
                newNotification.sender = req.user.id;
                newNotification.recipient = addLike.author.id;
                newNotification.notificationType = 'likePost';
                newNotification.postId = addLike.id; // 타이틀 확인
                await newNotification.save();
            }

            return res.json({ok: addLike.likes.length})
        }
        return res.json('exist')
    } else {
        return res.json('nk')
    }
}));

router.get('/:id/postReport', isSignedIn, catchAsync( async(req, res) => {
    const { id } = req.params;
    res.redirect(`/index/${id}`);
}));

router.post('/:id/postReport', isSignedIn2, catchAsync( async(req, res) => {    // 게시물 신고
    const {id} = req.params;
    if(req.user) {
        const board = await Board.find({_id: id, reports: req.user._id});
        if(board.length === 0) {
            const addReport = await Board.findById(id);
            const newReport = new ReportPost();

            newReport.user = req.user._id;
            newReport.reportedPost = id;
            addReport.reports.push(req.user._id);
            await addReport.save();
            await newReport.save();

            return res.json('ok');
        }
        return res.json('exist')
    } else {
        return res.json('nk')
    }
}));

router.get('/:id/edit', isSignedIn, isAuthor, catchAsync( async(req, res) => {
    const {id} = req.params;
    const board = await Board.findById(id);
    if(!board){
        return res.redirect('/index')
    }
    res.render('board/edit', {content: board});
}));

// edit 페이지 v2
router.get('/:id/edit2', isSignedIn, isAuthor, catchAsync( async(req, res) => { // 게시물 수정하기 페이지
    const {id} = req.params;
    const {page} = req.query;
    const board = await Board.findById(id);

    const boardImgObject = {}
    for(let i = 0; i < Object.keys(board.images[0]).length; i++) {
        const getObjectParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: board.images[0][i]
        }
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command);
        boardImgObject[i] = url;
    }

    const boardImg = JSON.stringify(boardImgObject);

    if(!board){
        return res.redirect('/index')
    }
    
    res.render('board/edit2', {content: board, boardImg, page});
}));

router.put('/:id', isSignedIn, isAuthor, upload.array('images', 5), validateBoard, catchAsync( async(req, res) => {  // 게시물 수정하기
    const { id } = req.params;
    const board = await Board.findById(id);

    board.title = req.body.title;
    board.mainText = req.body.mainText;

    // 새로 추가된 이미지 파일 s3 업로드
    const imgIndex = JSON.parse(req.body.imgIndex);
    const uploadImages = {}
    for(let i = 0; i < req.files.length; i++) {     
        const fileName = Buffer.from(req.files[i].originalname, 'latin1').toString('utf8');
        for(let index in imgIndex) {
            if(imgIndex[index] == fileName) {
                uploadImages[index] = `${req.user._id}/${board.id}/${randomImageName()}${fileName}`;
                const imageKey = uploadImages[index];
                delete imgIndex[index];
                
                // 리사이징, s3업로드
                const maxwidth = 1920;
                const originalImage = await sharp(req.files[i].buffer);
                const { width } = await originalImage.metadata();
                let buffer = req.files[i].buffer;
                if( width > maxwidth ) {
                    buffer = await sharp(req.files[i].buffer).resize({ width: 1920, height: 1080, fit: 'inside' }).toBuffer();
                } 
                const params = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: imageKey,
                    Body: buffer,
                    ContentType: req.files[i].mimetype
                }
                const command = new PutObjectCommand(params);
                await s3.send(command);
            }
        }
    }

    // DB 이미지 주소 업데이트
    const DBIndex = board.images[0];
    for(let index in DBIndex){
        for(let newIndex in imgIndex){
            const newImgIndex = DBIndex[index].indexOf(imgIndex[newIndex]);
            if(newImgIndex != -1) {
                uploadImages[newIndex] = DBIndex[index];
            }
        }
    }
    board.images[0] = uploadImages;
    await board.save();

    // s3 이미지 삭제
    for (let index in DBIndex) {
        for(let newIndex in uploadImages) {
            if(DBIndex[index] == uploadImages[newIndex]){
                delete DBIndex[index]
            }
        }
    }
    for(let index in DBIndex) {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: DBIndex[index],
        }
        const command = new DeleteObjectCommand(params);
        await s3.send(command);
    }
    res.json(board.id);
}));

router.delete('/:id', isSignedIn, isAuthor, catchAsync( async(req, res) => { // 게시물 삭제
    const {id} = req.params;
    const board = await Board.findById(id);
    const boardImg = board.images[0];

    // s3삭제
    for(let img in boardImg) {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: boardImg[img],
        }
        const command = new DeleteObjectCommand(params);
        await s3.send(command);
    }

    await Board.findByIdAndDelete(id);
    res.redirect('/index');
}));

module.exports = router;