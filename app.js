// Constant values
const session_length = 1800000 // half an hour

// Modules required
const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser")
const sessions = require('express-session')
const path = require('path')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()                      // dotenv for environment variables
const router = require('./routes/router')       // Connect to router paths

/* Connect to MongoDB */
mongoose.connect(process.env.DB_URI, () => {
    console.log("MongoDB connected")
}, e => console.error(e))

/* Parse JSON Data */
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/public/', express.static('./public'));

/* Set Cookie Parser, Sessions */
app.use(sessions({
    secret: "extremelyv3rymassivleyultrasecuresecretcode",
    saveUninitialized:true,
    cookie: { maxAge: session_length },
    resave: false 
}));
app.use(cookieParser());

/* Utilizing ejs template */
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'views')))
const publicDir = require('path').join(__dirname,'/views'); 
app.use(express.static(publicDir)); 
app.set('views', path.join(__dirname, 'views'))

/* Handling routes request */
app.use('/', router)

/* Start the server */
app.listen(process.env.PORT, () => {
    console.log("Port " + process.env.PORT + " open");
});