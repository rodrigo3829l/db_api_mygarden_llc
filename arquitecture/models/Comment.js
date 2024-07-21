import mongoose from "mongoose";

const {Schema, model} = mongoose;

const commentSchema = new Schema({
    user :{
        type: Schema.Types.ObjectId, // Indica que el campo es un ObjectId
        ref: 'User', // La colección a la que se refiere
        require: true
    },
    scheduleservice : {
        type: Schema.Types.ObjectId, // Indica que el campo es un ObjectId
        ref: 'ScheduleService', // La colección a la que se refiere
        require: true
    },
    service : {
        type: Schema.Types.ObjectId, // Indica que el campo es un ObjectId
        ref: 'Service', // La colección a la que se refiere
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
    },
    category : {
        type: Number,
        require: true
    },
    date : {
        type : Date,
        default : new Date()
    },
})


export const Comment = model ('Comment', commentSchema)