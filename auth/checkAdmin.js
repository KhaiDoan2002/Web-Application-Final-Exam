module.exports = (req, res, next) => {
    if (req.body.username === 'admin')
        next()
    else
        res.redirect('/user/logout')
}