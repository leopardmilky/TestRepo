const { boardSchema, commentSchema, nestedCommentSchema} =require('./schemas');
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
    // console.log("req", req);
    console.log("password???: ", password);
    const user = await User.findById(req.user._id);
    const auth = await user.authenticate(password);
    if(auth.user.email == req.user.email){
        next();
    } else {
        return res.redirect(`/index`)
    }
};

module.exports.validateNickname = (req, res, next) => {
    const userNick = {nickname: req.body.nickname};
    // const result = userNickname.validate('valid');
    if(result.error){
        console.log("result.error$#$#@: ",result.error);
    }
    console.log("result$#$#@: ", result);
}