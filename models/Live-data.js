const mongoose = require('mongoose')

const DataSchema = new mongoose.Schema({
    device_ID: {
        type: String,
        required: true
    },
    weight: {
        type: Number
    }
})

module.exports = mongoose.model("LiveData", DataSchema)