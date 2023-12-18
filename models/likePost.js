const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LikePostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    likedPost: {
        type: Schema.Types.ObjectId,
        ref: "Board"
    }
});

module.exports = mongoose.model('LikePost', LikePostSchema);