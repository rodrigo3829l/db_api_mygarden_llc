import mongoose from "mongoose";

const {Schema, model} = mongoose;

const products = new Schema({
    product : {
        type: String,
        required : true
    },
    price : {
        type : Number,
        required : true,

    },
    contact : {
        type : String,
        required : true,

    },
    provider : {
        type : String,
        required : true,

    },
    isUsable  : {
        type : Boolean,
        default : true
    }
})

export const Products = model('Products', products)