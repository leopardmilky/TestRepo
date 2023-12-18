const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LikeCommentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    likedComment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }
});

module.exports = mongoose.model('LikeComment', LikeCommentSchema);