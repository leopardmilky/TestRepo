const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isSignedIn, validateBoard, isAuthor } = require('../middleware');
const Board = require('../models/board');
const Comment = require('../models/comment');
const NestedComment = require('../models/nestedComment');
const { boardPaging } = require('../paging');
const multer = require('multer');
const  { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand }  =  require( '@aws-sdk/client-s3' );
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require('crypto');
const sharp = require('sharp');
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
        const board = await Board.find().sort({ notice: -1, createdAt: -1 }).skip(hidePost).limit(maxPost).populate({path: 'comments', populate: {path: 'nestedComments'}}).populate('author');
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
    board.notice = req.body.notice;

    const imgIndex = JSON.parse(req.body.imgIndex);
    for(let i = 0; i < req.files.length; i++) {

        const maxwidth = 1920;
        const originalImage = await sharp(req.files[i].buffer);
        const { width } = await originalImage.metadata();
        let buffer = req.files[i].buffer;
        if( width > maxwidth ) {
            buffer = await sharp(req.files[i].buffer).resize({ width: 1920, height: 1080, fit: 'inside' }).toBuffer();
        } 
        
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
            Body: buffer,
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
    console.log("req.cookies?: ", req.cookies);
    console.log("req.session?: ", req.session);
    console.log("req.ip?: ", req.ip);
    const { id } = req.params;
    const board = await Board.findById(id).populate({path: 'comments', populate: {path:'author'}}).populate('author'); // populate()가 있어야 ref
    const comment = await Comment.find({ board:id }).sort({ createdAt: 1 }).populate({path: 'nestedComments', populate: {path: 'author'}}).populate('author'); // sort({ createdAt: -1 }) 이거 필요없나...?
    const nestedComment = await NestedComment.find({board:id});
    const commentSum = board.comments.length + nestedComment.length;


    const sortTest = await NestedComment.find({board:id}).sort({comment:1, createdAt:1});
    console.log("sortTest: ", sortTest);


    // const pagePerPost = 5;
    // const lastPageContents = commentSum%pagePerPost;    // 마지막 페이지에 있어야할 댓글 개수
    // const allPage = Math.ceil(commentSum/pagePerPost);   
    // console.log("comment:", comment);
    // console.log("comment.length:", comment.length);
    // console.log("allPage:", allPage);
    // console.log("lastPageContents:", lastPageContents);
    // console.log("comment[comment.length-1]:", comment[comment.length-1]);
    // console.log("comment[comment.length-1].nestedComments.length:", comment[comment.length-1].nestedComments.length);
    // console.log("comment[0].nestedComments:", comment[0].nestedComments.slice(-2));

    // 첫 로딩시
    // 만약 1 + comment[comment.length-1].nestedComments.length < lastPageContents 라면
    // let needComment += 1 + comment[comment.length-1].nestedComments.length; // 1+0

    // 그러다가 1 + comment[comment.length-2].nestedComments.length = lastPageContents - needComment가 되거나
    // 1 + comment[comment.length-2].nestedComments.length > lastPageContents - needComment가 되면...  1+6 > 3
        // =일때: limit(2)
        // >일때: comment[comment.length-2].nestedComments.length - lastPageContents - needComment = 2
            //  comment[comment.length-2].nestedComments.slice(-2);



    // const comment2 = await Comment.find({ board:id }).sort({ createdAt: 1 }).populate({path: 'nestedComments', populate: {path: 'author'}}).populate('author'); // sort({ createdAt: -1 }) 이거 필요없나...?
    // console.log("comment2: ", comment2);
    // console.log("comment2: ", comment2[0].nestedComments);
    // const pagePerPost = 5;                                  // 페이지당 보여줄 댓글 개수
    // const lastPageContents = commentSum%pagePerPost;        // 마지막 페이지에 있어야할 댓글 개수
    // const allPage = Math.ceil(commentSum/pagePerPost);      // 총 페이지
    // let countedComment = 0;
    // let commentNum = 0;
    // let comment2_result;
    
    // console.log("부모댓글길이: ", comment2.length);
    // console.log("총 페이지: ", allPage);
    // console.log("마지막 페이지 댓글수:", lastPageContents);
    
    // // 첫 로딩시
    // for(let i = 0; i <= comment2.length; i++){
    //     if( 1 + comment2[i].nestedComments.length < lastPageContents - countedComment ){
    //         countedComment += 1 + comment2[i].nestedComments.length;
    //         commentNum = i+1;
    //     } else {
    //         break;
    //     }
    // }

    // // =일때
    // if(1 + comment2[commentNum].nestedComments.length == lastPageContents - countedComment) {
    //     comment2_result = comment2[commentNum];
    // }

    // // >일때
    // if(1 + comment2[commentNum].nestedComments.length > lastPageContents - countedComment) {
    //     comment2_result = comment2[commentNum].nestedComments.slice(-(lastPageContents - countedComment));
    // }

    // console.log("comment2_result1111: ", )
    // console.log("comment2_result2222: ", comment2_result);


    // const commentPaging = await Comment.find({ board:id }).populate('nestedComments');
    // const commentPaging = await Comment.find({ board:id });
    // console.log("commentPaging: ", commentPaging);

    // const boardId = new mongoose.Types.ObjectId(req.params.id);
    // const content = await Comment.aggregate([
    //     {
    //       $match: {
    //         board: boardId// 필요한 게시물의 ID로 바꾸세요.
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: "nestedcomments", // 대댓글이 저장된 컬렉션 이름
    //         localField: "nestedComments",
    //         foreignField: "_id",
    //         as: "nestedComments"
    //       }
    //     },
    //     {
    //       $addFields: {
    //         allComments: { $concatArrays: ["$nestedComments", ["$$ROOT"]] }
    //       }
    //     },
    //     {
    //       $unwind: "$allComments"
    //     },
    //     {
    //       $replaceWith: "$allComments"
    //     },
    //     {
    //       $sort: { createdAt: 1 }
    //     },
    //     {
    //       $skip: 0
    //     },
    //     {
    //       $limit: 10
    //     }
    //   ]);
    // console.log("content: ", content);


    // 1. $match 게시물에 해당하는 댓글 찾기.
    // 2. $lookup nestedComment, nestedComment-author, author 값 가져오기.
    // 3. 그다음은 
    // const boardId = new mongoose.Types.ObjectId(req.params.id);
    // const comments = await Comment.aggregate([
    //     {
    //         $match:{
    //             board:boardId
    //         }
    //     },
    //     { 
    //         $lookup:{
    //             from:"nestedcomments", 
    //             localField:"_id", 
    //             foreignField:"comment", 
    //             as: "all_comments"
    //         }
    //     },
    //     {
    //         $unwind: "$all_comments" // 배열을 풀어서 각 댓글과 대댓글을 개별 도큐먼트로 만듦
    //     },
    //     {
    //         $skip: 0 // 건너뛸 댓글 수 (페이징)
    //     },
    //     {
    //         $limit: 10 // 가져올 댓글 수 (페이징)
    //     },
            // {
            //     $project: {
            //         allComments: 1
            //     }
            // },
    // ]);
    // console.log("BOARD_ID@@@@@@@@@@@: ", boardId);
    // console.log("comments@@@@@@@@@@@: ", comments);

    // for(let comment of comments){
    //     console.log("comment._id: ", comment._id);
    // }
    // console.log("COUNT_id: ", )

    // const boardId = new mongoose.Types.ObjectId(req.params.id);
    // const bods = await Board.aggregate([
    //     {
    //       $match: { _id: boardId } // 특정 게시판에 대한 검색
    //     },
    //     {
    //       $lookup: {
    //         from: "comments",
    //         localField: "_id",
    //         foreignField: "board",
    //         as: "comments" // comments 컬렉션과 연결하여 댓글을 가져옴
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: "nestedcomments",
    //         localField: "_id",
    //         foreignField: "board",
    //         as: "nestedComments" // nestedComments 컬렉션과 연결하여 대댓글을 가져옴
    //       }
    //     },
    //     {
    //       $project: {
    //         allComments: {
    //           $concatArrays: ["$comments", "$nestedComments"]
    //         } // 댓글과 대댓글을 하나의 배열에 합침
    //       }
    //     },
    //     {
    //       $unwind: "$allComments" // 배열을 풀어서 각 댓글과 대댓글을 개별 도큐먼트로 만듦
    //     },
    //     {
    //       $skip: 0 // 건너뛸 댓글 수 (페이징)
    //     },
    //     {
    //       $limit: 10 // 가져올 댓글 수 (페이징)
    //     }
    //   ]);
    //   console.log("bods: ", bods);


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

    // res.render('board/show', { boardItems: board, commentItems:comment, commentSum, boardImg});
    res.render('board/show2', { boardItems: board, commentItems:comment, commentSum, boardImg});
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
                
                // 리사이징, s3업로드
                const maxwidth = 1920;
                const originalImage = await sharp(req.files[i].buffer);
                const { width } = await originalImage.metadata();
                let buffer = req.files[i].buffer;
                if( width > maxwidth ) {
                    buffer = await sharp(req.files[i].buffer).resize({ width: 1920, height: 1080, fit: 'inside' }).toBuffer();
                } 
                const params = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: imageKey,
                    Body: buffer,
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

router.delete('/:id', isSignedIn, isAuthor, catchAsync( async(req, res) => {
    const {id} = req.params;
    const board = await Board.findById(id);
    const boardImg = board.images[0];

    console.log("boardImg: ", boardImg);
    // s3삭제
    for(let img in boardImg) {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: boardImg[img],
        }
        const command = new DeleteObjectCommand(params);
        await s3.send(command);
    }

    await Board.findByIdAndDelete(id);
    res.redirect('/index');
}));

module.exports = router;


