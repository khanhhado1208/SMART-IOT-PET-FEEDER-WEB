/* Module required */
const express = require('express')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
const bodyParser = require("body-parser")
const path = require('path')
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

/* Set Cookie Parser, Sessions & Flash */
app.use(cookieParser('SecretStringForCookies'))
app.use(session({
    secret: 'SecretStringForCookies',
    cookie: {maxAge: 60000},
    resave: true,
    saveUninitialized: true
}))
app.use(flash())

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
