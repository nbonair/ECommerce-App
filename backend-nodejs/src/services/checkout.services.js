const { BadRequestError } = require("../../core/error.response");
const { findCartById } = require("../models/repositories/cart.repo");
const { validateProductDetails } = require("../models/repositories/product.repo");

class CheckOutService {
    /*
        // with/without login
        {
            cartId,
            userId, 
            shop_order_ids: [
                {
                    shopId,
                    shop_discount: [{shopId, discountId, codeId}],
                    item_products: {
                        price,
                        quantity,
                        productId
                    }
                }, ...
            ]
        }
    */
    static async checkoutReview({
        cartId, userId, shop_order_ids
    }) {
        const foundCart = await findCartById(cartId);
        if (!foundCart) throw BadRequestError('Cart not exist');

        const checkout_order = {
            totalPrice: 0,
            feeShip: 0,
            totalDiscount: 0,
            totalCheckout: 0
        }, shop_order_ids_new = []

        for (let i = 0; i < shop_order_ids.length; i++) {
            const { shopId, shop_discount = [], item_products = [] } = shop_order_ids[i]

            const checkProducts = validateProductDetails(item_products)

            if (!checkProducts[0]) throw new BadRequestError('Order wrong or unavailable')
            const checkoutPrice = (await checkProducts).reduce((acc, checkoutProduct) => { acc + checkoutProduct.quantity * checkoutProduct.price }, 0)
        }

        checkout_order.totalPrice += checkoutPrice

        const itemCheckout = {
            shopId, 
        }
    }
}

module.exports = CheckOutService