const express = require('express')
const router = express.Router()
const AdminController = require('../controllers/AdminController')
const checkLogin = require('../auth/checkLogin')

router.get('/', checkLogin, AdminController.getIndex)
// Xem thông tin của user
router.get('/user/:id', AdminController.getUserInfo)
// GET ALL
router.get('/getAll', AdminController.getAllUser)
// Xem danh sách tài khoản chở kích hoạt
router.get('/userNotActivated', AdminController.getUserNotActivated)
// Danh sách tài khoản đã kích hoạt: sắp xếp thời gian giảm dần theo ngày tạo
router.get('/userActivated', AdminController.getUserActivated)
// Danh sách tài khoản bị vô hiệu hóa (do không đồng ý kích hoạt): sắp xếp giảm dần theo ngày tạo
router.get('/userDisable', AdminController.getUserDisable)
// Danh sách tài khoản đang bị khóa vô thời hạn : sắp xếp theo thời gian bị khóa
router.get('/userLocked', AdminController.getUserLocked)
// Danh sách giao dịch
// UPDATE ONE
// Xác minh tài khoản
router.get('/activatedUser/:id', AdminController.getActivatedUser)
router.get('/waitForUpdate/:id', AdminController.getWaitForUpdate)
router.get('/refuseActivated/:id', AdminController.getRefuseActivated)

// Mở khóa tài khoản bị khóa
router.get('/unlockUser/:id', AdminController.getUnlockUser)

// router.get('/add', AdminController.getAddHistory)
router.get('/getHistory', AdminController.getHistory)

// Thay đổi trạng thái của giao dịch (Xác nhận giao dịch)
router.get('/confirmation/:id', AdminController.getUpdateStatus)

router.get('/add', AdminController.getAddHistory)
module.exports = router