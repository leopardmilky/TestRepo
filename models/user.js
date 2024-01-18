const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    nickname: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['user', 'master', 'superman'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isWithdrawn: {
        type: Boolean,
        default: false
    },
    withdrawnDate: {
        type: Date
    }
});

UserSchema.plugin(passportLocalMongoose, {usernameField: 'email'});

module.exports = mongoose.model('User', UserSchema);