const CartServices = require('../services/cart.services')
const { SuccessResponse } = require('../../core/success.response')

class CartController {
    addToCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Created Cart Successfully',
            metadata: await CartServices.addToCart(req.body)
        }).send(res)
    }

    updateCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Created Cart Successfully',
            metadata: await CartServices.addProductToCart(req.body)
        }).send(res)
    }

    delete = async (req, res, next) => {
        new SuccessResponse({
            message: 'Created Cart Successfully',
            metadata: await CartServices.deleteCartItem(req.body)
        }).send(res)
    }

    getUserCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Created Cart Successfully',
            metadata: await CartServices.getUserCart(req.body)
        }).send(res)
    }
}

module.exports = new CartController();