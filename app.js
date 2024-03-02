const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const Notification = require('./models/notification');
const Note = require('./models/note');
const boardRoutes = require('./routes/boards');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');
const mypageRoutes = require('./routes/mypage');
const adminRoutes = require('./routes/admin');
const cron = require('node-cron');
const nocache = require("nocache");




const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/proj1');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected @ @");
});

app.use(nocache());
app.use(express.urlencoded({ extended: true})); // POST 파싱.
app.use(methodOverride('_method')); // 반드시 '_method'로 쓸 필요없음.
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.disable('x-powered-by');

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const sessionConfig = {
    secret: 'thisistopsecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize()); // 정확한 기능은 공식문서 참조.
app.use(passport.session());
passport.use(new LocalStrategy({usernameField: 'email'}, User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use( async (req, res, next) => {
    res.locals.signedInUser = req.user;
    if(req.user) {
        const {id} = req.user;
        const notis = await Notification.find({recipient:id, isRead: false}).sort({createdAt: -1}).populate('commentId').populate('noteId').populate('sender').populate('replyId').populate('postId');
        res.locals.notiAlarm = notis.length;
    }
    next();
});

app.use('/', userRoutes);
app.use('/mypage', mypageRoutes);
app.use('/admin', adminRoutes);
app.use('/index', boardRoutes);
app.use('/index/:id/comments', commentRoutes);

app.get('/', (req, res) => {
    res.redirect('/index');
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found!@!@', 404));
});

app.use((err, req, res, next) => {
    const { statusCode } = err;
    res.status(statusCode).render('error/postPageError', {err});
});

cron.schedule('0 0 * * *', async() => { // 읽은 쪽지 및 알림 삭제 크론탭 - 매일 정각에 실행.

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    await Notification.deleteMany({ // 하루 지난 읽은알림 삭제
        $and:
        [
            {isRead: true},
            {readAt: {$lt: oneDayAgo}}
        ]
    });


    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const deleteSoonNote = await Note.find(
        {
            $and: 
                [
                    {read:true},    // 수신한 쪽지를 읽었는데
                    {recipientSaved: false},    // 저장을 안했고
                    {recipientDeleted: false},  // 삭제도 안했고
                    {readAt: {$lt: threeDaysAgo}}   // 3일이 지난 쪽지의
                ]
        }
    );
    await Notification.deleteMany({noteId: {$in: deleteSoonNote}});  // 알림을 삭제.

    const operations = 
    [
        {
            updateMany: 
            {
                filter: 
                {
                    $and: 
                    [
                        {read:true},    // 수신한 쪽지를 읽었는데
                        {recipientSaved: false},    // 저장을 안했고
                        {recipientDeleted: false},  // 삭제도 안했고
                        {readAt: {$lt: threeDaysAgo}}   // 3일이 지나면 
                    ]
                },
                update: {$set: {recipientDeleted: true}},  // 수신자 삭제 상태가 됨.
            }
        },
        {
            updateMany:
            {
                filter:
                {
                    $and:
                    [
                        {senderSaved: false},   // 발신한 쪽지를 저장을 안했고
                        {senderDeleted: false}, // 삭제도 안했고
                        {sentAt: {$lt: threeDaysAgo}}   // 3일이 지나면
                    ]
                },
                update:{$set: {senderDeleted: true}} // 발신 메세지 삭제 상태가 됨.
            }
        },
        {
            deleteMany:
            {
                filter:
                {
                    $and:
                    [
                        {senderDeleted: true},
                        {recipientDeleted: true}
                    ]
                }
            }
        }
    ];

    await Note.bulkWrite(operations);
});

app.listen(3000, () => console.log('PORT 3000....!!'));
