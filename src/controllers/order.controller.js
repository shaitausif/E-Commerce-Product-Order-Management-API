import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { Order } from '../models/order.models.js'
import { OrderItem } from '../models/order_items.models.js'
import { Product } from '../models/product.models.js'

// Place order and populate OrderItems, calculate total, manage stock
const placeOrder = asyncHandler(async (req, res) => {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
        throw new ApiError(400, "No items in the order");
    }
    if (!shippingAddress || !paymentMethod) {
        throw new ApiError(400, "Shipping address and Payment method are required");
    }

    // first : Create the draft Order document
    const order = await Order.create({
        user: req.user._id,
        shippingAddress,
        totalAmount: 0,
        paymentMethod,
        items: []
    });

    let calculatedTotal = 0;
    const orderItemIds = [];

    //  second : Validate products, deduct inventory stock, and create OrderItems
    try {
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                throw new ApiError(404, `Product not found: ${item.product}`);
            }
            if (product.isEnabled === false) {
                throw new ApiError(400, `Product is currently unavailable: ${product.name}`);
            }
            if (product.stock < item.quantity) {
                throw new ApiError(400, `Insufficient stock for product: ${product.name}`);
            }

            // Deduct stock
            product.stock -= item.quantity;
            await product.save();

            // Create OrderItem capturing the checkout price
            const orderItem = await OrderItem.create({
                order: order._id,
                product: item.product,
                quantity: item.quantity,
                price: product.price
            });

            orderItemIds.push(orderItem._id);
            calculatedTotal += product.price * item.quantity;
        }
    } catch (error) {
        // Rollback created OrderItems and delete Order draft if transaction fails mid-process
        await OrderItem.deleteMany({ order: order._id });
        await Order.findByIdAndDelete(order._id);
        throw error;
    }

    //  Populating order totals and items list
    order.items = orderItemIds;
    order.totalAmount = calculatedTotal;
    await order.save();

    const populatedOrder = await Order.findById(order._id).populate({
        path: 'items',
        populate: {
            path: 'product'
        }
    });

    return res.status(201).json(
        new ApiResponse(201, populatedOrder, "Order placed successfully")
    );
});





// Cancel order and restore stock
const cancelOrder = asyncHandler(async (req, res) => {
    if (!req?.user) {
        throw new ApiError(401, "You are not authorized to cancel this order");
    }

    const { id } = req.params;
    if (!id) {
        throw new ApiError(400, "Order id is required");
    }

    const order = await Order.findById(id).populate('items');
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (req.user._id.toString() !== order.user.toString()) {
        throw new ApiError(401, "You are not authorized to cancel this order");
    }

    if (order.status === "cancelled") {
        throw new ApiError(400, "Order is already cancelled");
    }

    // Restore inventory stock for each ordered item
    for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
            product.stock += item.quantity;
            await product.save();
        }
    }

    order.status = "cancelled";
    await order.save();

    return res.status(200).json(
        new ApiResponse(200, order, "Order cancelled successfully")
    );
});







const getAllUserOrders = asyncHandler(async(req, res) => {


    const orders = await Order.find({user: req.user._id}).populate('items');

    if(!orders){
        throw new ApiError(404, "Orders not found")
    }
    
    return res.status(200).json(
        new ApiResponse(200, orders, "Orders fetched successfully")
    )
})





export { placeOrder, cancelOrder, getAllUserOrders }