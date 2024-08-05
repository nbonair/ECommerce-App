const { BadRequestError, NotFoundError } = require('../../core/error.response');
const { cart } = require('../models/cart.model');
const { product } = require('../models/product.model');
const { getProductById } = require('../models/repositories/product.repo');

class CartServices {

    static async createCart({ userId, product }) {
        const query = { cart_userId: userId, cart_state: 'active' }
        const updateOrInsert = {
            $addToSet: {
                cart_products: product
            }
        }
        const options = { upsert: true, new: true }

        return await cart.findOneAndUpdate(query, update, options)
    }

    static async updateCartQuantity({ userId, product }) {
        const { productId, quantity } = product
        const query = {
            cart_userId: userId,
            'cart_products.productId': productId,
            cart_state: 'active'
        }, updateSet = {
            $inc: {
                'cart_products.$.quantity': quantity
            }
        }, options = { upsert: true, new: true }

        return await cart.findOneAndUpdate(query, updateSet, options)
    }

    static async addToCart({ userId, product = {} }) {
        const userCart = await cart.findOne({ cart_userId: userId }).lean();
        if (!userCart) {
            return await CartServices.createCart({ userId, product })
        }

        if (!userCart.cart_products.length) {
            userCart.cart_products = [product];
            return await userCart.save()
        }

        return await CartServices.updateCartQuantity({ userId, product })
    }


    /*
        *Cart's product payload: 
        product: {
            shop_order_ids = [
                {
                    shopId,
                    item_products: [
                        {
                            quantity,
                            price, 
                            productId,
                            old_quantity,
                            productId
                        }
                    ]
                }
            ]
        }
    */
    static async addProductToCart({ userId, product = {} }) {
        const { productId, quantity, old_quantity } = shop_order_ids[0]?.item_product[0];

        const foundProduct = await getProductById({ product_id: productId, unSelect: [] });

        if (!foundProduct) throw new NotFoundError('Product does not exist');

        if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) throw new NotFoundError('Product does not belongs to shop');

        if (quantity === 0) {
            await CartServices.deleteCartItem()
        }

        return await CartServices.updateCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity
            }
        })
    }

    static async deleteCartItem({ userId, productId }) {
        const query = { cart_userId: userId, cart_state: 'active' },
            updateSet = {
                $pull: {
                    cart_products: {
                        productId
                    }
                }
            }

        const deleteCart = await cart.updateOne(query, updateSet)

        return deleteCart
    }

    static async getUserCart({ userId }) {
        return await cart.findOne(
            {
                cart_userId: +userId,
            }).lean()
    }
}


module.exports = CartServices;