const User = require('../models/user');
const Board = require('../models/board');
const Comment = require('../models/comment');
const Notification = require('../models/notification');
const fs = require('fs');
const path = require('path');
const  { S3Client, PutObjectCommand } = require( '@aws-sdk/client-s3' );
const crypto = require('crypto');
const sharp = require('sharp');
const mongoose = require('mongoose');
require('dotenv').config();
const {sentences} = require('./text')

mongoose.connect('mongodb://127.0.0.1:27017/proj1');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected @ @");
});

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_S3_REGION
})

const randomImageName = (bytes = 16) => crypto.randomBytes(bytes).toString('hex');
const seedDB = async () => {
    const userIdObj = await User.find({}, '_id');
    const userIdArr = [];
    for(userId of userIdObj) {
        userIdArr.push(userId.id);
    }

    const files = fs.readdirSync('./image'); // 이미지 파일 목록
    for(let i = 1; i <= 150; i++ ) {  // 만들 게시물 수.
        const randomUserNumber = Math.floor(Math.random() * (userIdArr.length));
        const randomSentenceNumber = Math.floor(Math.random() * (sentences.length));
        const board = new Board();
        board.title = sentences[randomSentenceNumber];
        board.author = userIdArr[randomUserNumber];

        let imgIndex = {};
        let mainText = '';
        const randomImageNumber = Math.floor(Math.random() * 3) + 1;
        for(let i = 0; i < randomImageNumber; i++) {  // 게시물 당 이미지 수
            const imageBuffer = fs.readFileSync(`./image/${files[i]}`);  // 각 이미지 파일 버퍼
            const basename = path.basename(`./image/${files[i]}`);   // 파일 이름
            imgIndex[`${i}`] = basename;
            mainText += `<div><img class="imgSize" alt="${basename}" data-img-num="${i}"></div><br>`

            const maxwidth = 1920;
            const originalImage = await sharp(imageBuffer);
            const { width } = await originalImage.metadata();
            let buffer = imageBuffer;
            if( width > maxwidth ) { // 이미지가 너무 클 경우.
                buffer = await sharp(imageBuffer).resize({ width: 1920, height: 1080, fit: 'inside' }).toBuffer();
            } 

            const imageKey = `${userIdArr[randomUserNumber]}/${board.id}/${randomImageName()}${Buffer.from(basename, 'latin1').toString('utf8')}`
            const fileName = `${Buffer.from(basename, 'latin1').toString('utf8')}`

            for(let i = 0; i < Object.keys(imgIndex).length; i++) {
                if(imgIndex[i] == fileName){
                    imgIndex[i] = imageKey;
                }
            }
            const params = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: imageKey,
                Body: buffer,
                ContentType: 'image/jpeg'
            }
            const command = new PutObjectCommand(params);
            await s3.send(command);
        }

        mainText += `<div>${sentences[randomSentenceNumber]}</div>`
        board.mainText = mainText
        board.images.push(imgIndex);
        await board.save();

        //-----------------------------------------------------------------
        const probab = Math.random();
        let randomCommentCount;
        if(probab > 0.9) {
            randomCommentCount = Math.floor(Math.random() * 30) + 1;
        } else {
            randomCommentCount = Math.floor(Math.random() * 10) + 1;
        }
        for(let i = 0; i < randomCommentCount; i++) {  // 부모댓글
            const randomUserNumber = Math.floor(Math.random() * (userIdArr.length));
            const randomSentenceNumber = Math.floor(Math.random() * (sentences.length));
            const board2 = await Board.findById(board.id).populate('author');
            const comment = new Comment();
            comment.body = sentences[randomSentenceNumber];
            comment.author = userIdArr[randomUserNumber];
            comment.board = board2.id;
            comment.parentComment = comment.id;
            board2.comments.push(comment);
            await comment.save();
            await board2.save();
            if(board2.author.id !== userIdArr[randomUserNumber]) {
                const newNotification = new Notification();
                newNotification.sender = userIdArr[randomUserNumber];
                newNotification.recipient = board2.author.id;
                newNotification.notificationType = 'postComment';
                newNotification.commentId = comment.id;
                newNotification.postId = board2.id;
                await newNotification.save();
            }

            const probab = Math.random();
            if(probab > 0.9) {    // 대댓글
                let randomReplyCount = Math.floor(Math.random() * 10) + 1;
                for(let i = 0; i < randomReplyCount; i++) { 
                    const randomUserNumber = Math.floor(Math.random() * (userIdArr.length));
                    const randomSentenceNumber = Math.floor(Math.random() * (sentences.length));
                    const board3 = await Board.findById(board.id).populate('author');
                    const comment2 = await Comment.findById(comment.id).populate('author');
                    const reply = new Comment();
                    reply.body = sentences[randomSentenceNumber];
                    reply.author = userIdArr[randomUserNumber];
                    reply.board = board3.id;
                    reply.parentComment = comment2.id;
                    comment2.hasReply = true;
                    board3.comments.push(reply);
                    await reply.save();
                    await comment2.save();
                    await board3.save();

                    if(userIdArr[randomUserNumber] !== comment2.author.id) {
                        const newNotification = new Notification();
                        newNotification.sender = userIdArr[randomUserNumber];
                        newNotification.recipient = comment2.author.id;
                        newNotification.notificationType = 'commentReply';
                        newNotification.postId = board3.id;
                        newNotification.commentId = comment2.id;
                        newNotification.replyId = reply.id;
                        await newNotification.save();
                    }
                }
            }
        }
    }
}

seedDB()
.then(() => {
    console.log("SUCCESS")
    mongoose.connection.close();
})
.catch(() => {
    console.log("ERROR???????????????")
    mongoose.connection.close();
})