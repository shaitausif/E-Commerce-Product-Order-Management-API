import mongoose, { Schema } from "mongoose";


const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    items: [
        {
            type: Schema.Types.ObjectId,
            ref: "CartItem",
            required: true
        }
    ]

}, {
    timestamps: true
})



export const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema)