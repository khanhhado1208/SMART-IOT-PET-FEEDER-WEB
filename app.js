// Module requires
const express = require('express')
const bodyParser = require("body-parser")
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const sessions = require('express-session')
const app = express()
require('dotenv').config()
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(__dirname));

// Connect to MongoDB database
// create a .env variable called DATABASE with the DB URI as value
mongoose.connect(process.env.DATABASE, () => {
}, e => console.error(e))
const User = require('./models/Users');
const FeederSetup = require("./models/Feeder-setup")

// Sessions
const session_length = 1800000 // half an hour
app.use(sessions({
    secret: "extremelyv3rymassivleyultrasecuresecretcode",
    saveUninitialized:true,
    cookie: { maxAge: session_length },
    resave: false 
}));

// Router
const router = require('./routes/router');
app.use('/', router);

// Run server
app.listen(process.env.PORT, () => {
    console.log("Port " + process.env.PORT+" open");
});