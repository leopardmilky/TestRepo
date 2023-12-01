const express = require('express');     
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { validateComment, isSignedIn, isSignedIn2, isCommentAuthor } = require('../middleware');
const Board = require('../models/board');
const Comment = require('../models/comment');
const NestedComment = require('../models/nestedComment');
const { commentPaging } = require('../paging');


router.get('/', catchAsync( async(req, res) => {
    const { id } = req.params;
    const { page } = req.query;

    console.log("req.params: ", req.params);
    console.log("req.query: ", req.query);

    // let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = commentPaging(page, totalPost);
    // const countComments = await Comment.find({ board: id }).countDocuments();  // .skip(hidePost).limit(maxPost)
    // const skipCount = Math.max(0, countComments - 5);
    // const comments = await Comment.find({ board: id }).sort({ parentComment: 1, createdAt: 1 }).skip(skipCount).populate('author');  // .skip(hidePost).limit(maxPost)


    console.log("너는 사용은 되고 있니???????????????????");

    // res.json(comment);
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

router.put('/:commentId', isSignedIn, isCommentAuthor, catchAsync( async(req, res) => {
    const {commentId} = req.params;
    const countComment = await Comment.find({parentComment: commentId}).countDocuments();
    if(countComment > 1) {  // 해당 댓글에 이미 답변이 달렸을때.
        return res.json('nk');
    }
    await Comment.findByIdAndUpdate(commentId, req.body);
    res.send();
}));

router.delete('/:commentId', isSignedIn, isCommentAuthor, catchAsync( async(req, res) => {
    const {id, commentId} = req.params;
    const comment = await Comment.findById(commentId);

    if(comment._id.toString() !== comment.parentComment.toString()) {
        await Board.findByIdAndUpdate(id, {$pull: {comments: commentId}});  // 게시물에 저장된 댓글목록 지우고.
        await Comment.findByIdAndDelete(commentId); // 해당 댓글도 찾아서 지운다.
        const countComments = await Comment.find({parentComment: comment.parentComment}).countDocuments();  // 그리고 parentComment필드의 갯수가

        if(countComments == 1) {    // 1개이면 더 이상 대댓글이 없는것임.
            const parentComment = await Comment.findById(comment.parentComment);
            if(parentComment.isDeleted) {
                await Comment.findByIdAndDelete(comment.parentComment);
            } else {
                parentComment.hasReply = false; // 대댓글이 없는 표시로 변경해 줘야함.
                await parentComment.save();
            }
        }
    }

    if(comment.hasReply) {  // 어떤 댓글이 hasReply가 true이면 대댓글이 있는 부모댓글임.
        await Board.findByIdAndUpdate(id, { $pull:{ comments: commentId } });
        comment.isDeleted = true;
        await comment.save();
    } else {
        await Board.findByIdAndUpdate(id, { $pull:{ comments: commentId } });
        await Comment.findByIdAndDelete(comment._id);
    }

    res.json();
}));

router.get('/:commentId/commentLike', isSignedIn, catchAsync( async(req, res) => {
    const { id } = req.params;
    res.redirect(`/index/${id}`);
}));

router.post('/:commentId/commentLike', isSignedIn2, catchAsync( async(req, res) => {
    const { commentId } = req.params;
    if(req.user) {
        const comment = await Comment.find({_id: commentId, likes: req.user._id});
        if(comment.length === 0) {
            const addLike = await Comment.findById(commentId);
            addLike.likes.push(req.user._id);
            await addLike.save();

            return res.json({ok: addLike.likes.length})
        }
        return res.json('exist')
    } else {
        return res.json('nk')
    }
}));

router.get('/:commentId/commentReport', isSignedIn, catchAsync( async(req, res) => {
    const { id } = req.params;
    res.redirect(`/index/${id}`);
}));

router.post('/:commentId/commentReport', isSignedIn2, catchAsync( async(req, res) => {
    const { commentId } = req.params;
    if(req.user) {
        const comment = await Comment.find({_id: commentId, reports: req.user._id});
        if(comment.length === 0) {
            const addReport = await Comment.findById(commentId);
            addReport.reports.push(req.user._id);
            await addReport.save();

            return res.json('ok')
        }
        return res.json('exist')
    } else {
        return res.json('nk')
    }
}));


module.exports = router;