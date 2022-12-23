const mongoose = require('mongoose')

const SetupSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    mode: { //if true, fill bowl automatically   || if false, feed x times a day
        type: Boolean,
        required: true
    },
    portionSize: { // Size of the portion given to the pet (per feeding)
        type: Number
    },
    portionTime: { // Times of feeding (per day)
        type: [String]
    },
    currentTime: { // Current time for the Arduino
        type: String
    }
})

module.exports = mongoose.model("FeederSetup", SetupSchema)