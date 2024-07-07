const { BadRequestError, NotFoundError } = require('../../core/error.response');
const discount = require('../models/discount.model');
const { findAllDiscountCodesUnselect } = require('../models/repositories/discount.repo');
const { queryAllProduct } = require('../models/repositories/product.repo');
const { convertToObjectId } = require('../utils');

class DiscountServices {
    static async createDiscountCode(payload) {
        const {
            code, start_date, end_date, is_active,
            shopId, min_order_value, product_ids, applies_to, user_used,
            name, description, type, value, max_value, max_uses, uses_count, max_uses_per_user
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

        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectId(shopId)
        }).lean();

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
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectId(shopId)
        }).lean();

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
    }){
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
}

module.exports = DiscountServices;
