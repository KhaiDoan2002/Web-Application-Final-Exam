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

const inputWithdrawAmountToWithdraw = document.getElementById(
    'inputWithdrawAmountToWithdraw'
)

const inputWithdrawFee = document.getElementById('inputWithdrawFee')
const alertWithdrawAmountToWithdraw = document.getElementById(
    'alertWithdrawAmountToWithdraw'
)

const inputWithdrawTotalAmount = document.getElementById(
    'inputWithdrawTotalAmount'
)

const btnNextToTransferConfirm = document.getElementById(
    'btnNextToTransferConfirm'
)
const btnPreviousToTransfer = document.getElementById('btnPreviousToTransfer')
const btnNextToDepositConfirm = document.getElementById(
    'btnNextToDepositConfirm'
)
const btnPreviousToDeposit = document.getElementById('btnPreviousToDeposit')
const btnNextToPhoneCardConfirm = document.getElementById(
    'btnNextToPhoneCardConfirm'
)
const btnPreviousToPhoneCard = document.getElementById('btnPreviousToPhoneCard')

let modelTransfer = document.getElementById('modelTransfer')
let modelTransferConfirm = document.getElementById('modelTransferConfirm')
let modelDeposit = document.getElementById('modelDeposit')
let modelDepositConfirm = document.getElementById('modelDepositConfirm')
let modelWithdraw = document.getElementById('modelWithdraw')
let modelWithdrawConfirm = document.getElementById('modelWithdrawConfirm')
let modelPhoneCard = document.getElementById('modelPhoneCard')
let modelPhoneCardConfirm = document.getElementById('modelPhoneCardConfirm')

const inputTransferCardNumber = document.getElementById(
    'inputTransferCardNumber'
)
const inputTransferName = document.getElementById('inputTransferName')

inputWithdrawAmountToWithdraw.addEventListener('keyup', function (event) {
    event.preventDefault()
    // inputWithdrawAmountToWithdraw divide by 50000
    const inputWithdrawAmountToWithdrawValue = parseInt(
        inputWithdrawAmountToWithdraw.value
    )
    if (inputWithdrawAmountToWithdrawValue % 50000 === 0) {
        alertWithdrawAmountToWithdraw.classList.add('d-none')
    } else {
        alertWithdrawAmountToWithdraw.classList.remove('d-none')
    }
    console.log(inputWithdrawAmountToWithdrawValue * 0.05)
    inputWithdrawFee.value = parseInt(inputWithdrawAmountToWithdrawValue) * 0.05
    inputWithdrawTotalAmount.value =
        parseInt(inputWithdrawFee.value) +
        parseInt(inputWithdrawAmountToWithdrawValue)
})

modelTransfer = new bootstrap.Modal(modelTransfer, {
    keyboard: false,
})

modelTransferConfirm = new bootstrap.Modal(modelTransferConfirm, {
    keyboard: false,
})

modelDeposit = new bootstrap.Modal(modelDeposit, {
    keyboard: false,
})

modelDepositConfirm = new bootstrap.Modal(modelDepositConfirm, {
    keyboard: false,
})

modelPhoneCard = new bootstrap.Modal(modelPhoneCard, {
    keyboard: false,
})

modelPhoneCardConfirm = new bootstrap.Modal(modelPhoneCardConfirm, {
    keyboard: false,
})

btnNextToTransferConfirm.addEventListener('click', function (event) {
    event.preventDefault()
    modelTransfer.hide()
    modelTransferConfirm.show()

    const inputTransferCardNumber = document.getElementById(
        'inputTransferCardNumber'
    )
    const inputTransferName = document.getElementById('inputTransferName')
    const inputTransferAmount = document.getElementById('inputTransferAmount')
    const inputTransferNote = document.getElementById('inputTransferNote')
    const inputTransferFee = document.getElementById('inputTransferFee')

    const inputTransferConfirmCardNumber = document.getElementById(
        'inputTransferConfirmCardNumber'
    )
    const inputTransferConfirmName = document.getElementById(
        'inputTransferConfirmName'
    )
    const inputTransferConfirmAmount = document.getElementById(
        'inputTransferConfirmAmount'
    )
    const inputTransferConfirmNote = document.getElementById(
        'inputTransferConfirmNote'
    )
    const inputTransferConfirmFee = document.getElementById(
        'inputTransferConfirmFee'
    )
    inputTransferConfirmCardNumber.value = inputTransferCardNumber.value
    inputTransferConfirmName.value = inputTransferName.value
    inputTransferConfirmAmount.value = inputTransferAmount.value
    inputTransferConfirmNote.value = inputTransferNote.value
    inputTransferConfirmFee.value = inputTransferFee.value
})

btnPreviousToTransfer.addEventListener('click', function (event) {
    event.preventDefault()
    modelTransfer.show()
    modelTransferConfirm.hide()
})

btnNextToDepositConfirm.addEventListener('click', function (event) {
    event.preventDefault()
    modelDeposit.hide()
    modelDepositConfirm.show()

    const inputDepositCardNumber = document.getElementById(
        'inputDepositCardNumber'
    )
    const inputDepositCardExpirationDate = document.getElementById(
        'inputDepositCardExpirationDate'
    )
    const inputDepositCardCodeCVV = document.getElementById(
        'inputDepositCardCodeCVV'
    )
    const inputDepositAmount = document.getElementById('inputDepositAmount')

    const inputDepositConfirmCardNumber = document.getElementById(
        'inputDepositConfirmCardNumber'
    )
    const inputDepositConfirmCardExpirationDate = document.getElementById(
        'inputDepositConfirmCardExpirationDate'
    )
    const inputDepositConfirmCardCodeCVV = document.getElementById(
        'inputDepositConfirmCardCodeCVV'
    )
    const inputDepositConfirmAmount = document.getElementById(
        'inputDepositConfirmAmount'
    )

    inputDepositConfirmCardNumber.value = inputDepositCardNumber.value
    inputDepositConfirmCardExpirationDate.value =
        inputDepositCardExpirationDate.value
    inputDepositConfirmCardCodeCVV.value = inputDepositCardCodeCVV.value
    inputDepositConfirmAmount.value = inputDepositAmount.value
})

btnPreviousToDeposit.addEventListener('click', function (event) {
    event.preventDefault()
    modelDeposit.show()
    modelDepositConfirm.hide()
})

btnNextToPhoneCardConfirm.addEventListener('click', function (event) {
    event.preventDefault()
    modelPhoneCard.hide()
    modelPhoneCardConfirm.show()

    const inputPhoneCardNetwork = document.getElementById('inputPhoneCardNetwork')
    const inputPhoneCardPrice = document.getElementById('inputPhoneCardPrice')
    const inputPhoneCardQuantity = document.getElementById(
        'inputPhoneCardQuantity'
    )

    const inputPhoneCardConfirmNetwork = document.getElementById(
        'inputPhoneCardConfirmNetwork'
    )
    const inputPhoneCardConfirmPrice = document.getElementById(
        'inputPhoneCardConfirmPrice'
    )
    const inputPhoneCardConfirmQuantity = document.getElementById(
        'inputPhoneCardConfirmQuantity'
    )

    inputPhoneCardConfirmNetwork.value = inputPhoneCardNetwork.value
    inputPhoneCardConfirmPrice.value = inputPhoneCardPrice.value
    inputPhoneCardConfirmQuantity.value = inputPhoneCardQuantity.value
})

btnPreviousToPhoneCard.addEventListener('click', function (event) {
    event.preventDefault()
    modelPhoneCard.show()
    modelPhoneCardConfirm.hide()
})

// Event out focus input transfer card number
inputTransferCardNumber.addEventListener('blur', function (event) {
    event.preventDefault()
    // Fetch name from API
    const inputTransferCardNumberValue = inputTransferCardNumber.value
})
