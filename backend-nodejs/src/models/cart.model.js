const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = "Cart"
const COLLECTION_NAME = "carts"

const cartSchema = new Schema({
    cart_state: {
        type: String, required: true,
        enum: ['active', 'completed', 'failed', 'pending'],
        default: 'active'
    },
    cart_products: {
        type: Array, required: true, default: []
    },
    cart_count_product: {
        type: Number,
        default: 0
    },
    cart_userId: {
        type: Schema.Types.ObjectId,
        required: true
    }
}, {
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: "createdOn",
        updatedAt: "modifiedOn"
    }
});

module.exports = {
    cart: model(DOCUMENT_NAME, cartSchema)
}