import mongoose from "mongoose";

const {Schema, model} = mongoose;

const typePay = new Schema ({
    type : {
        type : String,
        enum : ['cash', 'card'],
        require : true,
        unique : true
    }
})

export const TypePay = model ('TypePay', typePay)