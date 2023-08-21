const mongoose = require('mongoose');
// const Comment = require('./comment');
const Schema = mongoose.Schema;

const BoardSchema = new Schema({
    title: String,
    createdAt: {
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