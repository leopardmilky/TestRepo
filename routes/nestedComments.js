const express = require('express');     
const router = express.Router({mergeParams: true});

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { validateComment, isSignedIn, isCommentAuthor } = require('../middleware');

const Board = require('../models/board');
const Comment = require('../models/comment');
const nestedComment = require('../models/nestedComments');


router.post('/', catchAsync( async(req, res) => {
    const board = await Board.findById(req.params.id);
    const comment = await Comment.findById(req.params.commentId);
    const commentReply = new nestedComment(req.body.nestedComment);

    commentReply.author = req.user._id;
    commentReply.board = req.params.id;

    comment.nestedComments.push(commentReply);
    await commentReply.save();
    await comment.save();
    res.send();
}));

router.delete('/:nestedCommentId', catchAsync( async(req, res) => {

}));

module.exports = router;