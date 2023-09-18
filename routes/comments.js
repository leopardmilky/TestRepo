const express = require('express');     
const router = express.Router({mergeParams: true});

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { validateComment, isSignedIn, isCommentAuthor } = require('../middleware');

const Board = require('../models/board');
const Comment = require('../models/comment');



router.post('/', isSignedIn, validateComment, catchAsync( async(req, res) => {
    const board = await Board.findById(req.params.id);
    const comment = new Comment(req.body.comment);
    comment.author = req.user._id;
    board.comments.push(comment);
    await comment.save();
    await board.save();
    res.redirect(`/index/${board._id}`);
}));

router.put('/:commentId', isSignedIn, isCommentAuthor, catchAsync( async(req, res) => {
    const {id, commentId} = req.params;
    const comment = await Comment.findByIdAndUpdate(commentId, req.body.comment);
    res.send();
}));

router.delete('/:commentId', isSignedIn, isCommentAuthor, catchAsync( async(req, res) => {
    const {id, commentId} = req.params;
    await Board.findByIdAndUpdate(id, {$pull: {comments: commentId}});
    await Comment.findByIdAndDelete(commentId);
    res.redirect(`/index/${id}`);
}));

module.exports = router;