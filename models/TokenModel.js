const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Token = new Schema({
    UserEmail: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    creatAt: {
        type: Date,
        expires: '60s',
        default: Date.now()
    }
})

module.exports = mongoose.model('Token', Token)