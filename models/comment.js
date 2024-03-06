const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CommentSchema = new Schema({
    body: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    board: {
        type: Schema.Types.ObjectId,
        ref: 'Board',
        required: true
    },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    reports: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        required: true
    },
    hasReply: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Comment', CommentSchema);