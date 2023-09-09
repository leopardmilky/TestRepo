const { boardSchema, commentSchema } =require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Board = require('./models/board');


module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        // 로그인이 필요하다는 알림 메세지 필요...
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
