const express = require('express');     
const router = express.Router({mergeParams: true});

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { isSignedIn, isNestedCommentAuthor, validateNestedComment } = require('../middleware');

const Board = require('../models/board');
const Comment = require('../models/comment');
const NestedComment = require('../models/nestedComment');



router.get('/', catchAsync( async(req, res) => { // 대댓글 작성 후 다시 불러오는 라우트
    const comment = await Board.findById(req.params.id).populate({path:'comments', populate:{path: 'nestedComments', populate: {path: 'author'}}}).populate({path:'comments', populate:{path: 'author'}});
    res.json(comment);
}));

router.post('/', isSignedIn, validateNestedComment, catchAsync( async(req, res) => {
    const comment = await Comment.findById(req.params.commentId);
    const commentReply = new NestedComment(req.body.nestedComment);
    
    commentReply.author = req.user._id;
    commentReply.board = req.params.id;
    commentReply.comment = req.params.commentId;

    comment.nestedComments.push(commentReply);
    await commentReply.save();
    await comment.save();
    
    res.json(comment);
}));

router.delete('/:nestedCommentId', isSignedIn, isNestedCommentAuthor, catchAsync( async(req, res) => {
    const {id, commentId, nestedCommentId} = req.params;
    await Comment.findByIdAndUpdate(commentId, {$pull: {nestedComments: nestedCommentId}});
    await NestedComment.findByIdAndDelete(nestedCommentId);
    res.redirect(`/index/${id}`);
}));

module.exports = router;