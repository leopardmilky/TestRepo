const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const catchAsync = require('../utils/catchAsync');
const { isSignedIn, validateBoard, isAuthor } = require('../middleware');

const Board = require('../models/board');
const Comment = require('../models/comment');
const NestedComment = require('../models/nestedComment');
const { boardPaging } = require('../paging');


router.get('/', catchAsync( async(req, res) => {
    const { page } = req.query;
    try {
        const totalPost = await Board.countDocuments({});
        if (!totalPost) {
            throw Error();
        }
        let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = boardPaging(page, totalPost);
        const board = await Board.find().sort({ createdAt: -1 }).skip(hidePost).limit(maxPost).populate({path: 'comments', populate: {path: 'nestedComments'}}).populate('author');
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

router.post('/', isSignedIn, validateBoard, catchAsync( async(req, res) => {
    const board = new Board(req.body.board);
    board.author = req.user._id;
    await board.save();

    res.redirect(`/index/${board._id}`);
}));

router.get('/:id', catchAsync( async(req, res) => {
    const { id } = req.params;
    const board = await Board.findById(id).populate({path: 'comments', populate: {path:'author'}}).populate('author'); // populate()가 있어야 ref
    const comment = await Comment.find({ board:id }).populate({path: 'nestedComments', populate: {path: 'author'}}).populate('author');
    const nestedComment = await NestedComment.find({board:id});
    const commentSum = board.comments.length + nestedComment.length;

    // const commentPaging = await Comment.find({ board:id }).populate('nestedComments');
   
    const commentPaging = await Comment.aggregate([{$unwind:"$nestedComments"}])
    console.log("commentPaging: ", commentPaging);

    if(!board){
        return res.redirect('/index');
    }

    res.render('board/show', { boardItems: board, commentItems:comment, commentSum });

}));

router.get('/:id/edit', isSignedIn, isAuthor, catchAsync( async(req, res) => {
    const {id} = req.params;
    const board = await Board.findById(id);
    if(!board){
        return res.redirect('/index')
    }
    res.render('board/edit', {content: board});
}));

router.put('/:id', isSignedIn, isAuthor, validateBoard, catchAsync( async(req, res) => {
    const {id} = req.params;
    const board = await Board.findByIdAndUpdate(id, req.body.board); // {...req.body.board} ???
    res.redirect(`/index/${board._id}`);
}));

router.delete('/:id', isSignedIn, isAuthor, catchAsync( async(req, res) => {
    const {id} = req.params;
    await Board.findByIdAndDelete(id);
    res.redirect('/index');
}));

module.exports = router;
