/* Module required */
const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser")
const sessions = require('express-session')
const path = require('path')
const User = require('./models/Users');
const FeederSetup = require("./models/Feeder-setup")
const app = express() /* Init express app */
const mongoose = require('mongoose')
require('dotenv').config() 

/* connect to routes */
const router = require('./routes/router') /* Connect to home router */

/* Connect to MongoDB */
mongoose.connect(process.env.DB_URI, () => {
    console.log("MongoDB connected")
}, e => console.error(e))


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
    console.log(`Server is running on port ` + process.env.PORT);
});