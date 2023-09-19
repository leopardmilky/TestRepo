const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const catchAsync = require('../utils/catchAsync');
const { isSignedIn, validateBoard, isAuthor } = require('../middleware');

const Board = require('../models/board');
const Comment = require('../models/comment');
const { boardPaging, commentPaging } = require('../paging');



router.get('/', catchAsync(async (req, res) => {
    const { page } = req.query;
    try {
        const totalPost = await Board.countDocuments({});
        if (!totalPost) {
            throw Error();
        }
        let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = boardPaging(page, totalPost);
        const board = await Board.find().sort({ createdAt: -1 }).skip(hidePost).limit(maxPost).populate('author');
        res.render("board/index", {
            contents: board,
            currentPage,
            startPage,
            endPage,
            maxPost,
            totalPage,
        });
    } catch (error) {
        res.render("board/index", { contents: board });
    }
}));

router.get('/new', isSignedIn, (req, res) => {
    res.render('board/new');
});

router.post('/', isSignedIn, validateBoard, catchAsync(async (req, res) => {
    const board = new Board(req.body.board);
    board.author = req.user._id;
    await board.save();
    res.redirect(`/index/${board._id}`);
}));

router.get('/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    const board = await Board.findById(id).populate({path: 'comments', populate: {path:'author'}}).populate('author'); // populate()가 있어야 ref
    const comment = await Comment.find({board:id}).populate('author');
    console.log(comment);

    // 댓글 페이징, 대댓글 해야함.

    if(!board){
        return res.redirect('/index')
    }
    
    res.render('board/show', {boardItems: board, commentItems:comment});



    // const dbtest = await Comment.find().populate('board')
    // console.log("dbtest: ", dbtest);
    // // res.send("success???")
    // res.render('board/test', {dbtest})



    // const { id } = req.params;
    // const { page } = req.query;
    // const boardId = new mongoose.Types.ObjectId(req.params.id); // 이거때문에 고요한 밤을 온전히 즐겼다. ㅎ발.  (ObjectId 변환: req.params.id에서 받아온 값이 문자열일 수 있습니다. ObjectId로 변환해야 함)
    // const commentsCount = await Board.aggregate([{$match:{_id: boardId}}, {$project:{count:{$size: "$comments"}}}]);
    // const totalPost = commentsCount[0].count;
    // if (totalPost) {
    //     let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = commentPaging(page, totalPost);
    //     const board = await Board.findById(id).populate({path: 'comments', populate: {path:'author'}}).populate('author').skip(hidePost).limit(maxPost);
    //     // console.log(board)
    //     return res.render("board/show", {
    //         items: board,
    //         currentPage,
    //         startPage,
    //         endPage,
    //         maxPost,
    //         totalPage,
    //         totalPost
    //     });
    // }
    // const board = await Board.findById(id).populate({path: 'comments', populate: {path:'author'}}).populate('author');
    // res.render('board/show', {items: board, totalPost});
}));

router.get('/:id/edit', isSignedIn, isAuthor, catchAsync(async (req, res) => {
    const {id} = req.params;
    const board = await Board.findById(id);
    if(!board){
        return res.redirect('/index')
    }
    res.render('board/edit', {content: board});
}));

router.put('/:id', isSignedIn, isAuthor, validateBoard, catchAsync(async (req, res) => {
    const {id} = req.params;
    const board = await Board.findByIdAndUpdate(id, req.body.board); // {...req.body.board} ???
    res.redirect(`/index/${board._id}`);
}));

router.delete('/:id', isSignedIn, isAuthor, catchAsync(async (req, res) => {
    const {id} = req.params;
    await Board.findByIdAndDelete(id);
    res.redirect('/index');
}));

module.exports = router;
