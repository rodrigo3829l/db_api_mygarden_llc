import mongoose from "mongoose";
import bcryptjs from 'bcryptjs'

const {Schema, model} = mongoose;

const userSchema = new Schema({
    name: {type: String, required: true},
    apellidoP: {type: String, required: true},
    apellidoM: {type: String, required: true},
    fechaNacimiento: {type: String, required: true},
    genero: String,
    cellPhone: Number,
    img:{
        public_id: String,
        secure_url: String
    },
    direccion: {
        estado: String,
        numCasa: Number,
        postalCode: Number,
        ciudad: String,
        calle: String
    },
    userName: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    status: {type: String, required: true, default: 'DISCONECTED'},
    code: {type: String, required: true},
    rol: {type: String, required: true},
    verified: {type: String, required: true, default: 'UNVERIFIED'},
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

userSchema.methods.comparePassword = async function (candidatePassword){
    return await bcryptjs.compare( candidatePassword, this.password)
}



export const User = model('User', userSchema);