const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Board = require('./models/board');


const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/proj1');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected @ @");
});

app.use(express.urlencoded({ extended: true})); // POST 파싱.
app.use(methodOverride('_method')); // 반드시 '_method'로 쓸 필요없음.
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



app.get('/', (req, res) => {
    res.send('hello world!');
});

app.get('/index', async (req, res) => {
    const board = await Board.find({});
    res.render('board/index', {contents: board});
});

app.get('/index/new', (req, res) => {
    res.render('board/new');
});

app.post('/index', async (req, res) => {
    const board = new Board(req.body.board);
    await board.save();
    res.redirect(`/index/${board._id}`);
});

app.get('/index/:id', async (req, res) => {
    const board = await Board.findById(req.params.id);
    // console.log(board);
    res.render('board/show', {items: board});
});

app.get('/index/:id/edit', async (req, res) => {
    const board = await Board.findById(req.params.id);
    res.render('board/edit', {content: board});
});

app.put('/index/:id', async (req, res) => {
    const {id} = req.params;
    const board = await Board.findByIdAndUpdate(id, req.body.board); // {...req.body.board} ???
    res.redirect(`/index/${board._id}`);
});

app.delete('/index/:id', async (req, res) => {
    const {id} = req.params;
    await Board.findByIdAndDelete(id);
    res.redirect('/index');
});

app.listen(3000, () => console.log('PORT 3000....!!'));
