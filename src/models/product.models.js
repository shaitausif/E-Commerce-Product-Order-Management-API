import mongoose, { Schema } from "mongoose";


const productSchema = new Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    description : {
        type : String,
        required : true,
        trim : true
    },
    price : {
        type : Number,
        required : true,
        trim : true
    },
    stock : {
        type : Number,
        required : true,
        trim : true
    },
    category : {
        type : String,
        required : true,
        trim : true
    },
    isEnabled : {
        type : Boolean,
        default : true
    }
    
    
}, {
    timestamps : true
})



export const Product = mongoose.models.Product || mongoose.model("Product",productSchema)