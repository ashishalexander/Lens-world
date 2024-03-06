const express = require('express')
const router = express.Router()
const cartController = require('../Controller/cartController')
const isBlocked =require('../middleware/userStatusCheck.js')

router.use(isBlocked);

router.get('/getCart',cartController.getCart)
router.get('/addCart/:id',cartController.addCart)
router.get('/removeItem/:id',cartController.removeItem)
router.get('/checkStock/:productId/:newQuantity',cartController.stockCheck)
router.put('/updateQuantity/:productId/:newQuantity',cartController.updateQuantity)
router.get('/checkout',cartController.checkOut)
router.get('/addNewAddressCheckOut',cartController.addAddress)
router.post('/addNewAddressCheckOut',cartController.addAddressPost)
router.post('/placeOrder',cartController.placeOrder)
router.get('/orderSuccessPg',cartController.orderSuccessPg)
router.post('/onlinePayment',cartController.onlinePayment)
router.post('/paymentCapture',cartController.paymentCapture)
router.get('/paymentfailure/:selectedAddress',cartController.paymentFailure)


module.exports = router
