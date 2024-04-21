'use strict'

const express = require('express')
const accessController = require('../controllers/access.controller')
const router = express.Router()

router.use('/v1/api', require('./access'))

module.exports = router