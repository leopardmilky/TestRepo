const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CommentSchema = new Schema({
    body: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    board: {
        type: Schema.Types.ObjectId,
        ref: 'Board'
    },
    // nestedComments: [
    //     {
    //         type: Schema.Types.ObjectId,
    //         ref: 'NestedComment'
    //     }
    // ],
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    hasReply: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    reports: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ]
});

module.exports = mongoose.model('Comment', CommentSchema);