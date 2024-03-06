const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LikePostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    likedPost: {
        type: Schema.Types.ObjectId,
        ref: "Board",
        required: true
    }
});

module.exports = mongoose.model('LikePost', LikePostSchema);