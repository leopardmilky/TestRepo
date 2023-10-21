const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isSignedIn, validateBoard, isAuthor } = require('../middleware');
const Board = require('../models/board');
const Comment = require('../models/comment');
const NestedComment = require('../models/nestedComment');
const { boardPaging } = require('../paging');
const multer = require('multer');
// const upload = multer({dest: 'uploads/'});
// const upload = require('../module/multer');
const  { S3Client, PutObjectCommand, GetObjectCommand }  =  require( '@aws-sdk/client-s3' );
const { getSignedUrl, S3RequestPresigner } = require("@aws-sdk/s3-request-presigner");

const multerS3 = require('multer-s3');
// const aws = require('aws-sdk');
const crypto = require('crypto');
require('dotenv').config();







const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

router.get('/', catchAsync( async(req, res) => {
    const { page } = req.query;
    try {
        const totalPost = await Board.countDocuments({});
        if (!totalPost) {
            throw Error();
        }
        let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } = boardPaging(page, totalPost);
        const board = await Board.find().sort({ createdAt: -1 }).skip(hidePost).limit(maxPost).populate({path: 'comments', populate: {path: 'nestedComments'}}).populate('author');
        res.render("board/index", {
            contents: board,
            currentPage,
            startPage,
            endPage,
            maxPost,
            totalPage,
        });
    } catch (error) {
        res.render("board/index", { contents: board });
    }
}));

router.get('/new', isSignedIn, (req, res) => {
    res.render('board/new');
});

router.get('/new2', isSignedIn, (req, res) => {
    res.render('board/new2');
});


// router.post('/', isSignedIn, catchAsync( async(req, res) => {
//         const board = new Board(req.body.board);
//         board.author = req.user._id;
//         await board.save();
//         // res.redirect(`/index/${board._id}`);
        
//         console.log("req.body: ", req.body);
//         // console.log("req.body.text: ", req.body.text); 
//         // console.log("req.body.image: ", req.body.image);
//         // console.log("req: ", req);
    
//         // res.redirect(`/index`);
//         console.log("POST_boardId: ", board.id)
//         res.json(board.id);
//         // res.send("????");
// }));


const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_S3_REGION
})

const storage = multer.memoryStorage()
const upload = multer({storage: storage})
router.post('/', isSignedIn, upload.array('images', 5), catchAsync( async(req, res) => {

    const board = new Board();
    board.title = req.body.title;
    board.mainText = req.body.mainText;
    board.author = req.user._id;

    const imgIndex = JSON.parse(req.body.imgIndex);
    for(let i = 0; i < req.files.length; i++) {
        const imageKey = `${req.user._id}/${randomImageName()}${Buffer.from(req.files[i].originalname, 'latin1').toString('utf8')}`
        const fileName = `${Buffer.from(req.files[i].originalname, 'latin1').toString('utf8')}`

        for(let i = 0; i < Object.keys(imgIndex).length; i++) {
            if(imgIndex[i] == fileName){
                imgIndex[i] = imageKey;
            }
        }
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: imageKey,
            Body: req.files[i].buffer,
            ContentType: req.files[i].mimetype
        }
        const command = new PutObjectCommand(params);
        await s3.send(command);
    }

    board.images.push(imgIndex);
    await board.save();
    
    res.json(board.id);
}));


router.get('/:id', catchAsync( async(req, res) => {
    const { id } = req.params;
    const board = await Board.findById(id).populate({path: 'comments', populate: {path:'author'}}).populate('author'); // populate()가 있어야 ref
    const comment = await Comment.find({ board:id }).populate({path: 'nestedComments', populate: {path: 'author'}}).populate('author');
    const nestedComment = await NestedComment.find({board:id});
    const commentSum = board.comments.length + nestedComment.length;

    // const commentPaging = await Comment.find({ board:id }).populate('nestedComments');

    const commentPaging = await Comment.aggregate([{$unwind:"$nestedComments"}]);

    const boardImgObject = {}
    for(let i = 0; i < Object.keys(board.images[0]).length; i++) {
        const getObjectParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: board.images[0][i]
        }
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command);
        boardImgObject[i] = url;
    }

    const boardImg = JSON.stringify(boardImgObject);

    if(!board){
        return res.redirect('/index');
    }

    res.render('board/show', { boardItems: board, commentItems:comment, commentSum, boardImg});
}));



router.get('/:id/edit', isSignedIn, isAuthor, catchAsync( async(req, res) => {
    const {id} = req.params;
    const board = await Board.findById(id);
    if(!board){
        return res.redirect('/index')
    }
    res.render('board/edit', {content: board});
}));

router.put('/:id', isSignedIn, isAuthor, validateBoard, catchAsync( async(req, res) => {
    const {id} = req.params;
    const board = await Board.findByIdAndUpdate(id, req.body.board); // {...req.body.board} ???
    res.redirect(`/index/${board._id}`);
}));

router.delete('/:id', isSignedIn, isAuthor, catchAsync( async(req, res) => {
    const {id} = req.params;
    await Board.findByIdAndDelete(id);
    res.redirect('/index');
}));

module.exports = router;


