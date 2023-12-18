const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportPostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    reportedPost: {
        type: Schema.Types.ObjectId,
        ref: "Board"
    }
});

module.exports = mongoose.model('ReportPost', ReportPostSchema);