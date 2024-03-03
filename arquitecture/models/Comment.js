import mongoose from "mongoose";

const {Schema, model} = mongoose;

const commentSchema = new Schema({
    user :{
        type: Schema.Types.ObjectId, // Indica que el campo es un ObjectId
        ref: 'users', // La colección a la que se refiere
        require: true
    },
    scheduleservice : {
        type: Schema.Types.ObjectId, // Indica que el campo es un ObjectId
        ref: 'scheduleservices', // La colección a la que se refiere
        require: true
    },
    service : {
        type: Schema.Types.ObjectId, // Indica que el campo es un ObjectId
        ref: 'services', // La colección a la que se refiere
        require: true
    },
    comment : {
        type: String,
        require: true
    },
    rating : {
        type: Number,
        require : true
    },
    isVisible : {
        type : Boolean,
        default : true
    }
})


export const Comment = model ('Comment', commentSchema)