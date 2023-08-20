const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Board = require('./models/board');



const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/proj1');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected @ @");
})


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



app.get('/', (req, res) => {
    res.send('hello world!');
});

app.get('/index', async (req, res) => {
    const board = await Board.find({});
    res.render('board/index', {contents: board});
    // res.send('index page.');
});

app.get('/index/new', (req, res) => {
    res.render('board/new');
});

app.post('/index', async (req, res) => {    // post부분 진행중
    // const board = new Board(req.body.board);
    console.log(req.body);
    // await board.save();
    // res.redirect(`/index/${board._id}`);
    res.send('error or not');
})





app.listen(3000, () => console.log('PORT 3000....!!'));
