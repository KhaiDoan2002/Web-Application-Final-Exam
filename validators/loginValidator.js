const { check, body } = require('express-validator')
const User = require('../models/UserModel')
const BlockUser = require('../models/BlockUserModel')
module.exports = [
    check('username')
        .exists().withMessage('Vui lòng nhập tên đăng nhập')
        .notEmpty().withMessage('Tên đăng nhập không được bỏ trống')
        .isLength({ min: 5 }).withMessage('Tên đăng nhập không hợp lệ')
        .custom((value) => {
            return User.findOne({ username: value })
                .then(account => {
                    if (!account)
                        throw new Error('Tài khoản không tồn tại')
                    else {
                        if (account.email !== 'admin@gmail.com') 
                        {
                            if (account.status === 'Locked')
                                throw new Error('Tài khoản này đã bị vô hiệu hóa, vui lòng liên hệ tổng đài 18001008')
                            if (account.failAccess >= 3) {
                                return BlockUser.findOne({ username: value })
                                .then(block => 
                                {
                                })                            
                            }
                        }
                        return true
                    }
                })
        }),

    check('password')
        .exists().withMessage('Vui lòng nhập mật khẩu')
        .notEmpty().withMessage('Không được bỏ trống mật khẩu')
        .isLength({ min: 6 }).withMessage('Mật khẩu không hợp lệ')
]