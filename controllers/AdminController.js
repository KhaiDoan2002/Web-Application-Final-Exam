const User = require('../models/UserModel')

const AdminController = {
    // GET ONE
    getUserInfo: async function (req, res) {
        try {
            const id = req.params.id
            const UserInfo = await User.findById(id)
            res.json({ code: 1, user: UserInfo })
        } catch (error) {
            console.log(error)
        }
    },
    // GET ALL
    // Lấy tất cả user:
    getAllUser: async function (req, res) {
        try {
            const ListAllUser = await User.find()
            res.json({ code: 1, users: ListAllUser })
        } catch (error) {
            console.log(error)
        }
    },
    getUserNotActivated: async function (req, res) {
        try {
            const ListUserNotActivated = await User.find({ status: 'Not_verified' })
            res.json({ code: 1, users: ListUserNotActivated })
        } catch (err) {
            console.log(err)
        }
    },
    getUserActivated: async function (req, res) {
        try {
            const ListUserActivated = await User.find({ status: 'Verified' }).sort({ createAt: -1 })
            res.json({ code: 1, users: ListUserActivated })
        } catch (err) {
            console.log(err)
        }
    },
    getUserDisable: async function (req, res) {
        try {
            const ListUserDisable = await User.find({ status: 'Disable' }).sort({ createAt: -1 })
            res.json({ code: 1, users: ListUserDisable })
        } catch (err) {
            console.log(err)
        }
    },
    getUserLocked: async function (req, res) {
        try {
            const ListUserLocked = await User.find({ status: 'Locked' }).sort({ blockAt: -1 })
            res.json({ code: 1, users: ListUserLocked })
        } catch (err) {
            console.log(err)
        }
    },

    // UPDATE ONE
    getActivatedUser: async function (req, res) {
        try {
            const id = req.params.id
            const user = await User.findByIdAndUpdate(id, { status: 'Verified' })
            res.json({ code: 1, users: user })
        } catch (error) {
            console.log(error)
        }
    },

    getWaitForUpdate: async function (req, res) {
        try {
            const id = req.params.id
            const user = await User.findByIdAndUpdate(id, { status: 'Wait_for_update' })
            res.json({ code: 1, users: user })
        } catch (error) {
            console.log(error)
        }
    },

    getRefuseActivated: async function (req, res) {
        try {
            const id = req.params.id
            const user = await User.findByIdAndUpdate(id, { status: 'Disabled' })
            res.json({ code: 1, users: user })
        } catch (error) {
            console.log(error)
        }
    },

    getUnlockUser: async function (req, res) {
        try {
            const id = req.params.id
            const user = await User.findByIdAndUpdate(id, { status: 'Not_verified', failAccess: 0 })
            res.json({ code: 1, users: user })
        } catch (error) {
            console.log(error)
        }
    },

    getHistory: async function (req, res) {
        try {
            const listUser = await User.find()
            const listHistory = []
            listUser.forEach(user => {
                if (user.username != 'admin')
                    user.history.forEach(item => {
                        listHistory.push(item)
                    })
            })
            const sortHistory = listHistory.slice().sort((a, b) => b.CreateAt - a.CreateAt)
            const receive = sortHistory.filter(item => {
                return item.amount >= 5000000 && item.status === 'Đang chờ duyệt'
            })

            res.json({ result: receive })
        } catch (error) {
            console.log(error)
        }
    },


    getUpdateStatus: async function (req, res) {
        try {
            const id = req.params.id
            const user = await User.findById(id)
            const history = user.history[0]

            const result = await User.updateOne({ _id: id }, {
                $set: {
                    history: [{
                        action: history.action,
                        Status: 'Hoàn thành',
                        amount: history.amount,
                        fee: history.fee,
                        receive_code: history.receive_code,
                        note: history.note,
                        CreateAt: history.CreateAt
                    }]
                }
            })
            res.json({ code: 1, result: result })
        } catch (error) {
            console.log(error)
        }
    },

    getAddHistory: async function (req, res) {
        const history = {
            action: 'trade',
            amount: 20000,
            fee: 1500,
            receive_code: 'CII',
            note: 'KHAI HOANG CHUYEN TIEN',
            Status: 'Pending',
        }
        try {
            const result = await User.updateOne({ email: 'hoangbo74@gmail.com' }, { $push: { history: history } })
            res.json({ code: 1, result: result })
        } catch (error) {
            console.log(error)
        }

    }

}


module.exports = AdminController