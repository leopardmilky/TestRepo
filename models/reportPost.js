const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportPostSchema = new Schema({
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
    reportedPost: {
        type: Schema.Types.ObjectId,
        ref: "Board",
        required: true
    }
});

module.exports = mongoose.model('ReportPost', ReportPostSchema);