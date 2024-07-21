const DiscountServices = require('../services/discount.services')
const { SuccessResponse } = require('../../core/success.response')

class DiscountController {
    createDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create Discount Code Successfully',
            metadata: await DiscountServices.createDiscountCode({
                ...req.body,
                shopId: req.user.userId //ShopId
            })
        }).send(res);
    }

    getAllDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successfully found code',
            metadata: await DiscountServices.getAllDiscountCode({
                ...req.query,
                shopId: req.user.userId //ShopId
            })
        }).send(res);
    }


    getDiscountAmount = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successfully get discount amount',
            metadata: await DiscountServices.getDiscountAmount({
                ...req.body
            })
        }).send(res);
    }

    getAllDiscountCodesByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successfully found code',
            metadata: await DiscountServices.getAllDiscountCodesByShop({
                ...req.body,
                shopId: req.user.userId //ShopId
            })
        }).send(res);
    }

    getAllDiscountCodesWithProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successfully found code',
            metadata: await DiscountServices.getAllDiscountCodesWithProduct({
                ...req.query
            })
        }).send(res);
    }
}

module.exports = new DiscountController();