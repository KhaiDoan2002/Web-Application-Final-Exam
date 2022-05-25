const { check } = require('express-validator')

module.exports = [
    check('newPass')
        .exists().withMessage('Vui lòng nhập mật khẩu mới')
        .notEmpty().withMessage('Không được bỏ trống mật khẩu mới')
        .isLength({ min: 6 }).withMessage('Mật khẩu mới không hợp lệ'),


    check('rePass')
        .exists().withMessage('Vui lòng xác nhận mật khẩu mới')
        .notEmpty().withMessage('Vui lòng xác nhận mật khẩu mới')
        .isLength({ min: 6 }).withMessage('Mật khẩu mới không hợp lệ')
        .custom((value, { req }) => {
            if (value != req.body.newPass)
                throw new Error('Mật khẩu xác nhận không khớp')
            return true
        }),

]