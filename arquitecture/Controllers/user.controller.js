import { User } from "../models/Users.js"
import { v4 as uuidv4 } from "uuid";
import fs from 'fs-extra';
import {getToken, getTokenData, generateRefreshToken} from "../../helpers/middlewares/JWT.config.js"
import {sendEmail, getTemplate } from "../../helpers/config/mail.config.js"
import {uploadImage} from "../../helpers/utils/cloudinary.js"
import {generateRandomCode} from "../../helpers/config/code.confi.js"


export const signUp = async  (req, res) =>{
    try {
        const {
            name,
            apellidoP,
            apellidoM,
            fechaNacimiento,
            genero,
            cellPhone,
            direccion,
            userName,
            email,
            password,
            imagen
        } = req.body

        let user = await User.findOne({ email});
          

        if(user !== null){
            return res.json({
                success: false,
                msg: 'This email is already rooted in our garden. 🌱✉️ Please try another email seed. 💌🌼',

            })
        }

        user = await User.findOne({ userName});
          
        if(user !== null){
            return res.json({
                success: false,
                msg: 'This gardener is already tending our garden beds. 🌿👩‍🌾 Please choose a different garden nickname. 🌼🏷️',
            })
        }

        user = await User.findOne({ cellPhone});
          
        if(user !== null){
            return res.json({
                success: false,
                msg: 'Sorry, but this phone number has already taken root in our garden. 🌱📞 Choose a different path for your garden contact. 🌺🚫',
            })
        }

        const code = uuidv4()

        user = new User({
            name,
            apellidoP,
            apellidoM,
            fechaNacimiento,
            genero,
            cellPhone,
            direccion,
            userName,
            email,
            password,
            code,
            rol : "client"
        })

        console.log(req.files)


        // if(imagen){
        //     let img = new Image()
        //     img.src = imagen

        //     const {public_id, secure_url} = await uploadImage(img.tempFilePath)
        //     console.log("Se subio la imagen")
        //     user.imagen ={
        //         public_id,
        //         secure_url  
        //     }
        //     fs.unlink(req.files.imagen.tempFilePath)
        // }

        const {token, expiresIn} = getToken({email, userName, password, code})

        const template = getTemplate(name, token, "confirm")

        await sendEmail(email, 'Confirm acount', template, "Confirm your acount")

        await user.save();

        return res.json({
            success: true,
            msg: "Registro correcto"
        })
        
    } catch (error) {  
        console.log("Error en el  registro")
        console.log(error)
        return res.json({
            success: false,
            msg: 'Error al registrar usuario'
        })
    }
}


export const confirm = async (req, res) =>{
    try {
        const { token } = req.params

        const data = getTokenData(token)
        
        if(data === null){
            return res.json({
                success: false,
                msg: 'Error al obtener data'
            })
        }
        console.log(data.uid)

        const {email, code} = data.uid

        const user = await User.findOne({email})

        if(user === null){
            return res.json({
                success: false,
                msg: 'El usuario no existe'
            })
        }

        if(code !== user.code){
            return res.redirect('http://localhost:5173/notverified')
            // return res.redirect('http://localhost:5173/notverified')
        }

        user.verified = 'VERIFIED'
        user.status = 'CONECTED'

        await user.save()

        return res.redirect('http://localhost:5173/successverified')
        // return res.redirect('http://localhost:5173/successverified')
    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            msg: 'Error al confirmar usuario'
        })
    }
}

export const recoverPassword = async (req,res)=>{
    try {
        const { email } = req.body
        const user = await User.findOne({email})
        if(user === null){
            return res.json({
                success: false,
                msg: 'El correo no existe'
            })
        }
        const code=generateRandomCode()
        user.code=code

        const {token, expiresIn} = getToken({email})

        await user.save()

        const template = getTemplate(user.name, code, "recover")
        await sendEmail(email, 'Verification', template, "Verification code")
        return res.json({
            success: true,
            msg: "Codigo Enviado Correctamente",
            token
        })

    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            msg: 'Error de recuperacion de contraseña'
        })   
    }
}

export const verifyCode= async (req,res)=>{
    try {
        const { token, code } = req.body

        const data = getTokenData(token)
        
        if(data === null){
            return res.json({
                success: false,
                msg: 'Error al obtener data'
            })
        }

        const {email} = data.uid
        console.log(email)
        const user = await User.findOne({email})
        if(user === null){
            return res.json({
                success: false,
                msg: 'El correo no existe'
            })
        }

        if (user.code !== code){
            return res.json({
                success: false,
                msg: 'Codigo Incorrecto',
            })
        }

        return res.json({
            success: true,
            msg: 'Codigo correcto'
        })

    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            msg: 'Error al Verificar Codigo'
        })   
    }
}



export const changePassword= async (req,res)=>{
    try {
        const { token, password } = req.body

        const data = getTokenData(token)
        
        if(data === null){
            return res.json({
                success: false,
                msg: 'Error al obtener data'
            })
        }

        const {email} = data.uid

        const user = await User.findOne({email})
        if(user === null){
            return res.json({
                success: false,
                msg: 'El correo no existe'
            })
        }

        user.password = password
        await user.save()
        return res.json({
            success: true,
            msg: 'Contraseña cambiada con exito'
        })  
    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            msg: 'Error al Cambiar contraseña'
        })   
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (!user) return res.status(403).json({error: 'Invalid email'})

        if (user.lastIntent) {
            const difference = new Date() - user.lastIntent;
            const differenceInSeconds = Math.abs(difference) / 1000; // Convertir a segundos
        
            if (differenceInSeconds < 60) { // Si la diferencia es menor a 60 segundos
                const remainingSeconds = Math.ceil(60 - differenceInSeconds); // Calcular segundos restantes
                return res.status(403).json({ error: `Too many attempts, please try again in ${remainingSeconds} seconds` });
            } else {
                user.intentos = 0;
                user.lastIntent = null;
                await user.save();
            }
        }        

        const respuestaPassword  = await user.comparePassword(password);
        if(!respuestaPassword) {
            user.intentos ++
            if(user.intentos >= 3){
                user.lastIntent = new Date()
            }
            await user.save()
            return res.status(403).json({error: 'Invalid password'})
        }

        if(user.verified === "UNVERIFIED") return res.status(403).json({error: 'This account is not verified please verify it'})
        if(user.status === "DISCONECTED") {
            user.status = "CONECTED"
            await user.save()
        }

        user.intentos = 0
        user.lastIntent = null
        await user.save()
        //generar el jwt token
        const {token, expiresIn} = getToken(user.id);  
        generateRefreshToken(user.id, res)
        console.log('login')
        console.log({
            token, 
            expiresIn, 
            name : `${user.name} ${user.apellidoP} ${user.apellidoM}` ,
            email : user.email
        })
        return res.json({
            token, 
            expiresIn, 
            name : `${user.name} ${user.apellidoP} ${user.apellidoM}` ,
            email : user.email
        })

    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            msg: 'Error al hacer el logeo'
        }) 
    }
}


export const logout = (req, res) => {    
    res.clearCookie('refreshToken', {        
                path: '/',        
                httpOnly: true,        
                secure: true,        
                // // sameSite: 'none'    
            })    
            res.json({ok: 'logout'})
}


export const refreshToken  = (req, res) => {
    try {
        const {token, expiresIn} = getToken(req.uid);  
        console.log('refresh')
        console.log({token, expiresIn})
        return res.json({token, expiresIn})
    } catch (error) {
        console.log('error en la funcion refresh token')
        console.log(error);
        return res.status(500).json({error: 'Error de servidor'})
    }
};



//Esta es la ruta protected
export const infoUser = async (req, res) => {
    try {
        const user = await User.findById(req.uid).lean()
        return res.json({_id: user._id, userName: user.userName, email: user.email, tipo: user.rol})
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: 'Error de servidor'})
    }
}