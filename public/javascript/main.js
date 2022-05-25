let fail = document.getElementById('failAccess')
if (fail) {
    countDown()
}

if (document.getElementById('timer'))
    countDownVerify()



function countDown() {
    let minutes = 60
    let x = setInterval(() => {
        minutes -= 1
        document.getElementById('failAccess').innerHTML = 'Bạn đã nhập sai mật khẩu. '
            + 'Tài khoản của bạn đã bị khóa tạm thời vui lòng thử lại sau 00:' + ((minutes >= 10) ? minutes : ('0' + minutes))
    }, 1000)

    setTimeout(() => {
        clearInterval(x)
        document.getElementById('failAccess').innerHTML = ''
        location.reload()
    }, 60000);
}

function countDownVerify() {
    let minutes = 60

    let x = setInterval(() => {
        minutes -= 1
        document.getElementById('timer').innerHTML = '00:' + ((minutes >= 10) ? minutes : ('0' + minutes))
    }, 1000)

    setTimeout(() => {
        clearInterval(x)
        document.getElementById('timer').innerHTML = ''
        document.getElementById('verify-alert').innerHTML = `<div class="alert alert-danger mt-2">Mã OTP đã hết hạn</div>`
        document.getElementById('resend-btn').style.display = 'inline-flex'
    }, 60000);

    setTimeout(() => {
        document.getElementById('verify-alert').innerHTML = ''
    }, 70000);


}