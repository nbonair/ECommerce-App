const { BadRequestError, NotFoundError } = require('../../core/error.response');
const discount = require('../models/discount.model');
const { findAllDiscountCodesUnselect, findDiscountByCode } = require('../models/repositories/discount.repo');
const { queryAllProduct } = require('../models/repositories/product.repo');
const { convertToObjectId } = require('../utils');

class DiscountServices {
    static async createDiscountCode(payload) {
        const {
            name, description, shopId, type, value, max_value, code, start_date, end_date, max_uses, user_used,
            uses_count, users_used, max_uses_per_user, min_order_value, created_by, 
            is_active, applies_to, product_ids
        } = payload;
        // Validate dates
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        const currentDate = new Date();

        if (startDate >= endDate) {
            throw new BadRequestError('Start date must be before end date');
        }

        if (currentDate < startDate || currentDate > endDate) {
            throw new BadRequestError('Discount code expired');
        }
        const foundDiscount = await findDiscountByCode({
            model: discount,
            filter: {
                discount_code: code,
                discount_shopId: convertToObjectId(shopId)
            }
        });
        console.log(foundDiscount)
        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError('Discount already exists');
        }

        const newDiscount = await discount.create({
            discount_code: code,
            discount_start_date: startDate,
            discount_end_date: endDate,
            discount_is_active: is_active,
            discount_shopId: convertToObjectId(shopId),
            discount_min_order_value: min_order_value || 0,
            discount_product_ids: product_ids,
            discount_applies_to: applies_to,
            discount_users_used: user_used,
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_max_value: max_value,
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_max_uses_per_user: max_uses_per_user
        });

        return newDiscount;
    }

    static async updateDiscountCode(payload) {
        return
    }

    static async getAllDiscountCodesWithProduct({
        code, shopId, userId, limit, page
    }) {
        const foundDiscount = await findDiscountByCode({
            model: discount,
            filter: {
                discount_code: code,
            }
        });

        if (!foundDiscount || !foundDiscount.discount_is_active) {
            throw new NotFoundError('Discount not exist');
        }

        const { discount_applies_to, discount_product_ids } = foundDiscount;

        let products;
        if (discount_applies_to == 'all') {
            products = await queryAllProduct({
                filter: {
                    product_shop: convertToObjectId(shopId),
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            });
        }

        if (discount_applies_to == 'specific') {
            products = await queryAllProduct({
                filter: {
                    _id: { $in: discount_product_ids },
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            });
        }

        return products
    }

    static async getAllDiscountCodesByShop({
        limit, page, shopId
    }) {
        const discounts = await findAllDiscountCodesUnselect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectId(shopId),
                discount_is_active: true
            },
            unSelect: ['__v', 'discount_shopId'],
            model: discount
        });

        return discounts
    }

    static async getDiscountAmount({ codeId, userId, shopId, products }) {
        const foundDiscount = await findDiscountByCode({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectId(shopId)
            }
        });

        if (!foundDiscount) throw new NotFoundError('Discount not exist');

        const {
            discount_is_active,
            discount_max_uses,
            discount_start_date,
            discount_end_date,
            discount_min_order_value,
            discount_max_uses_per_user,
            discount_users_used,
            discount_value, 
            discount_type,
        } = foundDiscount;

        if (!discount_is_active) throw new BadRequestError('Discount expired');
        if (!discount_max_uses) throw new BadRequestError('No available discount left');
        if ((new Date() > discount_end_date) || (new Date() < discount_start_date)) throw new BadRequestError('Discount not available');

        // Check total order in discount range
        let totalOrder = products.reduce((acc, product) => acc + (product.quantity) * product.price, 0)
        if (discount_min_order_value > 0) {
            if (totalOrder < discount_min_order_value) throw new BadRequestError(`Discount requires a minimum order value ${discount_min_order_value}`);
        }

        //Check if user already reach limit use
        if (discount_max_uses_per_user > 0) {
            let discountUsedAmount = discount_users_used.reduce((acc, user) => {
                if (user.userId === userId) {
                    return acc + 1;
                }
                return acc;
            }, 0);

            if (discountUsedAmount) {
                if (discountUsedAmount > discount_max_uses_per_user) throw BadRequestError('Discount reach use limit');
            }
        }

        const amount = discount_type === 'fixed_amount' ? discount_value : totalOrder * (discount_value / 100);

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount
        }
    }

    static async deleteDiscountCode({ shopId, codeId }) {
        const foundDiscount = await findDiscountByCode({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectId(shopId)
            }
        });

        if (foundDiscount) {
            // Check current state of this discount
            // Store into archived code db

            // Delete discount
            const deletedDiscount = await discount.findOneAndDelete(foundDiscount);
            return deletedDiscount
        } else {
            throw new NotFoundError('Cannot find this discount code');
        }
    }

    /*
        Cancel discount code    
    */
    static async cancelDiscountCode({ codeId, shopId, userId }) {
        const foundDiscount = await findDiscountByCode({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectId(shopId)
            }
        });

        if (!foundDiscount) throw new NotFoundError('Discount does not exist');

        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId,
            },
            $inc: {
                discount_max_uses: 1,
                discount_uses_count: -1
            }
        });

        return result
    }
}

module.exports = DiscountServices;
