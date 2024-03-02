const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isSignedIn, isSignedIn2, validateBoard, isAuthor } = require('../middleware');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage: storage});
const boards = require('../controllers/boards');

router.get('/', catchAsync(boards.index));
router.get('/new2', isSignedIn, boards.renderNewForm);
router.post('/', isSignedIn, upload.array('images', 5), validateBoard, catchAsync(boards.createPost));
router.get('/:id', catchAsync(boards.showBoard));
router.post('/:id', catchAsync(boards.loadComments));
router.post('/:id/postLike', isSignedIn2, catchAsync(boards.likePost));
router.post('/:id/postReport', isSignedIn2, catchAsync(boards.reportPost));
router.get('/:id/edit2', isSignedIn, isAuthor, catchAsync(boards.renderEditForm));
router.put('/:id', isSignedIn, isAuthor, upload.array('images', 5), validateBoard, catchAsync(boards.modifyPost));
router.delete('/:id', isSignedIn, isAuthor, catchAsync(boards.deletePost));

router.get('/:id/postLike', (req, res) => {    // 비로그인 상태에서 신고버튼 누르고 로그인 후 보고있던 페이지로 리다이렉트 (안그럼 post라우트로감)
    const { id } = req.params;
    res.redirect(`/index/${id}`);
});

router.get('/:id/postReport', (req, res) => {
    const { id } = req.params;
    res.redirect(`/index/${id}`);
});

module.exports = router;