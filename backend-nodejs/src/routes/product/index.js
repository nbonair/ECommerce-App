const express = require('express')
const productController = require('../../controllers/product.controller')
const { asyncHandler } = require('../../utils/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const router = express.Router()

//Public User
router.get('/search/:keySearch', asyncHandler(productController.getSearchProduct))
router.get('', asyncHandler(productController.getAllProducts))
router.get('/:product_id', asyncHandler(productController.getProduct))

// Authentication Middleware
router.use(authentication)

//Product 
router.post('', asyncHandler(productController.createProduct))
router.patch('/:productId', asyncHandler(productController.updateProduct))

router.post('/publish/:id', asyncHandler(productController.publishProduct))
router.post('/archive/:id', asyncHandler(productController.archiveProduct))

router.get('/drafts/all', asyncHandler(productController.getAllDrafts))
router.get('/published/all', asyncHandler(productController.getAllPublished))
module.exports = router