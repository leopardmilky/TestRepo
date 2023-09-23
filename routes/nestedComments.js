const express = require('express');     
const router = express.Router({mergeParams: true});

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { validateComment, isSignedIn, isCommentAuthor } = require('../middleware');

const Board = require('../models/board');
const Comment = require('../models/comment');
const nestedComment = require('../models/nestedComments');
const nestedComments = require('../models/nestedComments');


router.get('/', catchAsync (async(req, res) => {
    console.log('GET_PARAMS??????: ', req.params)
    console.log('GET_QUERY??????: ', req.query)
    console.log('GET_BODY??????: ', req.body)
    console.log('GET_USER??????: ', req.user)

    // const comment = await Comment.find({board:req.params.id});
    // console.log("GET_COMMENT_RESULT:", comment);
    const comment = await Comment.findById(req.params.commentId).populate({path: 'nestedComments', populate: {path: 'author'}});
    console.log("GET_COMMENT.ID_RESULT:", comment);
    console.log("nestedComment_AUTHOR: ", comment.nestedComments);
    res.json();
}));

router.post('/', catchAsync( async(req, res) => {
    const board = await Board.findById(req.params.id);
    const comment = await Comment.findById(req.params.commentId);
    const commentReply = new nestedComment(req.body.nestedComment);

    commentReply.author = req.user._id;
    commentReply.board = req.params.id;

    comment.nestedComments.push(commentReply);
    await commentReply.save();
    await comment.save();
    // res.send();
    res.json(comment);
}));

router.delete('/:nestedCommentId', catchAsync( async(req, res) => {

}));

module.exports = router;