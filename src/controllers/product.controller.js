import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { Product } from '../models/product.models.js'   



const getAllProducts = asyncHandler(async (req, res) => {
    
    if(!req?.user) throw new ApiError(401, "You are not authorized to get products")

    const products = await Product.find({isEnabled : true})
    if(!products){
        throw new ApiError(404, "Products not found")
    }



    return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"))
})

const getProductById = asyncHandler(async (req, res) => {

    const {id} = req.params
    
    if(!req?.user) throw new ApiError(401, "You are not authorized to get product")

    const product = await Product.findById(id)

    if(!product){
        throw new ApiError(404, "Product not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"))
})


// Only Admin can Add the Products
const addProducts = asyncHandler(async(req, res) => {

    const {name, description, price, stock, category} = req.body

    if(req.user.role !== 'admin'){
        throw new ApiError(401, "You are not authorized to add products")
    }

    if([
        name,
        description,
        price,
        stock,
        category
    ].some(field => field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }
    
    const product = await Product.create({
        name,
        description,
        price,
        stock,
        category
    })

    if(!product){
        throw new ApiError(500, "Product not added")
    }
    
    return res
    .status(201)
    .json(new ApiResponse(201, product, "Product added successfully"))
})


// Only Admin can update the Products
const updateProduct = asyncHandler(async(req, res) => {

    const {id} = req.params
    const {name, description, price, stock, category} = req.body

    if(req.user.role !== 'admin'){
        throw new ApiError(401, "You are not authorized to update products")
    }

    const product = await Product.findByIdAndUpdate(id, {
        name,
        description,
        price,
        stock,
        category,
    }, {new : true})

    if(!product){
        throw new ApiError(500, "Product not updated")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"))
})


const toggleProductVisibility = asyncHandler(async(req, res) => {

    const {id} = req.params

    if(req.user.role !== 'admin'){
        throw new ApiError(401, "You are not authorized to toggle product visibility")
    }

    const product = await Product.findById(id)
    if(!product){
        throw new ApiError(404, "Product not found")
    }
    product.isEnabled = !product.isEnabled
    await product.save()
    return res
    .status(200)
    .json(new ApiResponse(200, product, "Product visibility toggled successfully"))
})


export {
    getAllProducts,
    getProductById,
    addProducts,
    updateProduct,
    toggleProductVisibility
}