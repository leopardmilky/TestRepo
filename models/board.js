const mongoose = require('mongoose');
// const Comment = require('./comment');
const Schema = mongoose.Schema;

const BoardSchema = new Schema({
    title: String,
    createdAt: { // 날짜 관련 moment.js?
        type: Date,
        default: Date.now
    },
    update: Date,
    nickname: String,
    mainText: String,
    comment: [
        {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

module.exports = mongoose.model('Board', BoardSchema);