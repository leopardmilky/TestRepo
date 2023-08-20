const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/proj1');





app.get('/', (req, res) => {
    res.send('hello world!');
})

app.get('/index', (req, res) => {
    res.send('index page.');
});





app.listen(3000, () => console.log('PORT 3000....!!'))