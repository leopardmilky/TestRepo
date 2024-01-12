const {nickname} = require('./data')
const User = require('../models/user');
const mongoose = require('mongoose');


mongoose.connect('mongodb://127.0.0.1:27017/proj1');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected @ @");
});


const seedDB = async () => {
    for(nick of nickname) {
        const email = nick+"@email.com";
        const nickname = nick;
        const password = '123123'
        const user = new User({email, nickname});
        await User.register(user, password);
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