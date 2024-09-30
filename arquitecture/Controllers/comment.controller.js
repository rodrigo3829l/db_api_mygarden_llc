import { Comment } from "../models/Comment.js";
import { ScheduleService } from "../models/ScheduledService.js";
import { Service } from "../models/Services.js";
import { User } from "../models/Users.js";

export const addComment = async (req, res) =>{
    try {
        const {comment, rating, scheduleservice, category} = req.body

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
            rating,
            category
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
                img : user.img.secure_url,
                name : `${user.name} ${user.apellidoP} ${user.apellidoM}`,
                date : scheduledServiceComments[0].date
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

export const getAllComments = async (req, res) => {
    try {
        const comments = await Comment.find().populate('user', {
            name: 1,
            apellidoP: 1,
            apellidoM: 1,
            _id: 0,
        }).populate('service', {
            name: 1,
            _id: 0
        });

        // // Procesar los comentarios para formatear la fecha
        // const formattedComments = comments.map(comment => {
        //     const formattedDate = new Date(comment.date).toLocaleDateString('es-MX');
        //     return {
        //         ...comment.toObject(),
        //         date: formattedDate
        //     };
        // });

        return res.json({
            success: true,
            comments//: formattedComments
        });
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            msg: 'Error al obtener los comentarios'
        });
    }
};

export const getCommentsRating = async (req, res) => {
    try {
        // Filtro para obtener solo comentarios con rating >= 4
        const comments = await Comment.find({ rating: { $gte: 3 } })
            .populate('user', {
                name: 1,
                apellidoP: 1,
                apellidoM: 1,
                _id: 0,
            })
            .populate('service', {
                name: 1,
                _id: 0,
            });

        return res.json({
            success: true,
            comments,
        });
    } catch (error) {
        console.error("Error al obtener comentarios:", error);
        return res.json({
            success: false,
            message: "Error al obtener comentarios",
        });
    }
};

// Modificado para filtrar por un servicio específico
export const getCommentsByService = async (req, res) => {
    try {
        // Obtener el ID del servicio del parámetro de la ruta
        const { idService } = req.params;

        // Filtro para obtener solo comentarios con rating >= 3 y que correspondan al servicio específico
        const comments = await Comment.find({ 
                service: idService,
                rating: { $gte: 3 } 
            })
            .populate('user', {
                name: 1,
                apellidoP: 1,
                apellidoM: 1,
                _id: 0,
            })
            .populate('service', {
                name: 1,
                _id: 0,
            });

        return res.json({
            success: true,
            comments,
        });
    } catch (error) {
        console.error("Error al obtener comentarios:", error);
        return res.json({
            success: false,
            message: "Error al obtener comentarios",
        });
    }
};


export const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, rating } = req.body;

        const updatedComment = await Comment.findByIdAndUpdate(id, { comment, rating }, { new: true });

        if (!updatedComment) {
            return res.json({
                success: false,
                msg: req.t('comment.updateComment.notFound')
            });
        }

        const service = await Service.findById(updatedComment.service);
        if (service) {
            const allCommentsForService = await Comment.find({ service: service._id });
            const totalRatings = allCommentsForService.reduce((acc, curr) => acc + curr.rating, 0);
            const totalComments = allCommentsForService.length;
            service.Calificacion.total = parseFloat((totalRatings / totalComments).toFixed(1));
            service.Calificacion.cantidad = totalRatings;
            service.Calificacion.totales = totalComments;
            await service.save();
        }

        return res.json({
            success: true,
            msg: req.t('comment.updateComment.success'),
            comment: updatedComment
        });
    } catch (error) {
        console.log("Error al actualizar el comentario");
        console.log(error);
        return res.json({
            success: false,
            msg: 'Error al actualizar el comentario'
        });
    }
};

// Función para eliminar un comentario
export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedComment = await Comment.findByIdAndDelete(id);

        if (!deletedComment) {
            return res.json({
                success: false,
                msg: 'Comentario no encontrado'
            });
        }

        const service = await Service.findById(deletedComment.service);
        if (service) {
            const allCommentsForService = await Comment.find({ service: service._id });
            const totalRatings = allCommentsForService.reduce((acc, curr) => acc + curr.rating, 0);
            const totalComments = allCommentsForService.length;
            service.Calificacion.total = totalComments > 0 ? parseFloat((totalRatings / totalComments).toFixed(1)) : 0;
            service.Calificacion.cantidad = totalRatings;
            service.Calificacion.totales = totalComments;
            await service.save();
        }

        return res.json({
            success: true,
            msg: 'Se elimino correctamente'
        });
    } catch (error) {
        console.log("Error al eliminar el comentario");
        console.log(error);
        return res.json({
            success: false,
            msg: 'Error al eliminar el comentario'
        });
    }
};
