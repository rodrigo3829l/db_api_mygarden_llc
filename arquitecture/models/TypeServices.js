import mongoose from "mongoose";

const {Schema, model} = mongoose;

const typeServiceSchema = new Schema ({
    tipo : {type : String, required : true, unique : true},
    isUsable  : {
        type : Boolean,
        default : true
    }
})

export const TypeService = model ('TypeService', typeServiceSchema)