import { getContactTemplate, sendEmail } from "../../helpers/config/mail.config.js";

export const contact = async (req, res) =>{
    try {
        const {name, email, message, subject} = req.body

        const template = getContactTemplate(name, email, message)
        await sendEmail(
            process.env.USER,
            subject,
            template,
            subject

        )
        return res.json({
            success : true,
            msg : 'Mensaje enviado con exito'
        })
    } catch (error) {
        console.log(error)
        return res.json({
            success : false,
            msg : 'Error al enviar el mensaje'
        })
    }
}