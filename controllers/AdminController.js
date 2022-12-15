const User = require('../models/UserModel')
const { normalizeDate } = require('../middleware/functions')
const AdminController = {
    // GET ONE
    getIndex: async function (req, res) 
    {
        // try {

        // } catch (error) 
        // {
        //     console.log(error)
        //     res.redirect('/user/logout')
        // }
                    // Danh sách giao dịch trên 5tr
                    const listUser = await User.find()
                    let admin
                    const listUserNotAdmin = []
                    listUser.forEach(user => 
                    {
                        if (user.username != 'admin')
                            listUserNotAdmin.push(user)
                        else
                            admin = user
                    })
                    const list = listUserNotAdmin.map(item => 
                    {
                        return (item.history).filter(h => 
                        {
                            return h._doc.amount >= 5000000 && h._doc.status === 'Đang chờ duyệt'
                        })
                    })
                    let context=[]
                    list.forEach(account => 
                    {
                        account.forEach(h=>
                        {
                            let icon = '';
                            if (h.action == 'Rút tiền') 
                            {
                                icon = 'bi bi-cash';
                            }
                            else if (h.action == 'Chuyển tiền') 
                            {
                                icon = 'bi bi-arrow-down-up';
                            }
                            else if (h.action.includes('Mua thẻ')) 
                            {
                                icon = 'bi bi-phone';
                            }
                            else 
                            {
                                icon = 'bi bi-bank';
                            }
            
                            let style = '';
                            if (h.status == 'Hoàn thành') 
                            {
                                style = 'success';
                            }
                            else if (h.status == 'Đang chờ duyệt') 
                            {
                                style = 'warning';
                            }
                            else 
                            {
                                style = 'danger';
                            }
                            context.push({
                                id: h._id,
                                action: h.action,
                                amount: h.amount,
                                fee: h.fee,
                                createdAt: normalizeDate(h.createdAt),
                                status: h.status,
                                icon: icon,
                                style: style
                            });
                        })
                        
                    })
                    console.log(context)
                    res.render('admin', 
                    {
                        data: context,
                        fullname: admin.fullname,
                        username: admin.username,
                        phone: admin.phone,
                        email: admin.email
                    })

    },
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
            const admin = await User.findOne({ username: 'admin' })
            const ListUserNotActivated = await User.find({ status: 'Not_verified' })
            const user = ListUserNotActivated.map(u => {
                return {
                    id: u._id,
                    fullname: u.fullname,
                    email: u.email,
                    address: u.address,
                    birth: normalizeDate(u.birth),
                    createdAt: normalizeDate(u.createAt),
                    status: u.status,
                    backID: u.backID,
                    frontID: u.frontID,
                    username: u.username,
                }
            })
            res.render('listNotActived', {
                data: user,
                fullname: admin.fullname,
                username: admin.username,
                phone: admin.phone,
                email: admin.email
            })
        } catch (err) {
            console.log(err)
        }
    },
    getUserActivated: async function (req, res) {
        try {
            const admin = await User.findOne({ username: 'admin' })
            const ListUserActivated = await User.find({ status: 'Verified' }).sort({ createAt: -1 })
            const user = ListUserActivated.map(u => {
                return {
                    id: u._id,
                    fullname: u.fullname,
                    email: u.email,
                    address: u.address,
                    birth: normalizeDate(u.birth),
                    createdAt: normalizeDate(u.createAt),
                    status: u.status,
                    backID: u.backID,
                    frontID: u.frontID,
                    username: u.username,
                }
            })
            res.render('listActivated', {
                data: user,
                fullname: admin.fullname,
                username: admin.username,
                phone: admin.phone,
                email: admin.email
            })
        } catch (err) {
            console.log(err)
        }
    },
    getUserDisable: async function (req, res) {
        try {
            const admin = await User.findOne({ username: 'admin' })
            const ListUserDisable = await User.find({ status: 'Disable' }).sort({ createAt: -1 })
            const user = ListUserDisable.map(u => {
                return {
                    id: u._id,
                    fullname: u.fullname,
                    email: u.email,
                    address: u.address,
                    birth: normalizeDate(u.birth),
                    createdAt: normalizeDate(u.createAt),
                    status: u.status,
                    backID: u.backID,
                    frontID: u.frontID,
                    username: u.username,
                }
            })
            res.render('listDisable', {
                data: user,
                fullname: admin.fullname,
                username: admin.username,
                phone: admin.phone,
                email: admin.email
            })
        } catch (err) {
            console.log(err)
        }
    },
    getUserLocked: async function (req, res) {
        try {
            const admin = await User.findOne({ username: 'admin' })
            const ListUserLocked = await User.find({ status: 'Locked' }).sort({ blockAt: -1 })
            const user = ListUserLocked.map(u => {
                return {
                    id: u._id,
                    fullname: u.fullname,
                    email: u.email,
                    address: u.address,
                    birth: normalizeDate(u.birth),
                    createdAt: normalizeDate(u.createAt),
                    status: u.status,
                    backID: u.backID,
                    frontID: u.frontID,
                    username: u.username,
                    failAccess: u.failAccess,
                    blockAt: normalizeDate(u.blockAt)
                }
            })
            res.render('listLocked', {
                data: user,
                fullname: admin.fullname,
                username: admin.username,
                phone: admin.phone,
                email: admin.email
            })
        } catch (err) {
            console.log(err)
        }
    },

    // UPDATE ONE
    getActivatedUser: async function (req, res) {
        try {
            const id = req.params.id
            const user = await User.findByIdAndUpdate(id, { status: 'Verified' })
            res.redirect('/admin/')
        } catch (error) {
            console.log(error)
        }
    },

    getWaitForUpdate: async function (req, res) {
        try {
            const id = req.params.id
            const user = await User.findByIdAndUpdate(id, { status: 'Wait_for_update' })
            res.redirect('/admin/')
        } catch (error) {
            console.log(error)
        }
    },

    getRefuseActivated: async function (req, res) {
        try {
            const id = req.params.id
            const user = await User.findByIdAndUpdate(id, { status: 'Disabled' })
            res.redirect('/admin/')
        } catch (error) {
            console.log(error)
        }
    },

    getUnlockUser: async function (req, res) {
        try {
            const id = req.params.id
            const user = await User.findByIdAndUpdate(id, { status: 'Not_verified', failAccess: 0 })
            res.redirect('/admin/')
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
            const listUser = await User.find()
            const user = listUser.find(item => {
                return item.history.find(h => {
                    return h._id == id
                })
            })
            const history = (user.history).find(h => {
                return h._id == id
            })
            user.balance -= (history.amount + history.fee)
            history.status = 'Hoàn thành'
            user.save()
            res.redirect('/admin/')
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