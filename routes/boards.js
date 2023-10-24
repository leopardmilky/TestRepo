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
const  { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand }  =  require( '@aws-sdk/client-s3' );
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const multerS3 = require('multer-s3');
// const aws = require('aws-sdk');
const crypto = require('crypto');
require('dotenv').config();


const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_S3_REGION
})
const storage = multer.memoryStorage()
const upload = multer({storage: storage})
const randomImageName = (bytes = 16) => crypto.randomBytes(bytes).toString('hex');


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

router.post('/', isSignedIn, upload.array('images', 5), catchAsync( async(req, res) => {

    const board = new Board();
    board.title = req.body.title;
    board.mainText = req.body.mainText;
    board.author = req.user._id;

    const imgIndex = JSON.parse(req.body.imgIndex);
    for(let i = 0; i < req.files.length; i++) {
        const imageKey = `${req.user._id}/${board.id}/${randomImageName()}${Buffer.from(req.files[i].originalname, 'latin1').toString('utf8')}`
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

    const boardImgObject = {};
    for(let i = 0; i < Object.keys(board.images[0]).length; i++) {
        const getObjectParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: board.images[0][i]
        }
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3 });
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

// edit 페이지 v2
router.get('/:id/edit2', isSignedIn, isAuthor, catchAsync( async(req, res) => {
    const {id} = req.params;
    const board = await Board.findById(id);

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
        return res.redirect('/index')
    }
    res.render('board/edit2', {content: board, boardImg});
}));

router.put('/:id', isSignedIn, isAuthor, upload.array('images', 5), catchAsync( async(req, res) => {

    const { id } = req.params;
    const board = await Board.findById(id);

    board.title = req.body.title;
    board.mainText = req.body.mainText;

    // 새로 추가된 이미지 파일 s3 업로드
    const imgIndex = JSON.parse(req.body.imgIndex);
    const uploadImages = {}
    for(let i = 0; i < req.files.length; i++) {     
        const fileName = Buffer.from(req.files[i].originalname, 'latin1').toString('utf8');
        for(let index in imgIndex) {
            if(imgIndex[index] == fileName) {
                uploadImages[index] = `${req.user._id}/${board.id}/${randomImageName()}${fileName}`;
                const imageKey = uploadImages[index];
                delete imgIndex[index];
                // s3업로드
                const params = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: imageKey,
                    Body: req.files[i].buffer,
                    ContentType: req.files[i].mimetype
                }
                const command = new PutObjectCommand(params);
                await s3.send(command);
            }
        }
    }

    // DB 이미지 주소 업데이트
    const DBIndex = board.images[0];
    for(let index in DBIndex){
        for(let newIndex in imgIndex){
            const newImgIndex = DBIndex[index].indexOf(imgIndex[newIndex]);
            if(newImgIndex != -1) {
                uploadImages[newIndex] = DBIndex[index];
            }
        }
    }
    board.images[0] = uploadImages;
    await board.save();

    // s3 이미지 삭제
    for (let index in DBIndex) {
        for(let newIndex in uploadImages) {
            if(DBIndex[index] == uploadImages[newIndex]){
                delete DBIndex[index]
            }
        }
    }
    for(let index in DBIndex) {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: DBIndex[index],
        }
        const command = new DeleteObjectCommand(params);
        await s3.send(command);
    }
    res.json(board.id);
}));

// router.put('/:id', isSignedIn, isAuthor, validateBoard, catchAsync( async(req, res) => {
//     const {id} = req.params;
//     const board = await Board.findByIdAndUpdate(id, req.body.board); // {...req.body.board} ???
//     res.redirect(`/index/${board._id}`);
// }));

router.delete('/:id', isSignedIn, isAuthor, catchAsync( async(req, res) => {
    const {id} = req.params;
    await Board.findByIdAndDelete(id);
    res.redirect('/index');
}));

module.exports = router;


