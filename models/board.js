const mongoose = require('mongoose');
const Comment = require('./comment');
const LikePost = require('./likePost');
const LikeComment = require('./likeComment');
const Notification = require('./notification');
const ReportComment = require('./reportComment');
const ReportPost = require('./reportPost');
const Schema = mongoose.Schema;

const BoardSchema = new Schema({
    title: String,
    notice: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    mainText: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    images:[
        {
            type: Object,
        }
    ],
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
    views: {
        type: Number,
        default: 0
    }
});

BoardSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        // 게시물이 삭제되면: 1.댓글삭제, 2.좋아요삭제(게시물,댓글), 3.알림삭제, 4.(게시물,연관댓글)신고 삭제
        await Comment.deleteMany({_id: { $in: doc.comments }});
        await LikePost.deleteMany({likedPost: doc.id});
        await LikeComment.deleteMany({relatedPost: doc.id});
        await Notification.deleteMany({postId: doc.id});
        await ReportPost.deleteMany({reportedPost:doc.id});
        await ReportComment.deleteMany({relatedPost: doc.id});
    }
});

module.exports = mongoose.model('Board', BoardSchema);