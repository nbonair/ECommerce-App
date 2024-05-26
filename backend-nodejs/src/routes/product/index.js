const express = require('express')
const productController = require('../../controllers/product.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const router = express.Router()

//Public User
router.get('/search/:keySearch', asyncHandler(productController.getSearchProduct))

// Authentication Middleware
router.use(authentication)
router.post('', asyncHandler(productController.createProduct))
router.post('/publish/:id', asyncHandler(productController.publishProduct))
router.post('/archive/:id', asyncHandler(productController.archiveProduct))

router.get('/drafts/all', asyncHandler(productController.getAllDrafts))
router.get('/published/all', asyncHandler(productController.getAllPublished))
module.exports = router