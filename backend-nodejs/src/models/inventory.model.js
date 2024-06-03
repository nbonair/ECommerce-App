const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'Inventory'
const COLLECTION_NAME = 'Inventories'

// Declare the Schema of the Mongo model
var inventorySchema = new Schema({
    invent_productId: {type: Schema.Types.ObjectId, ref: 'Product'},
    invent_location: {type: String, default: 'unknown'},
    invent_stock: {type: Number, required:true},
    invent_shopId: {type: Schema.Types.ObjectId, ref: 'Shop'},
    invent_reservations: {type:Array, default: []}
}, {
    collection: COLLECTION_NAME,
    timestamps: true
});

//Export the model
    module.exports = model(DOCUMENT_NAME, inventorySchema);
