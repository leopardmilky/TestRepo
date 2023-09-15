const express = require('express');     
const router = express.Router({mergeParams: true});

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { validateComment, isSignedIn, isCommentAuthor } = require('../middleware');

const Board = require('../models/board');
const Comment = require('../models/comment');


router.post('/', catchAsync( async(req, res) => {

}));

router.delete('/:nestedCommentId', catchAsync( async(req, res) => {

}));

module.exports = router;