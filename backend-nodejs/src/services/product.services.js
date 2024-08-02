const { product, clothing, electronic, furniture } = require('../models/product.model')
const { BadRequestError } = require('../../core/error.response')
const { findAllDrafts, publishProduct, findAllPublished, archivedProduct, searchProductPublic, getAllProducts, updateProductById, getProductById } = require('../models/repositories/product.repo')
const shopModel = require('../models/shop.model')
const { truncate } = require('lodash')
const { validateNestedObjectParser, updateNestedObjectParse } = require('../utils')
const { insertInventory } = require('../models/repositories/inventory.repo')
class ProductFactory {
    static productRegistry = {}

    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef
    }

    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type]
        if (!productClass) throw new BadRequestError(`Invalid Product Type: ${type}`)
        return new productClass(payload).createProduct()
    }

    static async updateProduct(type, productId, payload) {

        const productClass = ProductFactory.productRegistry[type]
        if (!productClass) throw new BadRequestError(`Invalid Product Type: ${type}`)
        return new productClass(payload).updateProduct(productId)
    }

    // PUT
    static async publishProduct({ product_shop, product_id }) {
        return await publishProduct({ product_shop, product_id })
    }

    static async archivedProduct({ product_shop, product_id }) {
        return await archivedProduct({ product_shop, product_id })
    }

    // QUERY
    static async findAllDrafts({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true }
        return await findAllDrafts({ query, limit, skip })
    }

    static async findAllPublished({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isPublished: true }
        return await findAllPublished({ query, limit, skip })
    }

    static async searchProduct({ keySearch }) {
        return await searchProductPublic(keySearch)
    }

    static async getAllProducts({ limit = 50, sort = 'ctime', page = 1, filter = { isPublished: true } }) {
        return await getAllProducts({
            limit, sort, page, filter,
            select: ['product_name', 'product_price', 'product_thumb', 'product_shop']
        })
    }

    static async getProduct({ product_id }) {
        return await getProductById({ product_id, unSelect: ['__v', 'product_variations'] })
    }
}

class Product {
    constructor({
        product_name, product_thumb, product_description, product_price,
        product_quantity, product_type, product_shop, product_attributes
    }) {
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
    }

    async createProduct(product_id) {
        const newProduct = await product.create({ ...this, _id: product_id })
        if(newProduct){
            await insertInventory({
                productId: newProduct._id,
                shopId: this.product_shop,
                stock: this.product_quantity,
            })
        }
        return newProduct
    }

    async updateProduct(productId, payload) {
        return await updateProductById({ productId, payload, model: product })
    }
}

// Define sub-class for different product types

class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newClothing) throw new BadRequestError('Create new Clothing Error')

        const newProduct = await super.createProduct(newClothing._id)
        if (!newProduct) throw new BadRequestError('Create Product Error')
        return newProduct
    }

    async updateProduct(productId) {
        const objectParams = validateNestedObjectParser(updateNestedObjectParse(this))

        if (objectParams.product_attributes) {
            await updateProductById({ productId, payload: objectParams, model: clothing })
        }

        const updateProduct = await super.updateProduct(productId, objectParams)
        return updateProduct
    }
}

class Electronics extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newElectronic) throw new BadRequestError('Create new Electronic Error')

        const newProduct = await super.createProduct(newElectronic._id)
        if (!newProduct) throw new BadRequestError('Create Product Error')
        return newProduct
    }

    async updateProduct(productId) {
        const objectParams = validateNestedObjectParser(updateNestedObjectParse(this))

        if (objectParams.product_attributes) {
            await updateProductById({ productId, payload: objectParams, model: electronic })
        }

        const updateProduct = await super.updateProduct(productId, objectParams)
        return updateProduct
    }
}

class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newFurniture) throw new BadRequestError('Create new Furniture Error')

        const newProduct = await super.createProduct(newFurniture._id)
        if (!newProduct) throw new BadRequestError('Create Product Error')
        return newProduct
    }

    async updateProduct(productId) {
        const objectParams = validateNestedObjectParser(updateNestedObjectParse(this))

        if (objectParams.product_attributes) {
            await updateProductById({ productId, payload: objectParams, model: furniture })
        }

        const updateProduct = await super.updateProduct(productId, objectParams)
        return updateProduct
    }
}

const productTypeConfig = {
    Clothing: Clothing,
    Furniture: Furniture,
    Electronics: Electronics,
}


Object.keys(productTypeConfig).forEach(type => {
    ProductFactory.registerProductType(type, productTypeConfig[type])
})

module.exports = ProductFactory;
