const express = require('express');     
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { validateComment, isSignedIn, isSignedIn2, isCommentAuthor } = require('../middleware');
const comments = require('../controllers/comments')



router.post('/', isSignedIn, validateComment, catchAsync(comments.createComment));
router.post('/:commentId', isSignedIn, validateComment, catchAsync(comments.createReply));
router.put('/:commentId', isSignedIn, isCommentAuthor, validateComment, catchAsync(comments.modifyComment));
router.delete('/:commentId', isSignedIn, isCommentAuthor, catchAsync(comments.deleteComment));
router.post('/:commentId/commentLike', isSignedIn2, catchAsync(comments.likeComment));
router.post('/:commentId/commentReport', isSignedIn2, catchAsync(comments.reportComment));


router.get('/:commentId/commentLike', (req, res) => {
    const { id } = req.params;
    res.redirect(`/index/${id}`);
});

router.get('/:commentId/commentReport', (req, res) => {
    const { id } = req.params;
    res.redirect(`/index/${id}`);
});

module.exports = router;