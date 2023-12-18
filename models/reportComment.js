const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportCommentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    reportedComment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }
});

module.exports = mongoose.model('ReportComment', ReportCommentSchema);