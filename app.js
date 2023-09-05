const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
// const moment = require('moment');
const Joi = require('joi'); // Joi => JavaScript 유효성 검사 도구.
const Board = require('./models/board');
const Comment = require('./models/comment');
const { paging } = require('./paging');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/proj1');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected @ @");
});

app.use(express.urlencoded({ extended: true})); // POST 파싱.
app.use(methodOverride('_method')); // 반드시 '_method'로 쓸 필요없음.
app.use(express.static(path.join(__dirname, 'public')));
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/', (req, res) => {
    res.redirect('/index');
});

app.get('/index', catchAsync(async (req, res) => {
    const { page } = req.query;
  try {
    const totalPost = await Board.countDocuments({});
    if (!totalPost) {
      throw Error();
    }
    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } 
    = paging(page, totalPost);
    const board = await Board.find().sort({ createdAt: -1 }).skip(hidePost).limit(maxPost);
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

app.get('/index/new', (req, res) => {
    res.render('board/new');
});

app.post('/index', catchAsync(async (req, res) => {
    const board = new Board(req.body.board);
    await board.save();
    res.redirect(`/index/${board._id}`);
}));

app.get('/index/:id', catchAsync(async (req, res) => {
    const board = await Board.findById(req.params.id).populate('comments'); // populate()가 있어야 ref
    res.render('board/show', {items: board});
}));

app.get('/index/:id/edit', catchAsync(async (req, res) => {
    const board = await Board.findById(req.params.id);
    res.render('board/edit', {content: board});
}));

app.put('/index/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    const board = await Board.findByIdAndUpdate(id, req.body.board); // {...req.body.board} ???
    res.redirect(`/index/${board._id}`);
}));

app.delete('/index/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    await Board.findByIdAndDelete(id);
    res.redirect('/index');
}));

app.post('/index/:id/comments', catchAsync(async (req, res) => {
    const board = await Board.findById(req.params.id);
    const comment = new Comment(req.body.comment);
    board.comments.push(comment);
    await comment.save();
    await board.save();
    res.redirect(`/index/${board._id}`);
}));

app.delete('/index/:id/comments/:commentId', catchAsync(async(req, res) => {
    const {id, commentId} = req.params;
    await Board.findByIdAndUpdate(id, {$pull: {comments: commentId}});
    await Comment.findByIdAndDelete(req.params.commentId);
    res.redirect(`/index/${id}`);
}));

app.get('/register', (req, res) => {
    res.render('users/register');
});

app.get('/login', (req, res) => {
    res.render('users/login');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh, Something Went Wrong!!';
    res.status(statusCode).render('error', {err});
});

app.listen(3000, () => console.log('PORT 3000....!!'));
