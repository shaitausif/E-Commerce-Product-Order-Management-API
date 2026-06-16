import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        items: [
            {
                type: Schema.Types.ObjectId,
                ref: "OrderItem",
                required: true
            }
        ],
        status: {
            type: String,
            required: true,
            trim: true,
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
            default: "pending"
        },
        totalAmount: {
            type: Number,
            required: true,
            min: [0, "Total amount cannot be negative"]
        },
        shippingAddress: {
            type: String,
            required: true,
            trim: true
        },
        paymentMethod: {
            type: String,
            default: "COD",
            enum : ["COD","UPI","DEBIT","CREDIT","WALLET"],
            trim: true
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
            trim: true
        }
    },
    { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);