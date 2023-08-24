const mongoose = require('mongoose');
const Comment = require('./comment');
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

BoardSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Comment.deleteMany({
            _id: {
                $in: doc.comments
            }
        })
    }
});

module.exports = mongoose.model('Board', BoardSchema);