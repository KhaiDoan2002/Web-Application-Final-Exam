const { validationResult } = require('express-validator')
const fs = require('fs')
const nodemailer = require('nodemailer')
const User = require('../models/UserModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Token = require('../models/TokenModel')
const BlockUser = require('../models/BlockUserModel')
function fileValidator(req) {
    let message
    if (!req.files['frontID']) {
        message = 'Không được bỏ trống mặt trước CMND'
    } else if (!req.files['backID']) {
        message = 'Không được bỏ trống mặt sau CMND'
    }
    return message
}

function hashPassword(password) {
    let saltRounds = 10;
    let salt = bcrypt.genSaltSync(saltRounds)
    return bcrypt.hashSync(password, salt)
}



const UserController = {
    getIndex: function (req, res) {
        res.render('index')
    },
    getRegister: function (req, res) {
        const error = req.flash('error') || ""
        const email = req.flash('email') || ""
        const fullname = req.flash('fullname') || ""
        const phone = req.flash('phone') || ""
        const address = req.flash('address') || ""
        const birth = req.flash('birth') || ""
        res.render('register', { error: error, email, fullname, phone, address, birth })
    },
    postRegister: function (req, res) {
        let result = validationResult(req)
        let message = fileValidator(req) || ''

        if (result.errors.length === 0 && !message) {
            const { root } = req.vars
            const userDir = `${root}/public/uploads/users/${req.body.email}`
            const password = Math.random().toString(36).substring(2, 8);
            const username = new Date().getTime().toString().slice(-11, -1);
            const { email } = req.body
            return fs.mkdir(userDir, () => {

                const hash = hashPassword(password)
                // Create transport
                // const transporter = nodemailer.createTransport({
                //     host: 'mail.phongdaotao.com',
                //     port: 25,
                //     secure: false,
                //     auth: {
                //         user: "sinhvien@phongdaotao.com",
                //         pass: "svtdtu",
                //     },
                //     tls: {
                //         rejectUnauthorized: false,
                //     }
                // });

                const transporter = nodemailer.createTransport({
                    host: 'smtp.ethereal.email',
                    port: 587,
                    auth: {
                        user: 'leatha.schultz15@ethereal.email',
                        pass: 'Gyj2RXW4Uw7rcCWFux'
                    }
                });

                const msg = {
                    from: '"Ví Điện tử SUD 🪙" <sudtechnology.group@gmail.com>',
                    to: `${email}`,
                    subject: "WELCOME TO SUD ✔",
                    text: "Đây là thông tin về tài khoản của bạn",
                    html: `
                        <h2>Username: ${username}</h2>
                        <h2>Password: ${password}</h2>
                    `
                }
                // Moving file
                let imagePath = []
                for (file in req.files) {
                    let currentPath = req.files[file][0].path
                    let destinationPath = `${userDir}/${req.files[file][0].filename}`
                    imagePath.push(destinationPath)
                    fs.rename(currentPath, destinationPath, (err) => {
                        if (!err)
                            console.log('Moving file successfully')
                    })
                }
                let user = {
                    email: req.body.email,
                    fullname: req.body.fullname,
                    phone: req.body.phone,
                    address: req.body.address,
                    birth: req.body.birth,
                    username: username,
                    password: hash,
                    frontID: imagePath[0],
                    backID: imagePath[1]
                }

                return new User(user).save()
                    .then(() => {
                        transporter.sendMail(msg, (err, success) => {
                            if (err)
                                console.log(err)
                            else
                                console.log('Email send successfully')
                        })
                        req.flash('success', "Đăng ký thành công, vui lòng đăng nhập")
                        res.redirect('/user/login')
                    })
                    .catch(() => {
                        req.flash('error', "Đăng ký thất bại")
                    })
            })

        }
        result = result.mapped()
        for (fields in result) {
            message = result[fields].msg
            break;
        }
        const { email, fullname, phone, birth, address } = req.body
        req.flash('error', message)
        req.flash('email', email)
        req.flash('fullname', fullname)
        req.flash('phone', phone)
        req.flash('address', address)
        req.flash('birth', birth)
        res.redirect('/user/register')
    },

    getLogin: function (req, res) {
        const error = req.flash('error') || ""
        const username = req.flash('username') || ""
        const fail = req.flash('fail') || false
        const success = req.flash('success') || ""
        res.render('login', { error, success, username, fail })
    },

    postLogin: function (req, res) {
        let result = validationResult(req)
        let errorLength = result.errors.length
        if (errorLength === 0) {
            let { username, password } = req.body
            req.flash('username', username)
            let account = undefined
            return User.findOne({ username: username })
                .then(acc => {
                    if (!acc) {
                        req.flash('error', 'Username ' + username + " không tồn tại")
                        res.redirect('/user/login')
                    }
                    account = acc
                    return bcrypt.compare(password, acc.password)
                })
                .then(match => {
                    if (!match) {
                        account.failAccess = (account.failAccess + 1)
                        req.session.failAccess = account.failAccess
                        const block = new BlockUser({
                            UserEmail: account.email,
                            username: account.username
                        })
                        block.save()
                        return account.save((err, data) => {
                            if (err)
                                console.log(err)
                            else {
                                req.flash('fail', true)
                                res.redirect('/user/login');
                            }
                        })
                    } else {
                        account.failAccess = 0
                        req.session.failAccess = account.failAccess
                        return account.save((err, data) => {
                            const { JWT_SECRET } = process.env
                            jwt.sign({
                                username: account.username,
                            }, JWT_SECRET, {
                                expiresIn: '15m'
                            }, (err, token) => {
                                if (err) {
                                    req.flash('error', 'Đăng nhập thất bại: ' + err)
                                    res.redirect('/user/login')
                                } else {
                                    req.session.username = username
                                    req.session.token = token
                                    BlockUser.findOneAndDelete({username : username})
                                    req.flash('success', 'Đăng nhập thành công')
                                    res.redirect('/user/')

                                }
                            })
                        })
                    }
                })
        } else {
            let message
            const { username } = req.body
            result = result.mapped()
            for (m in result) {
                message = result[m].msg
                break
            }
            req.flash('error', message)
            req.flash('username', username)
            return res.redirect('/user/login')

        }
    },

    getLogout: function (req, res) {
        req.session.destroy();
        res.redirect('/');
    },

    getUserInfo: function (req, res) {
        res.json({ code: 0, message: "test thành công" })
    },

    getResetPassword: function (req, res) {
        const error = req.flash('error') || ""
        const newPass = req.flash('newPass') || ""
        const rePass = req.flash('rePass') || ""
        const success = req.flash('success') || ""
        res.render('resetPassword', { error, newPass, rePass, success })
    },

    postResetPassword: function (req, res) {
        let result = validationResult(req)
        if (result.errors.length === 0) {
            User.findOneAndUpdate({ username: req.session.username }, {
                password: hashPassword(req.body.newPass),
                active: true
            }, (err, data) => {
                if (err)
                    console.log(err)
                else
                    res.redirect('/user/')
            })
        } else {
            result = result.mapped()
            let message
            for (m in result) {
                message = result[m].msg
                break
            }
            const { newPass, rePass } = req.body
            req.flash('error', message)
            req.flash('rePass', rePass)
            req.flash('newPass', newPass)
            res.redirect('/user/')
        }

    },

    getRestorePassword: function (req, res) {
        const error = req.flash('error') || ''
        const email = req.flash('email') || ''
        const phone = req.flash('phone') || ''
        res.render('restorePassword', { error, email, phone })
    },

    postRestorePassword: function (req, res) {
        let result = validationResult(req)
        if (result.errors.length === 0) {
            const { email, phone } = req.body
            req.session.email = email
            req.session.phone = phone
            res.cookie('email', email)
            res.cookie('phone', phone)
            sendEmailVerify(req, res, email)
        } else {
            result = result.mapped()
            let message
            for (m in result) {
                message = result[m].msg
                break
            }
            const { email, phone } = req.body
            req.flash('error', message)
            req.flash('email', email)
            req.flash('phone', phone)
            res.redirect('/user/restorePassword')
        }
    },

    getVerifyOTP: function (req, res) {
        const error = req.flash('error') || ''
        const code = req.flash('code') || ''
        res.render('verifyOTP', { error, code })
    },

    postVerifyOTP: function (req, res) {
        let result = validationResult(req)
        if (result.errors.length === 0) {
            const code = req.body.code
            return Token.findOneAndDelete({ code: code })
                .then(result => {
                    const email = result.UserEmail
                    User.findOneAndUpdate({ email: email }, {
                        failAccess: 0,
                        active: false
                    }, (err, data) => {
                        if (!err) {
                            const username = data.username
                            req.session.username = username
                            res.redirect('/user/resetPasswordByOTP')
                        }
                    })
                })
        } else {
            result = result.mapped()
            let message
            for (m in result) {
                message = result[m].msg
                break
            }
            const { code } = req.body
            req.flash('error', message)
            req.flash('code', code)
            res.redirect('/user/verifyOTP')
        }
    },

    getResendOTP: function (req, res) {
        const email = req.cookies.email
        sendEmailVerify(req, res, email)
    },

    postResetPasswordByOTP: function (req, res) {
        let result = validationResult(req)
        if (result.errors.length === 0) {
            User.findOneAndUpdate({ username: req.session.username }, {
                password: hashPassword(req.body.newPass),
                active: true
            }, (err, data) => {
                if (err)
                    console.log(err)
                else {
                    req.flash('success', 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại')
                    res.redirect('/user/login')
                }
            })
        } else {
            result = result.mapped()
            let message
            for (m in result) {
                message = result[m].msg
                break
            }
            const { newPass, rePass } = req.body
            req.flash('error', message)
            req.flash('rePass', rePass)
            req.flash('newPass', newPass)
            res.redirect('/user/')
        }
    }
}

function sendEmailVerify(req, res, email) {
    const { JWT_SECRET } = process.env
    const code = `${Math.floor(1000 + Math.random() * 9000)}`
    return jwt.sign({ code: code }, JWT_SECRET, { expiresIn: '1m' }, (err, codeToken) => {
        if (err)
            console.log(err)
        else {
            req.session.codeToken = codeToken
            const transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                auth: {
                    user: 'cole.ryan34@ethereal.email',
                    pass: 'WrFuT2SyNK7KzjFwvV'
                }
            });

            const msg = {
                from: '"Ví Điện tử SUD 🪙" <sudtechnology.group@gmail.com>',
                to: `${email}`,
                subject: "Mã OTP đặt lại mật khẩu ✔",
                text: "Vui lòng không tiết lộ mã này với bất kì ai",
                html: `
                            <h2>OTP: ${code}</h2>
                            <h2>Token: ${codeToken}</h2>
                        `
            }
            const UserToken = {
                UserEmail: email,
                code: code,
                token: codeToken
            }

            return new Token(UserToken).save()
                .then(() => {
                    transporter.sendMail(msg, (err, success) => {
                        if (err)
                            console.log(err)
                        else {
                            console.log('Sending OTP successfully')
                        }
                    })
                    // res.json({ code: 1, message: 'đăng ký token thành công', code: code, email: email, token: codeToken })
                    res.redirect('/user/verifyOTP')
                })

        }
    })
}

module.exports = UserController