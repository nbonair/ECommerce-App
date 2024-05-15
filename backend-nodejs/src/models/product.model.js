const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'


const productSchema = new Schema({
    product_name: { type: String, required: true },
    product_thumb: { type: String, required: true },
    product_description: String,
    product_price: { type: Number, required: true },
    product_quantity: {type: Number, required: true },
    product_type: {type:String, required: true, enum:[]},
    product_attributes: {type: Schema.Types.Mixed, required:true}
}, {
    collection: COLLECTION_NAME,
    timestamps: true
})

// type clothing

const clothingSchema = new Schema({
    brand: { type: String, required: true },
    size: String,
    material: String
},
{
    collection: 'clothes',
    timestamps: true
})