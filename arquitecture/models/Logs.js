import mongoose from "mongoose";

const {Schema, model} = mongoose;

const logs = new Schema ({
    description : String,
    ipDirection : String,
    date : {
        type : Date,
        default: new Date() //fecha actual
    },
    user: {
        type: Schema.Types.ObjectId, 
        ref: 'users',
        require : true
    },
})

export const Logs = model ('Logs', logs)