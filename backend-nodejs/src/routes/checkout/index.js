const express = require('express')
const router = express.Router()

const { asyncHandler } = require('../../utils/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const CheckoutController = require('../../controllers/checkout.controller')


//Get discount amount
router.post('/review', asyncHandler(CheckoutController.checkoutReview))
module.exports = router