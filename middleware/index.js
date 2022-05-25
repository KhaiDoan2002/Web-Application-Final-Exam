const User = require('../models/UserModel')
const multipleUpload = require('./upload')

const getUser = (req, res, next) => {
    const username = req.session.username
    User.findOne({ username: username })
        .then(account => {
            if (account)
                req.getUser = account
            next()
        })
}

const roleResetPassword = (req, res, next) => {
    const username = req.session.username
    User.findOne({ username: username })
        .then(account => {
            if (!account.active)
                next()
            else
                res.redirect('/user/logout')
        })
}

const roleLogin = (req, res, next) => {
    if (!req.session.username)
        next()
    else
        res.redirect('/user/logout')
}

const roleResetPasswordByOTP = (req, res, next) => {
    if (req.session.username)
        next()
    else
        res.redirect('/user/login')
}


const roleVerifyOTP = (req, res, next) => {
    if (req.session.tokenOTP)
        next()
    else
        res.redirect('/user/logout')
}


module.exports = {
    getUser,
    multipleUpload,
    roleResetPassword,
    roleLogin,
    roleVerifyOTP,
    roleResetPasswordByOTP
}