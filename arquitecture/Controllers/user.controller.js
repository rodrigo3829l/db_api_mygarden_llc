import { User } from "../models/Users.js"

import { newLog } from "../../helpers/config/log.config.js";

import { v4 as uuidv4 } from "uuid";
import {getToken, getTokenData, generateRefreshToken} from "../../helpers/middlewares/JWT.config.js"
import {sendEmail, getTemplate } from "../../helpers/config/mail.config.js"
// import {uploadImage} from "../../helpers/utils/cloudinary.js"
import {generateRandomCode} from "../../helpers/config/code.confi.js"
import { sendSms } from "../../helpers/config/sms.config.js";

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
        } = req.body

        let user = await User.findOne({ email});

        if(user !== null){
            return res.json({
                success: false,
                msg: req.t('user.signUp.email_already_rooted')

            })
        }

        user = await User.findOne({userName});
        
        if(user !== null){
            return res.json({
                success: false,
                msg: req.t('user.signUp.user_name_already_use')
            })
        }

        user = await User.findOne({ cellPhone});
        
        if(user !== null){
            return res.json({
                success: false,
                msg: req.t('user.signUp.cellphone_already_use')
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
            rol : "client",
            lade : 52
        })  
        const {token} = getToken({email, code})

        const template = getTemplate(
            req.t('email.confirm.titleOne'), 
            req.t('email.confirm.titleTwo'), 
            req.t('email.confirm.prOne'),
            req.t('email.confirm.prTwo'),
            name, 
            token, 
            "confirm", 
            req.t('email.confirm.textAction'))

        await sendEmail(
            email, 
            req.t('email.confirm.tittle'), 
            template, 
            req.t('email.confirm.tittle'),
            )

        await user.save();

        return res.json({
            success: true,
            msg: req.t('user.signUp.signup_correct')
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
            })
        }

        const {email, code} = data.uid

        const user = await User.findOne({email})

        if(!user){
            return res.json({
                success: false,
            })
        }

        // Calcula la diferencia de tiempo en minutos
        const diffInMinutes = (new Date() - user.creation) / 1000 / 60;
        console.log(diffInMinutes)
        if(diffInMinutes > 9){
            const code = uuidv4()
            const {token} = getToken({email, code})

            const template = getTemplate(
                req.t('email.confirm.titleOne'), 
                req.t('email.confirm.titleTwo'), 
                req.t('email.confirm.prOne'),
                req.t('email.confirm.prTwo'),
                user.name, 
                token, 
                "confirm", 
                req.t('email.confirm.textAction')
            )
    
            await sendEmail(
                email, 
                req.t('email.confirm.tittle'), 
                template, 
                req.t('email.confirm.tittle'),
            )

            // const template = getTemplate(
            //     user.name, 
            //     token, 
            //     "confirm"
            // )

            // await sendEmail(
            //     email, 
            //     'Confirm acount', 
            //     template, 
            //     "Confirm your acount"
            // )
            user.creation = new Date()
            user.code = code
            await user.save();
            // return res.redirect('https://mygardenllcservices.com/resendemail')
            return res.redirect('https://mygardenllcservices.com/resendemail')
        }

        if(code !== user.code){
            // return res.redirect('https://mygardenllcservices.com/notverified')
            return res.redirect('https://mygardenllcservices.com/notverified')
        }

        user.verified = 'VERIFIED'
        await user.save()

        // return res.redirect('https://mygardenllcservices.com/successverified')
        return res.redirect('https://mygardenllcservices.com/successverified')
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

        if(!user){
            return res.json({
                success: false,
            })
        }

        const code=generateRandomCode()
        user.code=code

        const {token} = getToken({email})

        await user.save()

        const template = getTemplate(
            req.t('email.recover.titleOne'), 
            req.t('email.recover.titleTwo'), 
            req.t('email.recover.prOne'),
            req.t('email.recover.prTwo'),
            user.name, 
            code, 
            "recover", 
            req.t('email.recover.textAction')
        )

        await sendEmail(
            email, 
            req.t('email.recover.tittle'), 
            template, 
            req.t('email.recover.tittle'),
        )

        return res.json({
            success: true,
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

export const recoverSms = async (req, res) =>{
    try {
        const {cellPhone} = req.body
        const user = await User.findOne({cellPhone})
        if(!user){
            return res.json({
                success: false,
                msg : 'usuario no encontrado'
            })
        }
        const code = generateRandomCode()
        user.code=code
        await user.save()
        const email =  user.email
        const {token} = getToken({email})

        const data = await sendSms(code, user.lade, cellPhone)
        
        if(data.error === true){
            return res.json({
                success : false,
                msg : data.mensaje_error
            })
        }
        console.log(data)
        return res.json({
            success: true,
            token   
        })

    } catch (error) {
        console.log("Error al enviar el mensaje")
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
            })
        }

        const {email} = data.uid

        const user = await User.findOne({email})

        if(user === null){
            return res.json({
                success: false,
            })
        }

        if (user.code !== code){
            return res.json({
                success: false,
            })
        }

        return res.json({
            success: true,
        })

    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            msg: 'Error al Verificar Codigo'
        })   
    }
}

export const resendcode = async (req,res)=>{
    try {
        const { token } = req.body

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

        const code=generateRandomCode()
        user.code=code

        await user.save()

        const template = getTemplate(
            req.t('email.recover.titleOne'), 
            req.t('email.recover.titleTwo'), 
            req.t('email.recover.prOne'),
            req.t('email.recover.prTwo'),
            user.name, 
            code, 
            "recover", 
            req.t('email.recover.textAction')
        )

        await sendEmail(
            email, 
            req.t('email.recover.tittle'), 
            template, 
            req.t('email.recover.tittle'),
        )

        return res.json({
            success: true,
            msg: 'Codigo enviado correctamente'
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
        user.lastPassword = new Date()
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
        const { email, password, department } = req.body;
        
        let user = await User.findOne({ email });

        if (!user){
            if(department === 'finance') {
                const description = 'Intento de acceso fallido, no hay usuario el nombre de usuario, telefono o email'
                await newLog(
                    description, 
                    req.ip,
                    null, 
                )
            }
            return res.status(403).json({error: req.t('user.login.invalid_email')})
        }

        if(user.status !== 'DISBLOCKED')return res.status(403).json({ error: req.t('user.login.blocked_account') });

        if (user.lastIntent) {
            const difference = new Date() - user.lastIntent;
            const differenceInSeconds = Math.abs(difference) / 1000; // Convertir a segundos
        
            if (differenceInSeconds < 60) { // Si la diferencia es menor a 60 segundos
                const remainingSeconds = Math.ceil(60 - differenceInSeconds); // Calcular segundos restantes
                return res.status(403).json({ error: `${req.t('user.login.many_attempts')} ${remainingSeconds} ${req.t('user.login.seconds')}` });
            } else {
                user.intentos = 0;
                user.lastIntent = null;
                await user.save();
            }
        }        

        const respuestaPassword  = await user.comparePassword(password);
        if(!respuestaPassword) {
            if(department === 'finance') {
                
                const description = 'Intento de acceso fallido al departamento de finanzas'
                await newLog(
                    description, 
                    req.ip,
                    user._id, 
                )
            }
            user.intentos ++
            user.intentsFailBlocked ++
            if(user.intentos >= 3){
                user.lastIntent = new Date()

                const template = getTemplate(
                    req.t('email.warning.titleOne'), 
                    req.t('email.warning.titleTwo'), 
                    req.t('email.warning.prOne'),
                    req.t('email.warning.prTwo'),
                    user.name, 
                    null, 
                    "warning", 
                    req.t('email.warning.textAction')
                )
        
                await sendEmail(
                    email, 
                    req.t('email.warning.tittle'), 
                    template, 
                    req.t('email.warning.tittle'),
                )
            }
            if(user.intentsFailBlocked >= 5){
                user.status = 'BLOCKED'
                const code = uuidv4()
                user.code = code
                const {token} = getToken({email, code})

                const template = getTemplate(
                    req.t('email.reactivated.titleOne'), 
                    req.t('email.reactivated.titleTwo'), 
                    req.t('email.reactivated.prOne'),
                    req.t('email.reactivated.prTwo'),
                    user.name, 
                    token, 
                    "reactivated", 
                    req.t('email.reactivated.textAction')
                )
        
                await sendEmail(
                    email, 
                    req.t('email.reactivated.tittle'), 
                    template, 
                    req.t('email.reactivated.tittle'),
                )

                await user.save()
            }
            await user.save()
            return res.status(403).json({error: req.t('user.login.invalid_password')})
        }

        if(user.verified === "UNVERIFIED") return res.status(403).json({error: req.t('user.login.not_verified')})
        
        
        if(user.userStatus === "DISABLED") {
            user.userStatus = "ENABLED"
            await user.save()
        }
        const id = user.id
        const userRol = user.rol
        //generar el jwt token
        const {token, expiresIn} = getToken({id, userRol});  
        generateRefreshToken({id, userRol}, res)


        // ya hize login
        if(department === 'finance') {
           
            const description = 'Intento de acceso correcto de finanzas'
            await newLog(
                description, 
                req.ip,
                user._id, 
            )
        }

        user.intentos = 0
        user.intentsFailBlocked = 0
        user.lastIntent = null
        user.lastLogin = new Date()
        await user.save()
        return res.json({
            token, 
            expiresIn, 
            name : `${user.name} ${user.apellidoP} ${user.apellidoM}` ,
            email : user.email ,
            rol : user.rol
        })

    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            msg: 'Error al hacer el logeo'
        }) 
    }
}

export const recoverCount = async (req, res) =>{
    try {
        const { token } = req.params

        const data = getTokenData(token)
        if(data === null){
            return res.json({
                success: false,
                msg: 'Error al obtener data'
            })
        }

        const {email, code} = data.uid

        const user = await User.findOne({email})

        if(user === null){
            return res.json({
                success: false,
                msg: 'El usuario no existe'
            })
        }

        if(code !== user.code){
            // return res.redirect('https://mygardenllcservices.com/notverified')
            return res.redirect('https://mygardenllcservices.com/notverified')
        }

        user.status = 'DISBLOCKED'
        user.intentsFailBlocked = 0
        user.intentos = 0
        user.lastIntent = null
        await user.save()

        // return res.redirect('https://mygardenllcservices.com/recover')
        return res.redirect('https://mygardenllcservices.com/recover')
    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            msg: 'Error al confirmar usuario'
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


export const refreshToken  = async (req, res) => {
    try {
        const {token, expiresIn} = getToken(req.uid);  
        console.log("Funcion de user refresh")
        const {uid} = getTokenData (token)
        console.log("uid: ", uid)
        const user = await User.findById(uid.id)
        console.log("user: ", user)
        return res.json({
            token, 
            expiresIn,
            name : `${user.name} ${user.apellidoP} ${user.apellidoM}` ,
            email : user.email,
            rol : user.rol
        })
    } catch (error) {
        console.log('error en la funcion refresh token')
        console.log(error);
        return res.status(500).json({error: 'Error de servidor'})
    }
};






export const infoUser = async (req, res) => {
    try {
        const user = await User.findById(req.uid.id).lean()

        return res.json({
            _id: user._id, 
            fullName : `${user.name} ${user.apellidoP} ${user.apellidoM}` , 
            name : user.name,
            apellidoP: user.apellidoP,
            apellidoM : user.apellidoM,
            email: user.email, 
            phone: user.cellPhone,
            username : user.userName,
            fechaNacimiento : user.fechaNacimiento,
            genero : user.genero,
            cellPhone :  user.cellPhone
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({error: 'Error de servidor'})
    }
}




export const addEmpolyed = async  (req, res) =>{
    try {
        const {
            name,
            apellidoP,
            apellidoM,
            genero,
            cellPhone,
            email,
            password,
            direccion,
            userName,
            rol,
            lade
        } = req.body
        

        let user = await User.findOne({ email});
          

        if(user !== null){
            return res.json({
                success: false,
                msg: "Este correo ya esta asociado a otro empleado"

            })
        }

        user = await User.findOne({ cellPhone});
          
        if(user !== null){
            return res.json({
                success: false,
                msg: "Este telefono ya esta asociado a otro empleado"
            })
        }

        user = new User({
            name,
            apellidoP,
            apellidoM,
            genero,
            cellPhone,
            direccion,
            email,
            userName,
            password,
            rol,
            lade,
            verified : 'VERIFIED'
        })

        await user.save();

        return res.json({
            success: true,
            msg: "Registro de empleado correcto"
        })
        
    } catch (error) {  
        console.log("Error en el  registro del empleado")
        console.log(error)
        return res.json({
            success: false,
            msg: 'Error al registrar empleado'
        })
    }
}

export const updateUser = async (req, res) => {
    try {
        const updateData = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.uid.id,
            updateData,
            { new: true, runValidators: true }
        );          
        if (!updatedUser) {
            return res.json({
                success : false,
                msg : 'Usuario no encontrado'
            })
        }
        return res.json({
            success : true,
            msg : 'Usuario Actualizado',
            updatedUser : {
                _id: updatedUser._id, 
                fullName : `${updatedUser.name} ${updatedUser.apellidoP} ${updatedUser.apellidoM}` , 
                name : updatedUser.name,
                apellidoP: updatedUser.apellidoP,
                apellidoM : updatedUser.apellidoM,
                email: updatedUser.email, 
                phone: updatedUser.cellPhone,
                username : updatedUser.userName,
                fechaNacimiento : updatedUser.fechaNacimiento,
                genero : updatedUser.genero,
                cellPhone :  updatedUser.cellPhone
            }
        })
    } catch (error) {
        console.log('Error al actualizar el usuario')
        console.log(error);

        return res.json({
            success: false,
            msg: 'Error al registrar empleado'
        })
    }
};
