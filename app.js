// Module requires
const express = require('express')
const bodyParser = require("body-parser")
const mongoose = require('mongoose')
const app = express()
require('dotenv').config()

app.use(express.static('./public'))
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB database
// create a .env variable called DATABASE with the DB URI as value
mongoose.connect(process.env.DATABASE, () => {
}, e => console.error(e))

var router = require('./routes/router');
app.use('/', router);
//GET to homepage

// Run server
app.listen(process.env.PORT, () => {
    console.log("Port " + process.env.PORT+" open");
});