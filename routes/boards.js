const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const { isSignedIn, validateBoard, isAuthor } = require('../middleware');

const Board = require('../models/board');
const { paging } = require('../paging');



router.get('/', catchAsync(async (req, res) => {
    const { page } = req.query;
  try {
    const totalPost = await Board.countDocuments({});
    if (!totalPost) {
      throw Error();
    }
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } 
    = paging(page, totalPost);
    const board = await Board.find().sort({ createdAt: -1 }).skip(hidePost).limit(maxPost).populate('author');
    res.render("board/index", {
      contents: board,
      currentPage,
      startPage,
      endPage,
      maxPost,
      totalPage,
    });
    } catch (error) {
        res.render("board/index", { contents: board });
    }
}));

router.get('/new', isSignedIn, (req, res) => {
    res.render('board/new');
});

router.post('/', isSignedIn, validateBoard, catchAsync(async (req, res) => {
    const board = new Board(req.body.board);
    board.author = req.user._id;
    await board.save();
    // req.flash('success', '게시글 등록 완료!');
    res.redirect(`/index/${board._id}`);
}));

router.get('/:id', catchAsync(async (req, res) => {
    const board = await Board.findById(req.params.id).populate({path: 'comments', populate: {path:'author'}}).populate('author'); // populate()가 있어야 ref
    if(!board){
        return res.redirect('/index')
    }
    res.render('board/show', {items: board});
}));

router.get('/:id/edit', isSignedIn, isAuthor, catchAsync(async (req, res) => {
    const {id} = req.params;
    const board = await Board.findById(id);
    if(!board){
        return res.redirect('/index')
    }
    res.render('board/edit', {content: board});
}));

router.put('/:id', isSignedIn, isAuthor, validateBoard, catchAsync(async (req, res) => {
    const {id} = req.params;
    const board = await Board.findByIdAndUpdate(id, req.body.board); // {...req.body.board} ???
    res.redirect(`/index/${board._id}`);
}));

router.delete('/:id', isSignedIn, isAuthor, catchAsync(async (req, res) => {
    const {id} = req.params;
    await Board.findByIdAndDelete(id);
    res.redirect('/index');
}));

module.exports = router;
