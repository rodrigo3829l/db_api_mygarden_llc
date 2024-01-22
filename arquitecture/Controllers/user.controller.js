import { User } from "../models/Users.js"
import { v4 as uuidv4 } from "uuid";
import {getToken, getTokenData} from "../../helpers/middlewares/JWT.config.js"
import {sendEmail, getTemplate } from "../../helpers/config/mail.config.js"
import {uploadImage} from "../../helpers/utils/cloudinary.js"


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

        let user = await User.findOne({
            $or: [
              { userName: userName },
              { email: email }
            ]
          });
          

        if(user !== null){
            return res.json({
                success: false,
                msg: 'Email ya existe',
                email,
                userName
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
        if(req.files?.img){
            const {public_id, secure_url} = await uploadImage(req.files.img.tempFilePath)
            user.img ={
                public_id,
                secure_url  
            }
            fs.unlink(req.files.img.tempFilePath)
        }

        const {token, expiresIn} = getToken({email, userName, password, code})

        const template = getTemplate(name, token)

        await sendEmail(email, 'Confirm acount', template)

        await user.save();

        return res.json({
            success: true,
            msg: "Registro correcto"
        })

    } catch (error) {  
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
            return res.redirect('http://localhost:5173/#/messages/errorConfirm')
        }

        user.verified = 'VERIFIED'
        user.status = 'CONECTED'

        await user.save()

        return res.redirect('http://localhost:5173/#/messages/successConfirm')
    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            msg: 'Error al confirmar usuario'
        })
    }
}

