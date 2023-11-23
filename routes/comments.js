const express = require('express');     
const router = express.Router({mergeParams: true});

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { validateComment, isSignedIn, isCommentAuthor } = require('../middleware');

const Board = require('../models/board');
const Comment = require('../models/comment');
const NestedComment = require('../models/nestedComment');
const { commentPaging } = require('../paging');


router.get('/', catchAsync( async(req, res) => {

    const { id } = req.params;
    const { page } = req.query;

    const comment = await Comment.find({board:id}).populate('author').populate({path: 'nestedComments', populate: {path: 'author'}});
    // const comment = await Comment.aggregate([{$unwind: '$nestedComments'}]);
    // const nestedComment = await NestedComment.find({board:id});
    // const totalPost = comment.length + nestedComment.length;
    // console.log("comment@@@@@@@@@@: ", comment);
    // console.log("comment.nestedComments@@@@@@@@@@@@@@: ", comment[0].nestedComments);
    // console.log("totalPost@@@@@@@@@@@@@@@: ", totalPost);

    // let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = commentPaging(page, totalPost);
    
    // res.render("board/show", {
    //     comment,
    //     currentPage,
    //     startPage,
    //     endPage,
    //     maxPost,
    //     totalPage,
    // });
    // res.redirect(`/index/${id}`);
    res.json(comment);
}));

router.post('/', isSignedIn, validateComment, catchAsync( async(req, res) => {
    const board = await Board.findById(req.params.id);
    const comment = new Comment(req.body.comment);

    comment.author = req.user._id;
    comment.board = req.params.id;
    comment.parentComment = comment._id

    board.comments.push(comment);
    await comment.save();
    await board.save();

    res.redirect(`/index/${board._id}`);
}));

router.put('/:commentId', isSignedIn, isCommentAuthor, validateComment, catchAsync( async(req, res) => {
    const {commentId} = req.params;
    console.log("req.body: ", req.body);
    console.log("req.body.comment: ", req.body.comment);
    await Comment.findByIdAndUpdate(commentId, req.body.comment);
    res.send();
}));

router.delete('/:commentId', isSignedIn, isCommentAuthor, catchAsync( async(req, res) => {
    const {id, commentId} = req.params;
    await Board.findByIdAndUpdate(id, {$pull: {comments: commentId}});
    await Comment.findByIdAndDelete(commentId);
    res.redirect(`/index/${id}`);
}));

module.exports = router;