const mongoose = require('mongoose');
const Comment = require('./comment');
const ReportComment = require('./reportComment');
const NestedComment = require('./nestedComment');
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
    ]
});

BoardSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await ReportComment.deleteMany({reportedComment: { $in: doc.comments }})
        await Comment.deleteMany({_id: { $in: doc.comments }})
        await NestedComment.deleteMany({board: doc._id})
    }
});

module.exports = mongoose.model('Board', BoardSchema);