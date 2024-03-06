const express = require('express')
const router = express.Router()
const profileController = require("../Controller/userProfileController")
const isBlocked =require('../middleware/userStatusCheck.js')

router.use(isBlocked);

router.get('/displayAccountDetails',profileController.displayAccountDetails)
router.get('/updateAccountDetails',profileController.updateAccountDetails)
router.post('/updateAccountDetails',profileController.updateAccountDetailsPost)
router.get('/addressManage',profileController.manageAddress)
router.get('/addNewAddress',profileController.addNewAddress)
router.post('/addNewAddress',profileController.addNewAddressPost)
router.get("/addressEdit/:id",profileController.editAddress)
router.post("/addressEdit/:id",profileController.editAddressPost)
router.get('/addressDelete/:id',profileController.deleteAddress)
router.get('/myOrders',profileController.myOrders)
router.put('/myOrders/cancel/:orderId/:productId',profileController.changeStatus)
router.get('/downloadinvoice/:id',profileController.invoice)
router.get('/changePassword',profileController.changePassword)
router.post('/changePassword',profileController.changePasswordPost)
router.get('/mywallet',profileController.Wallet)
router.post('/myOrders/returninit/:orderId/:productId/:orderItemId',profileController.returnOrderInit)
router.post('/pendingOrders',profileController.paymentPending)
router.post('/pendingPaymentCapture',profileController.pendingPaymentCapture)







module.exports = router