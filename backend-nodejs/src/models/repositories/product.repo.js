const { product, electronic, clothing, furniture } = require('../../models/product.model')
const { Types } = require('mongoose')
const { getSelectData, getUnSelectData } = require('../../utils')

const findAllDrafts = async ({ query, limit, skip }) => {
    return await queryAllProduct({ query, limit, skip })
}

const findAllPublished = async ({ query, limit, skip }) => {
    return await queryAllProduct({ query, limit, skip })
}

const getAllProducts = async ({ limit, sort, page, filter, select }) => {
    const skip = (page - 1) * limit
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const products = await product.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(getSelectData(select))
        .lean()
        .exec()

    return products
}

const getProductById = async ({ product_id, unSelect }) => {
    return product.findById(new Types.ObjectId(product_id)).select(getUnSelectData(unSelect))
}

const searchProductPublic = async ({ keySearch }) => {
    const regexSearch = new RegExp(keySearch)
    const results = await product.find({
        isPublished: true,
        $text: { $search: regexSearch }
    }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .lean()

    return results
}

//Patch

const updateProductById = async({productId, payload, model, isNew = true}) =>{
    return await model.findByIdAndUpdate(productId, payload, {
        new: isNew
    })
    
}

//Post
const publishProduct = async ({ product_shop, product_id }) => {
    const foundProduct = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id),
        isPublished: false
    })
    if (!foundProduct) return null
    foundProduct.isPublished = true
    foundProduct.isDraft = false
    const { modifiedCount } = await foundProduct.updateOne(foundProduct)
    return modifiedCount
}

const archivedProduct = async ({ product_shop, product_id }) => {
    const foundProduct = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id),
        isPublished: true
    })
    if (!foundProduct) return null
    foundProduct.isPublished = false
    foundProduct.isDraft = true
    const { modifiedCount } = await foundProduct.updateOne(foundProduct)
    return modifiedCount
}

const queryAllProduct = async ({ query, limit, skip }) => {
    return await product.find(query).populate('product_shop', 'name email -_id')
        .sort({ updateAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
}

module.exports = {
    findAllDrafts,
    findAllPublished,
    getAllProducts,
    getProductById,
    publishProduct,
    archivedProduct,
    searchProductPublic,
    updateProductById,
    queryAllProduct
}