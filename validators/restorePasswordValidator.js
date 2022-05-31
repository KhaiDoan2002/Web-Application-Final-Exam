const { check } = require('express-validator')
const User = require('../models/UserModel')

module.exports = [
    check('email')
        .exists().withMessage('Vui lòng nhập địa chỉ email')
        .notEmpty().withMessage('Không được bỏ trống địa chỉ email')
        .isEmail().withMessage('Email không hợp lệ')
        .custom((value, { req }) => {
            const email = req.body.email
            return User.findOne({ email: email })
                .then(account => {
                    if (!account)
                        throw new Error('Email không tồn tại')
                    else
                        return true
                })
        }),

    check('phone')
        .exists().withMessage('Vui lòng xác nhận số điện thoại')
        .notEmpty().withMessage('Vui lòng xác nhận số điện thoại')
        .isLength({ min: 6 }).withMessage('số điện thoại không hợp lệ')
        .custom((value, { req }) => {
            const phone = req.body.phone
            return User.findOne({ phone: phone })
                .then(account => {
                    if (!account)
                        throw new Error('Số điện thoại không tồn tại')
                    else {
                        if (req.body.email !== account.email)
                            throw new Error('Email và Số điện thoại không trùng khớp')
                    }
                    return true
                })
        }),

]