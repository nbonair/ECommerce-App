const { BadRequestError } = require("../../core/error.response");
const { product } = require("../models/product.model");
const { findCartById } = require("../models/repositories/cart.repo");
const { validateProductDetails } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.services");

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
        cartId, userId, shop_order_ids = []
    }) {
        const foundCart = await findCartById(cartId);
        if (!foundCart) throw BadRequestError('Cart not exist');

        const checkout_order = {
            totalPrice: 0, //Total amount
            feeShip: 0, // Courier
            totalDiscount: 0, //Total discount
            totalCheckout: 0 // Final payment
        }, shop_order_ids_new = []

        for (let i = 0; i < shop_order_ids.length; i++) {
            const { shopId, shop_discounts = [], item_products = [] } = shop_order_ids[i]

            const checkProducts = await validateProductDetails(item_products)
            // console.log(`Validate Products : `,checkProducts)

            if (!checkProducts[0]) throw new BadRequestError('order wrong or unavailable');

            const checkoutPrice = checkProducts.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            }, 0)

            checkout_order.totalPrice += checkoutPrice

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice,
                priceAppliedDiscount: checkoutPrice,
                item_products: checkProducts
            }

            // Validate shop discounts
            if (shop_discounts.length > 0) {
                const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProducts
                })

                checkout_order.totalDiscount += discount

                if (discount > 0) {
                    itemCheckout.priceAppliedDiscount = checkoutPrice - discount
                }
            }

            checkout_order.totalCheckout += itemCheckout.priceAppliedDiscount
            shop_order_ids_new.push(itemCheckout)
        }
        
        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
        }


    }
}

module.exports = CheckOutService