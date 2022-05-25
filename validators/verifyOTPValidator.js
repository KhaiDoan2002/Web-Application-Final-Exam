const { check } = require('express-validator')
const Token = require('../models/TokenModel')

module.exports = [
    check('code')
        .exists().withMessage('Vui lòng nhập mã xác nhận')
        .notEmpty().withMessage('Không được bỏ trống mã xác nhận')
        .isLength({min:4,max:4}).withMessage('Mã xác nhận không hợp lệ')
        .custom((value) => {
            const code = value
            return Token.findOne({ code: code })
                .then(account => {
                    if (!account)
                        throw new Error('Mã xác nhận không đúng')
                    else
                        return true
                })
        }),

]