import { Comment } from "../models/Comment.js";
import { ScheduleService } from "../models/ScheduledService.js";
import { Service } from "../models/Services.js";
import { User } from "../models/Users.js";
import { login } from "./user.controller.js";

export const addComment = async (req, res) =>{
    try {
        const {comment, rating, scheduleservice} = req.body

        const existScheduleService = await ScheduleService.findById(scheduleservice)

        if(!existScheduleService) {
            return res.json({
                success : false,
                msg: req.t('comment.addComment.notSchedule')
            })
        }

        const existeService = await Service.findById(existScheduleService.service)
        if(!existeService) {
            return res.json({
                success : false,
                msg: req.t('comment.addComment.notService')
            })
        }

        existeService.Calificacion.totales ++
        existeService.Calificacion.cantidad += rating

        await existeService.save()
        
        existeService.Calificacion.total = parseFloat((existeService.Calificacion.cantidad / existeService.Calificacion.totales).toFixed(1))
        
        await existeService.save()

        const newComment = new Comment({
            user: existScheduleService.user,
            scheduleservice,
            service: existScheduleService.service,
            comment,
            rating
        })

        await newComment.save()

        return res.json({
            success: true,
            msg:  req.t('comment.addComment.success')
        })
    } catch (error) {
        console.log("error al hacer comentario")
        return res.json({
            success: false,
            msg : "Error al deajar comentario"
        })
    }
}

export const getCommentByScheduledId = async (req, res) => {
    try {
        const { id } = req.params; // Extraer el ID del servicio agendado de los parámetros de la ruta.
        // Buscar comentarios que coincidan con el ID del servicio agendado.
        const scheduledServiceComments = await Comment.find({ scheduleservice: id });

        // Verificar si se encontraron comentarios.
        if (scheduledServiceComments.length === 0) {
            // Si no se encontraron comentarios, enviar una respuesta indicando que el servicio agendado no tiene comentarios.
            return res.json({
                success: false,
            });
        }

        const user =  await User.findById(scheduledServiceComments[0].user)

        // Si se encontraron comentarios, enviarlos como respuesta.
        res.json({
            success: true,
            comment : {
                comment : scheduledServiceComments[0].comment,
                rating :  scheduledServiceComments[0].rating,
                // img : user.img.secure_url,
                name : `${user.name} ${user.apellidoP} ${user.apellidoM}`
            }
        });
    } catch (error) {
        console.error(error); // Imprimir el error en la consola para depuración.
        // Enviar una respuesta de error genérico.
        res.json({
            success: false,
            message: 'Ocurrió un error al buscar los comentarios.'
        });
    }
};

export const getAllComments = async (req, res) =>{
    try{
        const comments = await Comment.find().populate('user', {
            name : 1,
            apellidoP : 1,
            apellidoM : 1,
            _id : 0,
        }).populate('service', {
            name : 1,
            _id : 0
        })
        return res.json({
            success: true,
            comments
        })
    }catch(error){
        console.log(error)
    }
}