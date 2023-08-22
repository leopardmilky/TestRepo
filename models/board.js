const mongoose = require('mongoose');
// const Comment = require('./comment');
const Schema = mongoose.Schema;

const BoardSchema = new Schema({
    title: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    nickname: String,
    mainText: String,
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

module.exports = mongoose.model('Board', BoardSchema);