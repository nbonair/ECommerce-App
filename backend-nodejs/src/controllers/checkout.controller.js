const CheckOutService = require('../services/checkout.services')
const { SuccessResponse } = require('../../core/success.response')

class CheckoutController {
    checkoutReview = async (req, res, next) => {
        new SuccessResponse({
            message: "Created",
            metadata: await CheckOutService.checkoutReview(req.body)
        }).send(res)
    }
}

module.exports = new CheckoutController();