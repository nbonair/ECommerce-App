const ProductService = require('../services/product.services')
const { SuccessResponse } = require('../../core/success.response')

class ProductController {
    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Created Product Successfully',
            metadata: await ProductService.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }


    //Update Product
    updateProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update Product Successfully',
            metadata: await ProductService.updateProduct(req.body.product_type, req.params.productId, {
                ...req.body,
                product_shop: req.user.userId,
            })
        }).send(res)
    }

    publishProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Published Product Successfully',
            metadata: await ProductService.publishProduct({
                product_shop: req.user.userId,
                product_id: req.params.id
            })
        }).send(res)
    }

    archiveProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Archived Product Successfully',
            metadata: await ProductService.archivedProduct({
                product_shop: req.user.userId,
                product_id: req.params.id
            })
        }).send(res)
    }

    //Query
    /**
     * @desc Get all draft for specific shop
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    getAllDrafts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all draft list successfully',
            metadata: await ProductService.findAllDrafts({
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getAllPublished = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all published list successfully',
            metadata: await ProductService.findAllPublished({
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all product for search',
            metadata: await ProductService.searchProduct({
                keySearch: req.params
            })
        }).send(res)
    }

    getAllProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all published product successfully',
            metadata: await ProductService.getAllProducts(req.query)
        }).send(res)
    }

    getProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get product successfully',
            metadata: await ProductService.getProduct({
                product_id: req.params.product_id
            })
        }).send(res)
    }
}

module.exports = new ProductController()