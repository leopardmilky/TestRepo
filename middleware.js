const { boardSchema, commentSchema, nestedCommentSchema, userNickname} =require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Board = require('./models/board');
const Comment = require('./models/comment');
const User = require('./models/user');
const NestedComment = require('./models/nestedComment');


module.exports.isSignedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        // 로그인이 필요하다는 알림 메세지 필요...?
        req.session.backTo = req.originalUrl

        return res.redirect('/signin');
    }
    next();
};

module.exports.isAuthor = async(req, res, next) => {
    const {id} = req.params;
    const check = await Board.findById(id);
    if(!check){
        return res.redirect('/index')
    }
    if(!check.author.equals(req.user._id)){
        return res.redirect(`/index/${id}`)
    }
    next();
};

module.exports.isCommentAuthor = async(req, res, next) => {
    const {id, commentId} = req.params;
    const check = await Comment.findById(commentId);
    if(!check){
        return res.redirect('/index')
    }
    if(!check.author.equals(req.user._id)){
        return res.redirect(`/index/${id}`)
    }
    next();
};

module.exports.isNestedCommentAuthor = async(req, res, next) => {
    const {id, nestedCommentId} = req.params;
    const check = await NestedComment.findById(nestedCommentId);
    if(!check){
        return res.redirect('/index')
    }
    if(!check.author.equals(req.user._id)){
        return res.redirect(`/index/${id}`)
    }
    next();
}

module.exports.validateBoard = (req, res, next) => {
    const {error} = boardSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};

module.exports.validateComment = (req, res, next) => {
    const {error} = commentSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};

module.exports.validateNestedComment = (req, res, next) => {
    const {error} = nestedCommentSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};

module.exports.verifyUser = async(req, res, next) => {
    const { password, error } = req.body;
    const user = await User.findById(req.user._id);
    const auth = await user.authenticate(password);
    if(auth.user.email == req.user.email){
        next();
    } else {
        return res.redirect(`/index`)
    }
};

module.exports.validateNickname = async(req, res, next) => {
    const afterNick = req.body.nickname;
    const beforeNick = req.user.nickname;
    const {error} = userNickname.validate({nickname:afterNick});
    if(error){
        return res.staus(400).json('length');
    }

    const pattern = /^[a-zA-Z0-9가-힣_\-]*$/gim;        // 알파벳, 한글, 숫자, 언더바(_), 하이픈(-)만 허용.
    const result = pattern.test(afterNick);    // 허용 패턴과 일치하면 true반환.

    console.log("afterNick.length: ", afterNick.length);

    if(!result){    // 닉네임 허용 패턴에 부합하지 않는 경우.
        return res.status(400).json('pattern');
    }

    if(afterNick != beforeNick){ // 닉네임이 다른 유저와 중복되는 경우.
        const reslt = await User.find({nickname:afterNick});
        if(reslt.length > 0){
            return res.status(400).json('nk');
        }
    }
    next();
}

module.exports.validatePassword = (req, res, next) => {
    const password = req.body.password;
    const confirmPwd = req.body.confirmPwd;
    if(password.length == 0 && confirmPwd.length == 0){
        return next();
    }
    if(password != confirmPwd || password.length < 6 || confirmPwd.length < 6){
        return res.status(400).json('ne');
    }
}