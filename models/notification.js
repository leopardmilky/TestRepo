const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const NotificationSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    notificationType: {
        type: String,
        enum: ['postComment', 'commentReply', 'likePost', 'likeComment', 'note'],
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'Board',
    },
    commentId: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    },
    replyId: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    },
    noteId: {
        type: Schema.Types.ObjectId,
        ref: 'Note',
    }


});

module.exports = mongoose.model('Notification', NotificationSchema);