const mongoose = require('mongoose');
const Comment = require('./comment');
const NestedComment = require('./nestedComment');
const Schema = mongoose.Schema;

const BoardSchema = new Schema({
    title: String,
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
    ]
});

BoardSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Comment.deleteMany({_id: {$in: doc.comments}})
        await NestedComment.deleteMany({board: doc._id})
    }
});

module.exports = mongoose.model('Board', BoardSchema);