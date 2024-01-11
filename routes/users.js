const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isSignedIn, notSignedIn, verifyUser, validateNickname, validatePassword, withdrawPermission, withdrawVerifycodePermission, deleteUserPermission } = require('../middleware');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const Board = require('../models/board');
const Comment = require('../models/comment');
const passport = require('passport');
const { S3Client, DeleteObjectsCommand, ListObjectsV2Command } = require( '@aws-sdk/client-s3' );
const redis = require('redis');
require('dotenv').config();


const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_S3_REGION
});

const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
    legacyMode: true, // 반드시 설정 !!
});

redisClient.on('connect', () => {
    console.info('Redis connected!@@');
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

redisClient.connect().then(); // redis v4 연결 (비동기)
const redisCli = redisClient.v4; // 기본 redisClient 객체는 콜백기반인데 v4버젼은 프로미스 기반이라 사용

router.get('/signup', (req, res) => {
    res.render('users/signup');
});

router.get('/signup2', notSignedIn, async(req, res) => {
    res.render('users/signup2');
});

router.get('/forgotpwd', notSignedIn, (req, res) => {
    res.render('users/forgotPwd');
});

router.get('/userinfo', isSignedIn, async (req, res) => {
    res.render('users/checkuser');
});

router.get('/modifyUserInfo', (req, res) => {
    //페이지를 잘못 찾았을 때 표시할 페이지도 만들어야 할듯함.
    res.redirect('/index');
});

router.post('/modifyUserInfo', isSignedIn, verifyUser, catchAsync( async(req, res) => {
    const{ nickname, email } = req.user;
    req.session.canAccessWithdraw = true;   // 회원탈퇴 페이지 url로 접근 방지
    res.render('users/modifyUserInfo', {nickname, email});
}));

router.get('/withdraw', isSignedIn, withdrawPermission, catchAsync(async(req, res) => {
    req.session.canAccessWithdrawVerifycode = true; 
    delete req.session.canAccessWithdraw

    const { email } = req.user;
    const randomString = Math.random().toString(36).slice(2);

    await redisCli.set(email, randomString); // OK
    await redisCli.expire(email, 180);

    const smtpTransport = nodemailer.createTransport({
        service: 'gmail', // 사용할 메일 서비스
        auth: {
          user: process.env.NODE_MAILER_ID,
          pass: process.env.NODE_MAILER_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const mailOptions = {
        from: process.env.NODE_MAILER_ID,
        to: email,
        subject: "회원탈퇴 코드",
        text: "nodemailer 테스트 메일입니다.",
        html: `<p>회원탈퇴 코드는 ${randomString} 입니다. <br> 코드입력 후 탈퇴완료 버튼을 누르면 최종 탈퇴처리 됩니다.</p>`
      };

      await smtpTransport.sendMail(mailOptions, (error, responses) => {
        if (error) {
          res.status(400).json({ ok: false });
        } else {
          res.status(200).json({ ok: true });
        }
        smtpTransport.close();
      });

    res.render('users/withdraw')
}));

router.post('/withdraw/verifycode', isSignedIn, withdrawVerifycodePermission, catchAsync( async(req, res) => {  
    delete req.session.canAccessWithdrawVerifycode
    
    const {userCode} = req.body;
    let redisData = await redisCli.get(req.user.email); // 123

    if( userCode === redisData) {
        req.session.canAccessDeleteUser = true; 
        return res.status(200).json('ok');
    }
    if(!redisData) {
        return res.status(400).json('not exist');
    }
    if(userCode != redisData){
        return res.status(400).json('incorrect');
    }
}));

router.get('/withdraw/verifycode/deleteUser', isSignedIn, deleteUserPermission, catchAsync( async(req, res) => {
    delete req.session.canAccessDeleteUser

    // s3삭제
    // 폴더 내 객체들을 나열
    const listParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Prefix: req.user.id,
    };
    const listCommand = new ListObjectsV2Command(listParams);
    const S3data = await s3.send(listCommand);

    // 폴더 내의 객체들을 삭제
    if(S3data.Contents){
        const deleteParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Delete: { Objects: S3data.Contents.map(item => ({ Key: item.Key })) },
        };
        const deleteCommand = new DeleteObjectsCommand(deleteParams);
        await s3.send(deleteCommand);
    }

    // 대댓글 삭제
    // await NestedComment.deleteMany({author:req.user.id});

    // 댓글 삭제(+연관 대댓글)
    const comments = await Comment.find({author:req.user.id});
    for(let comment of comments){
        // await NestedComment.deleteMany({ _id: { $in: comment.nestedComments } });
    }
    await Comment.deleteMany({author:req.user.id});

    // 게시물 삭제(+연관 댓글,대댓글)
    const boards = await Board.find({author:req.user.id});
    for(let board of boards) {
        await Board.findByIdAndDelete(board.id);
    }

    // 유저정보 삭제
    await User.deleteOne({_id: req.user.id});

    res.render('users/byebye')
}));

router.put('/saveUserInfo', isSignedIn, validateNickname, validatePassword, catchAsync( async(req, res) => {
    const {password, confirmPwd, oldPassword} = req.body;
    const afterNick = req.body.nickname;
    const beforeNick = req.user.nickname;

    if(afterNick != beforeNick){    // 닉네임 변경 감지 및 중복 없음
        const userNick = {nickname: afterNick};
        await User.findByIdAndUpdate(req.user.id, userNick);

        if(password === confirmPwd && password.length >= 6 && confirmPwd.length >= 6){  // 패스워드 조건 만족
            const auth = await req.user.authenticate(oldPassword); // 현재 비밀번호 확인
            if(auth.user.email == req.user.email) {
                const user = await User.findOne({nickname:afterNick});
                await user.setPassword(confirmPwd);
                await user.save();
                return res.status(200).json({ok: true});
            } else {
                return res.status(400).json('ne');
            }
        }
        if(!password && !confirmPwd && !oldPassword){   // 패스워드 변경 없음
            return res.status(200).json({ok: true});
        } else {
            return res.status(400).json('ne');
        }
    }

    if(afterNick === beforeNick) {  // 닉네임 변경 없음
        if(password === confirmPwd && password.length >= 6 && confirmPwd.length >= 6){  // 패스워드 조건 만족
            const auth = await req.user.authenticate(oldPassword);  
            if(auth.user.email == req.user.email) {
                const user = await User.findOne({nickname:beforeNick});
                await user.setPassword(confirmPwd);
                await user.save();
                return res.status(200).json({ok: true});
            } else {
                return res.status(400).json('ne');
            }
        }
        if(!password && !confirmPwd && !oldPassword){   // 패스워드 변경 없음
            return res.status(200).json({ok: true});
        } else {
            return res.status(400).json('ne');
        }
    }

}));

router.post('/forgotpwd/temppwd', catchAsync( async(req, res) => {
    const { email } = req.body;
    const user = await User.findOne({email:email});
    const randomString = Math.random().toString(36).slice(2);
    await user.setPassword(randomString);
    await user.save();   // 이건 내가 뭘 참고해서 쓴거지..? 필요한거 맞나? https://www.npmjs.com/package/passport-local-mongoose 이거인듯....

    const smtpTransport = nodemailer.createTransport({
        service: 'gmail', // 사용할 메일 서비스
        auth: {
          user: process.env.NODE_MAILER_ID,
          pass: process.env.NODE_MAILER_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
    });

    const mailOptions = {
        from: process.env.NODE_MAILER_ID,
        to: email,
        subject: "임시 비밀번호",
        text: "nodemailer 테스트 메일입니다.",
        html: `<p>임시 비밀번호는 ${randomString} 입니다. 로그인 후 반드시 비밀번호를 변경해 주세요.</p>`
    };

    await smtpTransport.sendMail(mailOptions, (error, responses) => {
        if (error) {
            res.status(400).json({ ok: false });
        } else {
            res.status(200).json({ ok: true });
        }
        smtpTransport.close();
    });

    res.status(200).json({ ok: true });
}));

router.post('/forgotpwd/check', catchAsync( async(req, res) => {
    const {email} = req.body;

    if(email) {
        const user = await User.findOne({email:email});
        if(user){
            return res.send('ok');
        } else {
            return res.send('notok');
        }
    }
    res.send('notok');
}));

router.get('/signup/check', catchAsync( async(req, res) => { 
    const {email, nickname} = req.query;
    if(email){
        const user = await User.findOne({email: email}); // user가 []인데 Boolean이 왜 true가 나오지?, query객체의 키값을(Object.keys()) 사용해서 한 줄로 하려고 했지만 변수를 인식하지 못함.
        if(!user){
            return res.send("ok");
        }
    }
    if(nickname){
        const user = await User.findOne({nickname: nickname}); 
        if(!user){
            return res.send("ok");
        }
    }
    res.send("notok")
}));

router.get('/signup/verifyemail', catchAsync( async(req, res) => {
    const { email } = req.query;
    const payload = Math.floor(100000 + Math.random() * 900000);

    await redisCli.set(email, payload); // OK
    await redisCli.expire(email, 180);
    
    const smtpTransport = nodemailer.createTransport({
        service: 'gmail', // 사용할 메일 서비스
        auth: {
          user: process.env.NODE_MAILER_ID,
          pass: process.env.NODE_MAILER_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    
      const mailOptions = {
        from: process.env.NODE_MAILER_ID,
        to: email,
        subject: "회원가입 인증번호",
        text: "nodemailer 테스트 메일입니다.",
        html: `<p>인증번호는 ${payload} 입니다.</p>`
      };

      await smtpTransport.sendMail(mailOptions, (error, responses) => {
        if (error) {
          res.status(400).json({ ok: false });
        } else {
          res.status(200).json({ ok: true });
        }
        smtpTransport.close();
      });

      res.status(200).json({ ok: true });
}));

router.post('/signup/verifycode', catchAsync( async(req, res) => {
    const { userCode, email } = req.body;
    let redisData = await redisCli.get(email); // 123

    if( userCode === redisData) {
        return res.status(200).json('ok');
    }
    if(!redisData) {
        return res.status(400).json('not exist');
    }
    if(userCode != redisData){
        return res.status(400).json('incorrect');
    }
}));

router.post('/signup', catchAsync( async(req, res, next) => {
    try{
        const { email, nickname, password } = req.body;
        const user = new User({email, nickname});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {  // req.login()  => passport doc 참고
            if(err) return next(err);
            res.redirect('/index');
        });
    } catch (e) {
        res.redirect('/signup');
    }
}));

router.get('/signin', (req, res) => {
    const { redirectUrl } = req.query
    if(!req.session.backTo){    // navbar를 클릭해서 로그인 후 페이지 돌아가기 관련.
        req.session.backTo = redirectUrl
    }
    res.render('users/signin', {redirectUrl});
});

router.post('/signin', passport.authenticate('local', { failureFlash: true, failureRedirect: '/signin', keepSessionInfo: true }), (req, res) => {
    const redirectUrl = req.session.backTo || `/index`;
    delete req.session.backTo;
    res.redirect(redirectUrl);
});

router.get('/signout', (req, res) => {
    const redirectUrl = req.query.redirectUrl;
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        if(redirectUrl){
            return res.redirect(`${redirectUrl}`);
        }
        res.redirect(`/index`);
    });
});

router.get('/currentUser', (req, res) => {
    res.json(req.user.nickname);
});

module.exports = router;