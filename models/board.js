const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BoardSchema = new Schema({
    title: String,
    register: Date,
    update: Date,
    nickname: String,
    mainText: String,
});

module.exports = mongoose.model('Board', BoardSchema);