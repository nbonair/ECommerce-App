

const express = require('express')
const accessController = require('../../controllers/access.controller')
const { asyncHandler } = require('../../utils/asyncHandler')
const router = express.Router()

// sign-up
router.post('/shop/signup', asyncHandler(accessController.signUp))

module.exports = router