const express = require ("express")
const router = express.Router()
const usercontroller =require('../Controller/usercontroller.js')
const isBlocked =require('../middleware/userStatusCheck.js')


router.use(isBlocked);


router.get('/',usercontroller.dashboard)
router.get('/userDashboard',usercontroller.userDashboard)
router.get('/userLogin',usercontroller.userLogin)
router.post('/userLogin',usercontroller.userLoginPost)
router.get('/userRegister',usercontroller.userRegister)
router.post('/userRegister',usercontroller.userRegisterPost)
router.get('/otp',usercontroller.verificationotp)
router.post('/verifyotp',usercontroller.otpvalidation)
router.get('/resendotp',usercontroller.resendotp)
router.get('/logout',usercontroller.logout)
router.get('/ForgotpasswordEmail',usercontroller.ForgotPasswordEmail)
router.post('/ForgotpasswordEmail',usercontroller.ForgotPasswordEmailPost)
router.get('/ForgotPassVerifyotp',usercontroller.ForgotPasswordVerifyOtp)
router.post('/ForgotPassVerifyotp',usercontroller.ForgotPassVerifyOtpPost)
router.get('/ForgotResetPassword',usercontroller.ForgotResetPassword)
router.post('/ForgotResetPassword',usercontroller.ForgotResetPasswordPost)

router.get('/userNav',usercontroller.userNav)
router.get('/userrefferal/:id',usercontroller.userrefferal)
router.post('/referralPost',usercontroller.referralPost)


module.exports = router