const express = require('express')
const router = express.Router()

const { asyncHandler } = require('../../utils/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const discountController = require('../../controllers/discount.controller')


//Get discount amount
router.post('/amount', asyncHandler(discountController.getDiscountAmount));
router.get('/list_product_code'), asyncHandler(discountController.getAllDiscountCodesWithProduct);

router.use(authentication)

router.post('', asyncHandler(discountController.createDiscountCode));
router.get('', asyncHandler(discountController.getAllDiscountCodesByShop));

module.exports = router