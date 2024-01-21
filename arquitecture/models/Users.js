import mongoose from "mongoose";

const {Schema, model} = mongoose;

const userSchema = new Schema({
    name: String,
    apellidoP: String,
    apellidoM: String,
    fechaNacimiento: Date,
    Genero: String,
    Imagen: String,
    Direccion: [{
        Estado: String,
        NumCasa: Int,
        CP: Int,
        
    }]
});