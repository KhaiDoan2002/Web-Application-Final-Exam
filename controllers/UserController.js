const { validationResult } = require('express-validator')
const fs = require('fs')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Token = require('../models/TokenModel')
const BlockUser = require('../models/BlockUserModel')

const User = require('../models/UserModel')
const CreditCard = require('../models/CreditCard')
const OTP = require('../models/OTP')
const Provider = require('../models/Provider')
const { stopWithdraw, normalizeDate, checkErrorInput } = require('../middleware/functions')

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

function sendEmailVerify(req, res, email) {
    const { JWT_SECRET } = process.env
    const code = `${Math.floor(1000 + Math.random() * 9000)}`
    return jwt.sign({ code: code }, JWT_SECRET, { expiresIn: '1m' }, (err, codeToken) => {
        if (err)
            console.log(err)
        else {
            req.session.codeToken = codeToken
            const transporter = nodemailer.createTransport({
                host: 'mail.phongdaotao.com',
                port: 25,
                auth: {
                    user: 'sinhvien@phongdaotao.com ',
                    pass: 'svtdtu'
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

const UserController = {

    getIndex: function (req, res) {
        const user = req.getUser;
        const balance = user.balance;
        let context = ''
        if (user.history) {
            context = (user.history).map(h => {
                let icon = ''
                let modal = ''
                let isWithdraw = false
                let isTransfer = false
                let isDeposit = false
                let isPhoneCard = false


                if (h._doc.action == 'Rút tiền') {
                    icon = 'bi bi-cash';
                    modal = 'modelHistoryWithdrawDetail'
                    isWithdraw = true
                }
                else if (h._doc.action == 'Chuyển tiền') {
                    icon = 'bi bi-arrow-down-up';
                    modal = 'modelHistoryTransferDetail'
                    isTransfer = true
                }
                else if (h._doc.action.includes('Mua thẻ')) {
                    icon = 'bi bi-phone';
                    modal = 'modelHistoryPhoneCardDetail'
                    isPhoneCard = true
                }
                else {
                    icon = 'bi bi-bank';
                    modal = 'modelHistoryDepositDetail'
                    isDeposit = true
                }

                let style = '';
                if (h._doc.status == 'Hoàn thành') {
                    style = 'success';
                }
                else if (h._doc.status == 'Đang chờ duyệt') {
                    style = 'warning';
                }
                else {
                    style = 'danger';
                }

                let receive_code = h._doc.receive_code[0]

                return {
                    id: h._doc._id,
                    action: h._doc.action,
                    amount: h._doc.amount,
                    createdAt: normalizeDate(h._doc.createdAt),
                    status: h._doc.status,
                    icon: icon,
                    style: style,
                    modal: modal,
                    receiver: h._doc.receiver,
                    isDeposit: isDeposit,
                    isPhoneCard: isPhoneCard,
                    isTransfer: isTransfer,
                    isWithdraw: isWithdraw,
                    receive_code: receive_code
                };
            });
        }
        let status = 'Đã xác minh'
        let requestID = false
        if (user.status == 'Not_verified')
            status = 'Chưa được xác minh'
        else if (user.status == 'Wait_for_update') {
            requestID = true
            status = 'Yêu cầu cung cấp lại ảnh CMND'
        }
        res.render('index', {
            balance,
            data: context,
            fullname: user.fullname,
            username: user.username,
            phone: user.phone,
            email: user.email,
            birth: normalizeDate(user.birth),
            address: user.address,
            status: status,
            requestID: requestID,
        })
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
            console.log(password);
            const username = new Date().getTime().toString().slice(-11, -1);
            const { email } = req.body
            return fs.mkdir(userDir, () => {
                const hash = hashPassword(password)
                // Create transport

                const transporter = nodemailer.createTransport({
                    host: 'mail.phongdaotao.com',
                    port: 25,
                    auth: {
                        user: 'sinhvien@phongdaotao.com ',
                        pass: 'svtdtu'
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
                    frontID: `/uploads/users/${req.body.email}/${req.files[file][0].filename}`,
                    backID: `/uploads/users/${req.body.email}/${req.files[file][0].filename}`

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
                        if (account.failAccess == 3) {
                            account.status = 'Locked'
                            account.blockAt = Date.now()
                        }
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
                                expiresIn: '5m'
                            }, (err, token) => {
                                if (err) {
                                    req.flash('error', 'Đăng nhập thất bại: ' + err)
                                    res.redirect('/user/login')
                                } else {
                                    req.session.username = username
                                    req.session.token = token
                                    if (username != 'admin') {
                                        BlockUser.findOneAndDelete({ username: username })
                                        req.flash('success', 'Đăng nhập thành công')
                                        res.redirect('/user/')
                                    } else {
                                        req.flash('success', 'Đăng nhập thành công')
                                        res.redirect('/admin/')
                                    }

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
    },

    getDepositPage: function (req, res, next) {
        User.findOne({ username: req.session.username })
            .then(user => {
                const balance = user.balance;
                const error = req.flash('error') || '';
                return res.render('deposit', { error, balance });
            })
            .catch(next);

    },

    postDepositPage: function (req, res, next) {
        // checkErrorInput(req, res, '/user/deposit')

        const { card_no, expired, cvv_code, amount } = req.body;

        CreditCard.findOne({ card_no })
            .then(card => {
                if (!card) {
                    req.flash('error', 'Số thẻ không chính xác');
                    return res.redirect('/user/deposit');
                }

                const cardExpired = normalizeDate(card.expired);

                if (cardExpired != expired) {
                    req.flash('error', 'Sai ngày hết hạn');
                    return res.redirect('/user/deposit');
                }

                if (card.cvv_code !== cvv_code) {
                    req.flash('error', 'Sai mã CVV');
                    return res.redirect('/user/deposit');
                }

                var amountInt = parseInt(amount);

                if (amountInt > card.balance) {
                    req.flash('error', 'Số dư trong thẻ không đủ');
                    return res.redirect('/user/deposit');
                }

                card.balance -= amountInt;
                card.save();

                req.getUser.balance += amountInt;
                req.getUser.history.push(
                    {
                        action: 'Nạp tiền',
                        amount: amountInt,
                        fee: 0,
                        createdAt: new Date(),
                        status: 'Hoàn thành'
                    }
                );
                req.getUser.save();
                req.flash('success', 'Nạp tiền thành công');
                return res.redirect('/user/')
            })
            .catch(next);
    },

    getWithdrawPage: function (req, res, next) {
        User.findOne({ username: req.session.username })
            .then(user => {
                const balance = user.balance;
                const error = req.flash('error') || '';
                return res.render('withdraw', { error, balance });
            })
            .catch(next);
    },

    postWithdrawPage: function (req, res, next) {
        // checkErrorInput(req, res, '/user/withdraw');

        const { card_no, expired, cvv_code, amount, note } = req.body;
        console.log(req.getUser);
        let isOver = stopWithdraw(req.getUser);
        if (isOver) {
            req.flash('error', 'Đã hết số lần giao dịch');
            return res.redirect('/user/withdraw');
        }

        var amountInt = parseInt(amount);

        if (amountInt % 50000 != 0) {
            req.flash('error', 'Số tiền rút phải là bội số của 50000');
            return res.redirect('/user/withdraw');
        }

        if ((amountInt * 105 / 100) > req.getUser.balance) {
            req.flash('error', 'Số dư trong ví không đủ');
            return res.redirect('/user/withdraw');
        }

        CreditCard.findOne({ card_no })
            .then(card => {
                if (!card) {
                    req.flash('error', 'Số thẻ không chính xác');
                    return res.redirect('/user/withdraw');
                }

                const cardExpired = normalizeDate(card.expired);

                if (cardExpired != expired) {
                    req.flash('error', 'Sai ngày hết hạn');
                    return res.redirect('/user/withdraw');
                }

                if (card.cvv_code !== cvv_code) {
                    req.flash('error', 'Sai mã CVV');
                    return res.redirect('/user/withdraw');
                }

                var trade = {
                    action: 'Rút tiền',
                    amount: amountInt,
                    fee: amountInt * 5 / 100,
                    note: note,
                    createdAt: new Date(),
                    status: (amountInt > 5000000) ? 'Đang chờ duyệt' : 'Hoàn thành',
                }
                req.getUser.history.push(trade);

                if (trade.status === 'Hoàn thành') {
                    req.getUser.balance -= (amountInt * 105 / 100);
                    req.getUser.save();

                    card.balance += amountInt;
                    card.save();
                    req.flash('success', 'Rút tiền thành công');
                }
                else {
                    req.getUser.save();
                    req.flash('success', 'Yêu cầu rút tiền thành công. Vui lòng chờ xét duyệt');
                }

                return res.redirect('/user');
            })
            .catch(next);
    },

    getTransferPage: function (req, res, next) {
        User.findOne({ username: req.session.username })
            .then(user => {
                const balance = user.balance;
                const error = req.flash('error') || '';
                return res.render('transfer', { error, balance });
            })
            .catch(next);
    },

    postTransferPage: function (req, res, next) {
        checkErrorInput(req, res, '/user/transfer');

        const { phone, amount, note, isFeePayer } = req.body;
        const user = req.getUser
        const email = user.email
        User.findOne({ phone })
            .then(receiver => {
                if (!receiver) {
                    req.flash('error', 'Tài khoản này không tồn tại');
                    return res.redirect('/user/transfer');
                }
                let Payer = false
                if (isFeePayer == 'true')
                    Payer = true
                var amountInt = parseInt(amount);
                var total = (Payer) ? amountInt * 105 / 100 : amountInt;

                if (total > req.getUser.balance) {
                    req.flash('error', 'Số dư trong ví không đủ');
                    return res.redirect('/user/transfer');
                }

                var trade = {
                    action: 'Chuyển tiền',
                    receiver: receiver.fullname,
                    amount: amountInt,
                    fee: (Payer) ? (amountInt * 5 / 100) : 0,
                    note: note,
                    createdAt: new Date(),
                    status: (amountInt >= 5000000) ? 'Đang chờ duyệt' : 'Hoàn thành',
                }
                const OTPCode = `${Math.floor(100000 + Math.random() * 900000)}`
                const transporter = nodemailer.createTransport({
                    host: 'mail.phongdaotao.com',
                    port: 25,
                    auth: {
                        user: 'sinhvien@phongdaotao.com ',
                        pass: 'svtdtu'
                    }
                });
                const msg = {
                    from: '"Ví Điện tử SUD 🪙" <sudtechnology.group@gmail.com>',
                    to: `${receiver.email}`,
                    subject: "Mã OTP xác nhận chuyển tiền ✔",
                    text: "Vui lòng không tiết lộ mã này với bất kì ai",
                    html: `
                                <h2>OTP: ${OTPCode}</h2>
                            `
                }
                const otp = {
                    UserEmail: email,
                    code: OTPCode,
                }

                return new OTP(otp).save()
                    .then(() => {
                        transporter.sendMail(msg, (err, success) => {
                            if (err) {
                                console.log(err)
                            } else {
                                console.log('Sending OTP successfully')
                                req.flash('name', receiver.fullname);
                                req.flash('date', normalizeDate(new Date()))
                                req.flash('status', amountInt >= 5000000 ? 'Chờ xác nhận' : 'Hoàn thành')
                                req.flash('amount', amountInt);
                                req.flash('note', trade.note);
                                req.session.phone = phone;
                                req.session.email = email;
                                req.session.trade = trade;
                                res.redirect('/user/transfer/confirm');
                            }
                        })
                    })
            })
            .catch(next);
    },

    getTransferConfirm: function (req, res, next) {
        const receiver = req.flash('name') || '';
        const amount = req.flash('amount') || 0;
        const note = req.flash('note') || '';
        const date = req.flash('date')
        const status = req.flash('status')
        return res.render('confirm', { receiver, amount, note, status, date });
    },

    postTransferConfirm: function (req, res, next) {
        const OTPcode = req.body.code
        OTP.findOneAndDelete({ code: OTPcode })
            .then(result => {
                const email = result.UserEmail
                User.findOne({ email })
                    .then(receiver => {
                        const trade = req.session.trade;
                        const user = req.getUser
                        // res.json({ code: 1, data: user })
                        user.history.push(trade);
                        if (trade.status === 'Hoàn thành') {
                            req.getUser.balance -= (trade.amount + trade.fee);
                            req.getUser.save();
                            receiver.balance += (trade.fee == 0) ? (trade.amount - fee) : trade.amount;
                            receiver.save();
                            req.flash('success', 'Chuyển tiền thành công');
                        }
                        else {
                            req.getUser.save();
                            req.flash('success', 'Yêu cầu chuyển tiền thành công. Vui lòng chờ xét duyệt');
                        }
                        return res.redirect('/user');
                    })
            })
            .catch(next);
    },

    getMobileCardPage: function (req, res, next) {
        User.findOne({ username: req.session.username })
            .then(user => {
                const phone = req.flash('phone') || '';
                const error = req.flash('error') || '';
                const balance = user.balance;
                return res.render('buycard', { error, phone, balance });
            })
            .catch(next);

    },

    postMobileCardPage: function (req, res, next) {
        const { provider_name, card_value, quantity } = req.body;

        var total = card_value * quantity;
        if (total > req.getUser.balance) {
            req.flash('error', 'Số dư trong ví không đủ');
            return res.redirect('/user/buycard');
        }

        Provider.findOne({ provider_name })
            .then(provider => {
                let listCard = [];
                for (let i = 0; i < quantity; i++) {
                    var newCard = provider.provider_code + Math.random().toString().slice(-7, -2);
                    listCard.push(newCard);
                }

                const trade = {
                    action: `Mua thẻ ${provider.provider_name}`,
                    amount: total,
                    fee: 0,
                    receive_code: listCard,
                    createdAt: new Date(),
                    status: 'Hoàn thành',
                }

                req.getUser.history.push(trade);
                req.getUser.balance -= (total + trade.fee);
                req.getUser.save();

                req.flash('createdAt', normalizeDate(new Date()))
                req.flash('success', 'Mua thẻ thành công');
                req.flash('listCard', listCard)
                req.flash('total', total)
                req.flash('quantity', quantity)
                req.flash('provider_name', provider_name)
                req.flash('card_value', card_value)
                return res.redirect('/user/notification');
            })
            .catch(next);
    },

    getNotificationPage: function (req, res, next) {
        const success = req.flash('success') || '';
        const listCard = req.flash('listCard') || '';
        const total = req.flash('total') || '';
        const quantity = req.flash('quantity') || '';
        const card_value = req.flash('card_value') || '';
        const provider_name = req.flash('provider_name') || '';
        const createdAt = req.flash('createdAt')
        return res.render('notification', { success, createdAt, listCard, total, quantity, card_value, provider_name })
    },

    postChangePassword: function (req, res) {

    }
}



module.exports = UserController