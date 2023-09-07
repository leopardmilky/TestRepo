const Joi = require('joi');

module.exports.boardSchema = Joi.object({
    board: Joi.object({     // board는 name="board[title]" 때문임.
        title: Joi.string().max(50).required(),
        mainText: Joi.string().max(3000).required()
    }).required()
});

module.exports.commentSchema = Joi.object({
    comment: Joi.object({
        body: Joi.string().max(1000).required()
    }).required()
});