import mongoose from "mongoose";
import bcryptjs from 'bcryptjs'

const {Schema, model} = mongoose;

const userSchema = new Schema({
    name: {type: String, required: true},
    apellidoP: {type: String, required: true},
    apellidoM: {type: String, required: true},
    fechaNacimiento: {type: String, },
    genero: String,
    cellPhone: Number,
    lade: Number,
    img:{
        public_id: String,
        secure_url: String
    },
    direccion: {
        neighborhood: String,
        numCasa: Number,
        postalCode: Number,
        ciudad: String,
        calle: String
    },
    userName: {type: String, required : true, unique: true, index : {unique : true},},
    email: {type: String, required: true, unique: true, index : {unique : true},},
    password: {type: String, required: true},
    status: {type: String, required: true, default: 'DISBLOCKED',},
    userStatus: {type: String, required: true, default: 'ENABLED'},
    code: {type: String,},
    rol: {type: String, required: true, enum : ['admin', 'client', 'employed']},
    verified: {type: String, required: true, default: 'UNVERIFIED'},
    intentos: {type: Number, default : 0},
    lastIntent: {type: Number, default: null},
    creation: {type: Date, default: new Date()},
    lastLogin: Date,
    intentsFailBlocked: {type: Number, default : 0},
    lastPassword: {type: Date, default: new Date()},
});


//antes de guaradar incriptar la contraseña
userSchema.pre("save", async function( next ){
    const user = this;

    if(!user.isModified('password')) return next();
    try {
        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(user.password, salt);
        next();
    } catch (error) {
        console.log(error);
        throw new Error('Fallo el hash de contraseña');
    }
})
4
userSchema.methods.comparePassword = async function (candidatePassword){
    return await bcryptjs.compare( candidatePassword, this.password)
}



export const User = model('User', userSchema);