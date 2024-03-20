import { User } from "../models/Users.js"
import { newLog } from "../../helpers/config/log.config.js";
import { v4 as uuidv4 } from "uuid";
import fs from 'fs-extra';
import {getToken, getTokenData, generateRefreshToken} from "../../helpers/middlewares/JWT.config.js"
import {sendEmail, getTemplate } from "../../helpers/config/mail.config.js"
// import {uploadImage} from "../../helpers/utils/cloudinary.js"
import {generateRandomCode} from "../../helpers/config/code.confi.js"
import { sendSms } from "../../helpers/config/sms.config.js";


export const getEmployeds = async (req, res) =>{
    try {
        const employeds = await User.find({rol: 'employed'})

        return res.json({
            success : true,
            employeds
        })
    } catch (error) {
        console.log(error)
        console.log("Error al obtener empleados")
    }
}