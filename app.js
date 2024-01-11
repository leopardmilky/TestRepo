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
const boardRoutes = require('./routes/boards');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');
const mypageRoutes = require('./routes/mypage');
const adminRoutes = require('./routes/admin');


const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/proj1');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected @ @");
});

app.use(express.urlencoded({ extended: true})); // POST 파싱.
app.use(methodOverride('_method')); // 반드시 '_method'로 쓸 필요없음.
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const sessionConfig = {
    secret: 'thisistopsecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
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
    // res.locals.previousUrl = urlParse.parse(urlStr, true);
    // res.locals.success = req.flash('success');
    // res.locals.error = req.flash('error');
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
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh, Something Went Wrong!!';
    res.status(statusCode).render('error', {err});
});

app.listen(3000, () => console.log('PORT 3000....!!'));
