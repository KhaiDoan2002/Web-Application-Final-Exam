const express = require('express')
const router = express.Router()
const registerValidator = require('../validators/registerValidator')
const loginValidator = require('../validators/loginValidator')
const UserController = require('../controllers/UserController')
const checkLogin = require('../auth/checkLogin')
const checkUser = require('../auth/checkUser')
const resetPasswordValidator = require('../validators/resetPasswordValidator')
const restorePasswordValidator = require('../validators/restorePasswordValidator')
const verifyOTPValidator = require('../validators/verifyOTPValidator')
const resetPasswordByOTPValidator = require('../validators/resetPasswordByOTPValidator')
const middleware = require('../middleware/index')


// Register
router.get('/register', UserController.getRegister)
router.post('/register', middleware.multipleUpload, registerValidator, UserController.postRegister)

// Login
router.get('/login', middleware.roleLogin, UserController.getLogin)
router.post('/login', loginValidator, UserController.postLogin)

// Logout
router.get('/logout', UserController.getLogout)

// Index page
router.get('/', checkLogin, checkUser, middleware.getUser, UserController.getIndex)

// Reset Password In First Access
router.get('/resetPassword', checkLogin, middleware.roleResetPassword, UserController.getResetPassword)
router.post('/resetPassword', resetPasswordValidator, middleware.getUser, UserController.postResetPassword)

// Restore Password
router.get('/restorePassword', UserController.getRestorePassword)
router.post('/restorePassword', restorePasswordValidator, UserController.postRestorePassword)

// Verify OTP
router.get('/verifyOTP', UserController.getVerifyOTP)
router.post('/verifyOTP', verifyOTPValidator, UserController.postVerifyOTP)

// Resend OTP
router.get('/resendOTP', UserController.getResendOTP)

// Reset Password By OTP 
router.get('/resetPasswordByOTP', middleware.roleResetPasswordByOTP, UserController.getResetPassword)
router.post('/resetPasswordByOTP', resetPasswordByOTPValidator, UserController.postResetPasswordByOTP)

// Deposit money
router.get('/deposit', checkLogin, UserController.getDepositPage)
router.post('/deposit', middleware.getUser, UserController.postDepositPage);

// Withdraw money
router.get('/withdraw', checkLogin, UserController.getWithdrawPage)
router.post('/withdraw', middleware.getUser, UserController.postWithdrawPage);

// Transfer money
router.get('/transfer', checkLogin, UserController.getTransferPage);
router.post('/transfer', middleware.getUser, UserController.postTransferPage);
router.get('/transfer/confirm', checkLogin, UserController.getTransferConfirm);
router.post('/transfer/confirm', middleware.getUser, UserController.postTransferConfirm);

// Mobile card
router.get('/buycard', checkLogin, UserController.getMobileCardPage);
router.post('/buycard', middleware.getUser, UserController.postMobileCardPage);
router.get('/notification', UserController.getNotificationPage);

module.exports = router