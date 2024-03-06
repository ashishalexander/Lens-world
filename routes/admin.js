const express = require('express')
const router = express.Router()
const adminController = require('../Controller/admincontroller')
const uploadProductImg = require('../middleware/admin_middleware')
const authMiddleware = require('../middleware/authmiddleware')
const authzMiddleware = require('../middleware/authorizationMiddleware')


router.get('/login',adminController.login)
router.post('/login',adminController.loginPost)
router.get('/logout',adminController.logout)

router.use(authMiddleware);

router.get('/dashboard',authzMiddleware('admin'),adminController.dashboard)
router.get('/dashboard/revenue',authzMiddleware('admin'),adminController.revenueChart)
router.get('/usermgm',authzMiddleware('admin'),adminController.usermgm)
router.get('/userStatus/:_id',authzMiddleware('admin'),adminController.userStatus)
router.get('/productMgm',authzMiddleware('admin'),adminController.productMgm)
router.post('/addProduct',authzMiddleware('admin'),uploadProductImg.array('image',12),adminController.addProductPost)
router.get('/addProduct',authzMiddleware('admin'),adminController.addProduct)
router.get('/update/:id',authzMiddleware('admin'),adminController.productDetailUpdate)
router.get('/delete/:id',authzMiddleware('admin'),adminController.productDetailDelete)
router.post('/productDetailAddProduct/:id',authzMiddleware('admin'),uploadProductImg.array('image',12),adminController.productDetailUpdatePost)
router.get('/categoryMgm',authzMiddleware('admin'),adminController.categoryMgm)
router.get('/addNewCateg',authzMiddleware('admin'),adminController.addNewCateg)
router.get('/edit/:id',authzMiddleware('admin'),adminController.categoryEdit)
router.post('/editCateg/:id',authzMiddleware('admin'),adminController.editCategPost)
router.get('/delcateg/:id',authzMiddleware('admin'),adminController.removeCateg)
router.post('/addNewCateg',authzMiddleware('admin'),adminController.addNewCategPost)
router.post('/deleteImage/:id',authzMiddleware('admin'),adminController.imageDelFetch)
router.get('/orderStatus',authzMiddleware('admin'),adminController.orderStatus)
router.put('/changeStatus',authzMiddleware('admin'),adminController.changeStatus)
router.get('/bannerMgm',authzMiddleware('admin'),adminController.bannerMgm)
router.get('/newBanner',authzMiddleware('admin'),adminController.addNewBanner)
router.post('/newBannerPost',authzMiddleware('admin'),uploadProductImg.array('imageUrl',12),adminController.addNewBannerPost)
router.get('/banner/status/:id',authzMiddleware('admin'),adminController.bannerStatus)
router.get('/banner/delete/:id',authzMiddleware('admin'),adminController.bannerdelete)
router.put('/acceptReturn/:orderId/:orderItemId',adminController.acceptReturn)
router.put('/rejectReturn/:orderId/:orderItemId',adminController.rtnRejected)

router.get('/orderReturn',adminController.orderReturn)
// router.put('/orginalReturn',adminController.orginalReturn)

module.exports = router