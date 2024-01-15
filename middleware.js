const { boardSchema, commentSchema, userNickname} =require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Board = require('./models/board');
const Comment = require('./models/comment');
const User = require('./models/user');


module.exports.isSignedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        // 로그인이 필요하다는 알림 메세지 필요...?
        req.session.backTo = req.originalUrl
        return res.redirect('/signin');
    }
    next();
};

module.exports.isSignedIn2 = (req, res, next) => {  // 좋아요, 신고 버튼 클릭 시 로그인 안되어 있을때.
    if(!req.isAuthenticated()) {
        req.session.backTo = req.originalUrl
        return res.json('nk');
    }
    next();
};

module.exports.notSignedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        return res.redirect('/index');
    }
    next();
}

module.exports.isAdmin = (req, res, next) => {
    if(req.user.role !== 'master' && req.user.role !== 'superman') {
        return res.redirect('/index');
    }
    next();
};

module.exports.isRoot = (req, res, next) => {
    if(req.user.role === 'superman') {  
        return next();
    }
    res.redirect('/index');
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
        return res.redirect('/index');
    }
    if(!check.author.equals(req.user._id)){
        return res.redirect(`/index/${id}`)
    }
    next();
};

module.exports.validateBoard = (req, res, next) => {
    console.log("req.body@@@@@@@@: ", req.body);
    console.log("req.body.title@@@@@@@@: ", req.body.title);
    console.log("req.body.mainText@@@@@@@@: ", req.body.mainText);
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
        return res.json('nk')
    } else {
        next();
    }
};

module.exports.verifyUser = async(req, res, next) => {
    const { password, error } = req.body;
    // const user = await User.findById(req.user._id);
    const auth = await req.user.authenticate(password);
    if(auth.user.email == req.user.email){
        next();
    } else {
        return res.redirect(`/index`)
    }
};

module.exports.validateNickname = async(req, res, next) => {
    const afterNick = req.body.nickname;
    const beforeNick = req.user.nickname;
    // const {error} = userNickname.validate({nickname:afterNick});
    if(afterNick.length === 0 || afterNick.length > 20) {
        return res.status(400).json('length');
    }

    const pattern = /^[a-zA-Z0-9가-힣_\-]*$/gim;        // 알파벳, 한글, 숫자, 언더바(_), 하이픈(-)만 허용.
    const result = pattern.test(afterNick);    // 허용 패턴과 일치하면 true반환.
    if(!result){    // 닉네임 허용 패턴에 부합하지 않는 경우.
        return res.status(400).json('pattern');
    }
    if(afterNick !== beforeNick){ // 기존 닉네임 변경 감지
        const reslt = await User.find({nickname:afterNick});    // 중복확인
        if(reslt.length > 0){
            return res.status(400).json('nk');
        }
    }
    next();
}

module.exports.validatePassword = async (req, res, next) => {
    const {password, confirmPwd} = req.body;
    
    if(!password && !confirmPwd) {
        return next();
    }
    if(password != confirmPwd || password.length < 6 || confirmPwd.length < 6) {
        return res.status(400).json('ne');
    }
    next();
}

module.exports.withdrawPermission = (req, res, next) => {
    if(req.session.canAccessWithdraw){
        return next();
    } else {
        return res.redirect(`/index`)
    }
}

module.exports.withdrawVerifycodePermission = (req, res, next) => {
    if(req.session.canAccessWithdrawVerifycode){
        return next();
    } else {
        return res.redirect(`/index`)
    }
}

module.exports.deleteUserPermission = (req, res, next) => {
    if(req.session.canAccessDeleteUser){
        return next();
    } else {
        return res.redirect(`/index`)
    }
}