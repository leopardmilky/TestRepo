const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const NoteSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: String,
        required: true
    },
    sentAt: {
        type: Date,
        default: Date.now
    },
    read: { 
        type: Boolean,
        default: false 
    },
    readAt: { 
        type: Date 
    },
    senderSaved: {
        type: Boolean,
        default: false 
    },
    recipientSaved:{
        type: Boolean,
        default: false 
    },
    senderDeleted: {
        type: Boolean,
        default: false 
    },
    recipientDeleted:{
        type: Boolean,
        default: false 
    }
});

module.exports = mongoose.model('Note', NoteSchema);