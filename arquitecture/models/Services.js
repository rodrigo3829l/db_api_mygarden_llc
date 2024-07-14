import mongoose from "mongoose";

const {Schema, model} = mongoose;

const serviceSchema = new Schema({
    name : {type: String, required: true},
    description : {type: String, required: true},
    tipoDeServicio: {
        type: Schema.Types.ObjectId, // Indica que el campo es un ObjectId
        ref: 'TypeService', // La colección a la que se refiere
        require: true
    },
    img:{
        public_id: String,
        secure_url: String
    },
    isUsable  : {
        type : Boolean,
        default : true
    },
    Calificacion : {
        totales : {type : Number, default: 0},
        cantidad : {type : Number, default: 0},
        total : {type : Number, default: 0}
    } 
});

export const Service = model ('Service', serviceSchema)