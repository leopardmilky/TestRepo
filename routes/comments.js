const express = require('express');     
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { validateComment, isSignedIn, isSignedIn2, isCommentAuthor } = require('../middleware');
const Board = require('../models/board');
const Comment = require('../models/comment');
const ReportComment = require('../models/reportComment');
const LikeComment = require('../models/likeComment');
const Notification = require('../models/notification');


router.post('/', isSignedIn, validateComment, catchAsync( async(req, res) => {  // 부모댓글
    const {page} = req.query;
    const board = await Board.findById(req.params.id).populate('author');
    const comment = new Comment(req.body.comment);

    comment.author = req.user._id;
    comment.board = req.params.id;
    comment.parentComment = comment._id

    board.comments.push(comment);
    await comment.save();
    await board.save();

    if(board.author.id !== req.user.id) { // 나 자신에게 쓴건 알림 안함.
        const newNotification = new Notification();
        newNotification.sender = req.user.id;
        newNotification.recipient = board.author.id;
        newNotification.notificationType = 'postComment';
        newNotification.commentId = comment.id; // 부모댓글 (연관 댓글이 뭔지 확인하려고)
        newNotification.postId = board.id; // 게시물(무슨 글썻지 확인하려고)
        await newNotification.save();
    }

    res.redirect(`/index/${board._id}?page=${page}`);
}));


router.post('/:commentId', isSignedIn, catchAsync( async(req, res) => { // 대댓글
    const board = await Board.findById(req.params.id);
    const comment = await Comment.findById(req.params.commentId).populate('author');
    const reply = new Comment(req.body);

    reply.author = req.user._id;
    reply.board = req.params.id;
    reply.parentComment = req.params.commentId;
    comment.hasReply = true;

    board.comments.push(reply);
    await reply.save();
    await comment.save();
    await board.save();

    if(req.user.id !== comment.author.id) { // 나 자신에게 쓴건 알림 안함.
        const newNotification = new Notification();
        newNotification.sender = req.user.id;
        newNotification.recipient = comment.author.id;
        newNotification.notificationType = 'commentReply';
        newNotification.postId = board.id;  // 댓글이 달린 게시물
        newNotification.commentId = comment.id; // 부모댓글 (연관 댓글이 뭔지 확인하려고)
        newNotification.replyId = reply.id; // 대댓글 (무슨 글썻지 확인하려고)
        await newNotification.save();
    }

    res.json({replyId:reply.id});
}));


router.put('/:commentId', isSignedIn, isCommentAuthor, catchAsync( async(req, res) => { // 댓글 수정
    const {commentId} = req.params;
    const countComment = await Comment.find({parentComment: commentId}).countDocuments();
    if(countComment > 1) {  // 해당 댓글에 이미 답변이 달렸을때.
        return res.json('nk');
    }
    await Comment.findByIdAndUpdate(commentId, req.body);
    res.send();
}));


router.delete('/:commentId', isSignedIn, isCommentAuthor, catchAsync( async(req, res) => {  // 댓글 삭제
    const {id, commentId} = req.params;
    const comment = await Comment.findById(commentId);
    if(!comment){
        return res.json('nk')
    }

    if(!comment._id.equals(comment.parentComment)) {   // 대댓글일때
        await Board.findByIdAndUpdate(id, {$pull: {comments: commentId}});  // 게시물에 저장된 댓글목록 지우고.
        await Comment.findByIdAndDelete(commentId); // 해당 댓글도 찾아서 지운다.
        await Notification.deleteMany({recipient:req.user.id}, {notificationType:'likeComment'}, {postId:id}, {replyId:commentId});   // 이 댓글로 받은 알림 다 삭제.
        await Notification.findOneAndDelete({sender:req.user.id, notificationType:'commentReply',  postId:id, commentId:comment.parentComment , replyId:commentId});  // 부모댓글 작성자에게 간 알림(1개) 삭제.
        await LikeComment.deleteMany({likedComment: commentId}, {relatedPost: id}); // 좋아요 삭제.
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
    } else {
        await Notification.deleteMany({recipient:req.user.id}, {notificationType:'likePost'}, {postId:id}, {commentId:commentId});   // 좋아요로 받은 알림 다 삭제.
        await Notification.deleteMany({recipient:req.user.id}, {notificationType:'commentReply'}, {postId:id}, {commentId:commentId});   // 대댓글로 받은 알림 다 삭제.
        await Notification.findOneAndDelete({sender:req.user.id, notificationType:'postComment',  postId:id, commentId:comment.parentComment});  // 댓글작성시 게시물 글쓴이에게 간 알림 삭제.
        await LikeComment.deleteMany({likedComment: commentId}, {relatedPost: id}); // 좋아요 삭제.
    }

    if(comment.hasReply) {  // 어떤 댓글이 hasReply가 true이면 대댓글이 있는 부모댓글임.
        await Board.findByIdAndUpdate(id, { $pull:{ comments: commentId } });
        comment.isDeleted = true;
        await comment.save();
    } else {
        await Board.findByIdAndUpdate(id, { $pull:{ comments: commentId } });
        await Comment.findByIdAndDelete(comment._id);
    }

    res.json('ok');
}));

router.get('/:commentId/commentLike', isSignedIn, catchAsync( async(req, res) => {
    const { id } = req.params;
    res.redirect(`/index/${id}`);
}));

router.post('/:commentId/commentLike', isSignedIn2, catchAsync( async(req, res) => {  // 댓글 좋아요.
    const { id ,commentId } = req.params;
    if(req.user) {
        
        const comment = await Comment.find({_id: commentId, likes: req.user._id});
        if(comment.length === 0) {
            const addLike = await Comment.findById(commentId).populate('author');
            const newLike = new LikeComment();

            newLike.user = req.user._id;
            newLike.likedComment = commentId;
            newLike.relatedPost = id;
            addLike.likes.push(req.user._id);
            await addLike.save();
            await newLike.save();

            if(addLike.author.id !== req.user.id) { // 자신의 글에 좋아요는 알림 안함.
                const newNotification = new Notification();
                newNotification.sender = req.user.id;
                newNotification.recipient = addLike.author.id;
                newNotification.notificationType = 'likeComment';
                newNotification.postId = id;  // 좋아요 달린 게시물
                newNotification.commentId = addLike.id; // 타이틀 확인
                await newNotification.save();
            }

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
            const newReport = new ReportComment();
            
            newReport.user = req.user._id;
            newReport.reportedComment = commentId;
            addReport.reports.push(req.user._id);
            await addReport.save();
            await newReport.save();

            return res.json('ok')
        }
        return res.json('exist')
    } else {
        return res.json('nk')
    }
}));


module.exports = router;