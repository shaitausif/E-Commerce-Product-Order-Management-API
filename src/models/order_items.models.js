import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema(
    {
        order: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity cannot be less than 1"]
        },
        price: {
            type: Number,
            required: true,
            min: [0, "Price cannot be negative"]
        }
    },
    { timestamps: true }
);

export const OrderItem = mongoose.models.OrderItem || mongoose.model("OrderItem", orderItemSchema);
