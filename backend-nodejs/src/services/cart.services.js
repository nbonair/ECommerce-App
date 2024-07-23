const { BadRequestError, NotFoundError } = require('../../core/error.response');
const { cart } = require('../models/cart.model');

class CartServices {

    static async createUserCart({ userId, product }) {
        const query = { cart_userId: userId, cart_state: 'active' }
        const updateOrInsert = {
            $addToSet: {
                cart_products: product
            }
        }
        const option = { upsert: true, new: true }

        return await cart.findOneAndUpdate(query, update, options)
    }

    static async addProductToCart({ userId, product = {} }) {
        const userCart = await cart.findOne({ cart_userId: userId }).lean();
        if (!userCart) {
            return await CartServices.createUserCart({ userId, product })
        }
    }
} 


module.exports = CartServices