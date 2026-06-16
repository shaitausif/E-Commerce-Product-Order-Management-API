import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { Cart } from '../models/cart.models.js'
import { CartItem } from '../models/cart_items.models.js'
import { Product } from '../models/product.models.js'

// Get user's cart populated with cart items and product details as well
const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
        path: 'items',
        populate: {
            path: 'product'
        }
    });

    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    return res.status(200).json(
        new ApiResponse(200, cart, "Cart retrieved successfully")
    );
});

// adding product to cart
const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }

    const qty = Number(quantity || 1);
    if (qty <= 0) {
        throw new ApiError(400, "Quantity must be a positive number");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (product.isEnabled === false) {
        throw new ApiError(400, "Product is currently disabled");
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    let cartItem = await CartItem.findOne({ cart: cart._id, product: productId });
    if (cartItem) {
        cartItem.quantity += qty;
        await cartItem.save();
    } else {
        cartItem = await CartItem.create({
            cart: cart._id,
            product: productId,
            quantity: qty
        });
        cart.items.push(cartItem._id);
        await cart.save();
    }

    const populatedCart = await Cart.findById(cart._id).populate({
        path: 'items',
        populate: {
            path: 'product'
        }
    });

    return res.status(200).json(
        new ApiResponse(200, populatedCart, "Product added to cart successfully")
    );
});

// Remove product from cart
const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const prodId = productId || req.params.productId;

    if (!prodId) {
        throw new ApiError(400, "Product ID is required");
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const cartItem = await CartItem.findOne({ cart: cart._id, product: prodId });
    if (!cartItem) {
        throw new ApiError(404, "Product not found in cart");
    }

    await CartItem.findByIdAndDelete(cartItem._id);

    cart.items = cart.items.filter(item => item.toString() !== cartItem._id.toString());
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
        path: 'items',
        populate: {
            path: 'product'
        }
    });

    return res.status(200).json(
        new ApiResponse(200, populatedCart, "Product removed from cart successfully")
    );
});

// Update product quantity in cart
const updateProductInCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
        throw new ApiError(400, "Product ID and quantity are required");
    }

    const qty = Number(quantity);

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const cartItem = await CartItem.findOne({ cart: cart._id, product: productId });
    if (!cartItem) {
        throw new ApiError(404, "Product not found in cart");
    }

    if (qty <= 0) {
        await CartItem.findByIdAndDelete(cartItem._id);
        cart.items = cart.items.filter(item => item.toString() !== cartItem._id.toString());
        await cart.save();
    } else {
        cartItem.quantity = qty;
        await cartItem.save();
    }

    const populatedCart = await Cart.findById(cart._id).populate({
        path: 'items',
        populate: {
            path: 'product'
        }
    });

    return res.status(200).json(
        new ApiResponse(200, populatedCart, "Cart item updated successfully")
    );
});

// clearing the cart entirely
const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    await CartItem.deleteMany({ cart: cart._id });

    cart.items = [];
    await cart.save();

    return res.status(200).json(
        new ApiResponse(200, cart, "Cart cleared successfully")
    );
});

export {
    getCart,
    addToCart,
    removeFromCart,
    updateProductInCart,
    clearCart
}