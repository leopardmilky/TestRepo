const express = require('express');     
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
// const ExpressError = require('../utils/ExpressError');
const Board = require('../models/board');
const Comment = require('../models/comment');



router.post('/', catchAsync(async (req, res) => {
    const board = await Board.findById(req.params.id);
    const comment = new Comment(req.body.comment);
    board.comments.push(comment);
    await comment.save();
    await board.save();
    res.redirect(`/index/${board._id}`);
}));

router.delete('/:commentId', catchAsync(async(req, res) => {
    const {id, commentId} = req.params;
    await Board.findByIdAndUpdate(id, {$pull: {comments: commentId}});
    await Comment.findByIdAndDelete(req.params.commentId);
    res.redirect(`/index/${id}`);
}));

module.exports = router;