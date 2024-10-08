

const express = require('express')
const accessController = require('../controllers/access.controller')
const { apiKey, permission } = require('../auth/checkAuth')
const router = express.Router()

// Check API key -> Use a middleware
router.use(apiKey)
// Check Permission
router.use(permission('0'))

router.use('/v1/api/checkout', require('./checkout'))
router.use('/v1/api/discount', require('./discount'))
router.use('/v1/api/cart', require('./cart'))
router.use('/v1/api/product', require('./product'))
router.use('/v1/api', require('./access'))

module.exports = router