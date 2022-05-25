const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BlockUser = new Schema({
    UserEmail: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    creatAt: {
        type: Date,
        expires: '60s',
        default: Date.now()
    }
})

module.exports = mongoose.model('BlockUser', BlockUser)