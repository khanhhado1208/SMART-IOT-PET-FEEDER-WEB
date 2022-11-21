// Module requires
const express = require('express')
const bodyParser = require("body-parser")
const sessions = require('express-session')
const passport = require('passport');
const path = require('path')
const app = express() /* Init express app */
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const sessions = require('express-session')
require('dotenv').config()
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(__dirname));

// Connect to MongoDB database
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

/* Parse JSON Data */
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

/* Set Cookie Parser, Sessions */
const session_length = 1800000 // half an hour
app.use(sessions({
    secret: "extremelyv3rymassivleyultrasecuresecretcode",
    saveUninitialized:true,
    cookie: { maxAge: session_length },
    resave: false 
}));
app.use(cookieParser());

/* Utilizing ejs template */
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))

/* Handling routes request */
app.use('/', router) /* Access to homepage */
app.use('/register', router) /* Access to register page */

/* Start the server */
app.listen(process.env.PORT, () => {
    console.log("Port " + process.env.PORT+" open");
});