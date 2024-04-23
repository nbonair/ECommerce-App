const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'APIKey'
const COLLECTION_NAME = 'APIKeys'

// Declare the Schema of the Mongo model
var apiKeySchema = new Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: Boolean,
        default: true
    },
    permissions: {
        type: [String], 
        require: true,
        enum: ['0','1','2']
    },
}, {
    collection: COLLECTION_NAME,
    timestamps: true
});

//Export the model
    module.exports = model(DOCUMENT_NAME, apiKeySchema);
