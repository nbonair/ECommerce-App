const { model, Schema } = require('mongoose')

const DCOCUMENT_NAME = "Cart"
const COLLECTION_NAME = "carts"

const cartSchema = new Schema({
    cart_state: {
        type: String, required: true,
        enum: ['active', 'completed', 'failed', 'pending'],
        default: 'active'
    },
    cart_products: {
        type: Array, required: true, default: []
    }
}, {
    collection: COLLECTION_NAME,
    timestamps: true
});

model.export = model(DCOCUMENT_NAME, cartSchema)