const express = require('express')
const router = express.Router()
const couponController = require('../Controller/couponController')


router.get('/newCoupon',couponController.newCoupon)
router.post('/newCouponPost',couponController.newCouponPost)
router.get('/couponMgmSys',couponController.couponMgmSys)
router.get('/changeStatus/:id',couponController.changeCouponStatus)
router.post('/couponValidation',couponController.couponValidation)
router.get('/delete/:id',couponController.remove)
// router.post('/applyCoupon'.couponController.applycoupon)









module.exports = router