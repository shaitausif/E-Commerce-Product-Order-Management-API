import mongoose, { Schema } from "mongoose";

const cartItemSchema = new Schema(
    {
        cart: {
            type: Schema.Types.ObjectId,
            ref: "Cart",
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
            default: 1,
            min: [1, "Quantity cannot be less than 1"]
        }
    },
    { timestamps: true }
);

// Compound index to guarantee a unique product entry per cart
cartItemSchema.index({ cart: 1, product: 1 }, { unique: true });

export const CartItem = mongoose.models.CartItem || mongoose.model("CartItem", cartItemSchema);
