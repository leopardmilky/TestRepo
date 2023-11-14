const Joi = require('joi');

module.exports.boardSchema = Joi.object({
    board: Joi.object({     // board는 name="board[title]" 때문임.
        title: Joi.string().max(100).required(),
        mainText: Joi.string().max(5000).required()
    }).required()
});

module.exports.commentSchema = Joi.object({
    comment: Joi.object({
        body: Joi.string().max(3000).required()
    }).required()
});

module.exports.nestedCommentSchema = Joi.object({
    nestedComment: Joi.object({
        body: Joi.string().max(3000).required()
    }).required()
});

module.exports.userNickname = Joi.object({
    nickname: Joi.string().max(20)
});

// module.exports.userNickname = Joi.string().invalid('valid');