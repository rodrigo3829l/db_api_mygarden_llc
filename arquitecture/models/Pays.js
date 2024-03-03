import mongoose from "mongoose";

const {Schema, model} = mongoose;

const pays = new Schema({
    date : {
        type : Date,
        default: new Date()
    },
    user: {
        type: Schema.Types.ObjectId, 
        ref: 'users',
        require : true
    },
    amount : {
        type : Number,
        require : true
    },
    scheduleService : {
        type: Schema.Types.ObjectId, 
        ref: 'scheduleservices',
        require : true
    },
    isTotaly : {
        type : Boolean,
    },
    type : {
        type: Schema.Types.ObjectId, 
        ref: 'typepays',
        require : true
    }
})

export const Pays =  model ('Pays', pays)