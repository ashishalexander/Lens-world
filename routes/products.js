const express = require('express')
const router = express.Router()
const productController = require('../Controller/productController')
const isBlocked =require('../middleware/userStatusCheck.js')
const paginate = require('../middleware/pagination')

router.use(isBlocked);



router.get('/productDetailPg/:id',productController.productDetailPg)
router.get('/dynamicProductListing',paginate,productController.dynamicProductListing)
router.get('/search',productController.search)
router.get('/searcheditem',productController.searcheditem)
router.post('/ApplyFilter',productController.applyFilter)
router.post('/sortByPrice',productController.sortByPrice)
router.post('/allFilter',productController.allFilter)
module.exports = router