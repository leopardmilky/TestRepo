const express = require('express');     
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { isSignedIn, isNestedCommentAuthor, isSignedIn2, validateNestedComment } = require('../middleware');
const Board = require('../models/board');
const Comment = require('../models/comment');
const NestedComment = require('../models/nestedComment');


// router.get('/', catchAsync( async(req, res) => { // 대댓글 작성 후 다시 불러오는 라우트
//     const comment = await Board.findById(req.params.id).populate({path:'comments', populate:{path: 'author'}});
//     res.json(comment);
// }));

// router.post('/', isSignedIn, catchAsync( async(req, res) => {
//     const board = await Board.findById(req.params.id);
//     const comment = await Comment.findById(req.params.commentId);
//     const reply = new Comment(req.body);

//     reply.author = req.user._id;
//     reply.board = req.params.id;
//     reply.parentComment = req.params.commentId;
//     comment.hasReply = true;

//     board.comments.push(reply);
//     await reply.save();
//     await comment.save();
//     await board.save();

//     res.json();
// }));

// router.delete('/:nestedCommentId', isSignedIn, isNestedCommentAuthor, catchAsync( async(req, res) => {
//     const {id, commentId, nestedCommentId} = req.params;
//     await Comment.findByIdAndUpdate(commentId, {$pull: {nestedComments: nestedCommentId}});
//     await NestedComment.findByIdAndDelete(nestedCommentId);
//     res.redirect(`/index/${id}`);
// }));

module.exports = router;