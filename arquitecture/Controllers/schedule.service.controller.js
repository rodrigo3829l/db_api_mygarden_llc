import { ScheduleService } from "../models/ScheduledService.js";
import { Service } from "../models/Services.js";
import { User } from "../models/Users.js";
import { Products } from "../models/Products.js";
import { addDate } from "../../helpers/config/date.config.js";
import {getTokenData} from "../../helpers/middlewares/JWT.config.js"

import { getAdminTemplate, getTemplate, sendEmail } from "../../helpers/config/mail.config.js";

import { createNewNotification } from "./notifications.controller.js";

export const bookService = async (req, res) => {
    try {
        const {
            userId,
            user,
            service,
            description,
            img,
            typeReserve,
            scheduledTime
        } = req.body    
        // console.log(req.body)
        // Comprueba si la fecha programada es al menos 5 días después de la fecha actual
        const today = new Date();
        const scheduledDate = new Date(scheduledTime);
        const difference = scheduledDate - today;
        const differenceInDays = difference / (1000 * 60 * 60 * 24);
        if (differenceInDays < 5) {
            return res.json({
                success: false,
                msg: 'La fecha programada debe ser al menos 5 días después de la fecha actual.'
            });
        }

        // Recuerda descomentar lo anterior eh, para que no se te olvide, es lo siguientek
        // console.log(user)
        let id
        if(!userId){
            const data = getTokenData(user)
            id = data.uid.id
        }else{
            id = userId
        }
        // console.log(id)

        const existUser = await User.findById(id)

        if(!existUser){
            return res.json ({
                success : false,
                msg : req.t('schedule.bookService.notUser')
            })
        }

        const existSevice = await Service.findById(service)

        if(!existSevice){
            return res.json ({
                success : false,
                msg : req.t('schedule.bookService.notService')
            })
        }

        const existServices = await ScheduleService.find({ "dates.scheduledTime": scheduledTime });

        if(existServices && existServices.length > 0){
            const userServices = existServices.filter(service => service.user.toString() === existUser._id);
            if (userServices.length >= 2) {
                return res.json({
                    success: false,
                    msg: 'Lo siento pero  ya haz alcanzado el limite de servicios agendados por fecha.'
                });
            }
    
            if(userServices.length === 1){
                if(userServices[0].service.toString() === existSevice._id.toString()){
                    return res.json({
                        success: false,
                        msg: 'No puedes agendar el mismo servicio para el mismo dia'
                    });
                }
            }
    
            if(existServices.length === 3){
                await addDate(scheduledTime)
            }
            if(existServices.length >= 4){
                return res.json({
                    success :  false,
                    msg : 'Esta fecha no esta disponible, por favor seleccione otra'
                })
            }
        }
        let visitor_id;

        // Buscar usuarios con rol 'visitor'
        const visitorUsers = await User.find({ rol: 'visitor' });

        if (visitorUsers && visitorUsers.length > 0) {
            // Si hay varios usuarios 'visitor', seleccionar uno aleatoriamente
            const randomIndex = Math.floor(Math.random() * visitorUsers.length);
            visitor_id = visitorUsers[randomIndex]._id;
        } else {
            // Si no hay usuario 'visitor', buscar uno con rol 'admin'
            const adminUser = await User.findOne({ rol: 'admin' });
            if (adminUser) {
                visitor_id = adminUser._id;
            } else {
                return res.json({
                    success: false,
                    msg: 'No se encontró un usuario con rol de administrador o visitante.'
                });
            }
        }

        const newBookService = new ScheduleService({
            user: existUser._id,
            service: existSevice._id,
            description,
            img,
            typeReserve,
            dates: {
                scheduledTime: scheduledTime
            },
            visitor : visitor_id
        });
        
        const newServiceBooked =await newBookService.save(); 
        
        const titleOne = req.t('schedule.bookService.email.titleOne')
        const titleTwo = req.t('schedule.bookService.email.titleTwo')
        const textAction = req.t('schedule.bookService.email.textAction')
        const prTwo = req.t('schedule.bookService.email.prTwo')
        const name = existUser.name
        const code = 321
        const action = 'Confirm reserved'
        const prOne = req.t('schedule.bookService.email.prOne')

        const template = getTemplate(titleOne, titleTwo, prOne, prTwo, name, code, action, textAction)
        // se manda a llamar el template del admin
        const adminTemplate = getAdminTemplate(existUser.name, existSevice.name, scheduledTime, 'agendado')

        await sendEmail(
            existUser.email, 
            req.t('schedule.bookService.email.tittle'), 
            template, 
            req.t('schedule.bookService.email.tittle')
            )
       
        //Se mando un email al user
        await sendEmail(
            process.env.USER, 
            req.t('schedule.bookService.email.tittleAdmin'), 
            adminTemplate, 
            req.t('schedule.bookService.email.tittleAdmin')
            )
        
        const serviceScheduled = {
            title: "📅 Service Scheduled!",
            message: "Your service has been successfully scheduled. We'll see you soon!"
        }

        await createNewNotification(existUser._id, 'serviceScheduled', newServiceBooked._id, serviceScheduled.title, serviceScheduled.message)

        return res.json({
            success: true,
            msg: req.t('schedule.bookService.success')
        }); 

    } catch (error) {
        console.log("Error al agendar el servicio")
        console.log(error)
        return res.json({
            success: false,
            msg: 'Error al agendar el servicio'
        }); 
    }
}

export const quoteService = async (req, res) => {
    try {
        // se reciben los parametros
        const {id} = req.params
        const {
            products,
            additionalCosts,
            employeds
        } = req.body

        // Se busca el servicio que se va a cotizar
        const service = await ScheduleService.findById(id)


        if(!service){
            return res.json({
                success : false,
                msg : req.t('schedule.quoteService.notService')
            })
        }

        // se tiene que extraer la cantidad de los productos usados y multiplicarlos por el total

        let totalGeneral = 0;
        const productsTotals = [];

        for (const { product, quantity } of products) {
            const productExist = await Products.findById(product);

            if (!productExist) {
                // Manejar el caso en que el producto no se encuentra
                console.log(`Producto con ID ${product} no encontrado`);
                continue; // Salta a la siguiente iteración del ciclo
            }

            const totalProduct = productExist.price * quantity;
            totalGeneral += totalProduct;

            productsTotals.push({
                product: productExist._id,
                quantity,
                total: totalProduct,
            });
        }

        const existUser = await User.findById(service.user)

        service.products = productsTotals
        additionalCosts.labor = parseFloat(additionalCosts.labor)
        additionalCosts.machinery = parseFloat(additionalCosts.machinery)
        service.additionalCosts = additionalCosts

        service.employeds = employeds

        // al total anterior se le suuman los costos adicionales
        const total = totalGeneral + additionalCosts.labor + additionalCosts.machinery 
        totalGeneral =  parseFloat(total.toFixed(2));
        // se tiene que actualizar la el valor de quote por el total
        service.quote = totalGeneral
        service.pending = totalGeneral

         // se tiene que cambiar el status del servicio a cotizado
        service.status = 'quoted'

        // Se actualiza el valor de la fecha en la que se cotizo
        service.dates.quoted = new Date()

        // Se envia un correo al cliente que ya se ha cotizado el servicio
        const titleOne = req.t('schedule.quoteService.email.titleOne')
        const titleTwo = req.t('schedule.quoteService.email.titleTwo')
        const textAction = `${req.t('schedule.quoteService.email.textAction')}: $${totalGeneral}`
        const prTwo = req.t('schedule.quoteService.email.prTwo')
        const name = existUser.name
        const code = 321
        const action = 'Confirm reserved'
        const prOne = req.t('schedule.quoteService.email.prOne')

        const template = getTemplate(titleOne, titleTwo, prOne, prTwo, name, code, action, textAction)

        await sendEmail(existUser.email, req.t('schedule.quoteService.email.tittle'), template, req.t('schedule.quoteService.email.tittle'))
        const serviceQuoted = {
            title: "💬 Service Quoted!",
            message: "A new quote has been added to your requested service. Check it out now!"
        }
        await createNewNotification(existUser._id, 'serviceQuoted', service._id, serviceQuoted.title, serviceQuoted.message)
        const newService = await service.save()

        return res.json({
            success : true,
            msg : req.t('schedule.quoteService.success'),
            newService
        })

    } catch (error) {
        console.log("Error")
        console.log(error)
        return res.json({
            success: false,
            msg : 'Error al cotizar el servicio'
        })
    }
}

export const getSchedulesServicesByUser = async (req, res) => {
    try {
        const id = req.uid.id;
        const existUser = await User.findById(id);

        if (!existUser) {
            return res.json({
                success: false,
                msg: "El usuario no existe"
            });
        }

        let services = await ScheduleService.find({ user: id })
            .populate('service', 'name description')
            .populate({
                path: 'products.product',
                select: 'product price unit provider',
                populate: [
                    { path: 'unit', select: 'name' },
                    { path: 'provider', select: 'providerName contact' }
                ]
            })
            .populate('employeds', 'name apellidoP apellidoM')
            .populate('typePay', 'type')
            .exec();

        services = services.reverse();

        return res.json({
            success: true,
            services
        });

    } catch (error) {
        console.error("Error al obtener los servicios agendados del usuario:", error);
        return res.status(500).json({
            success: false,
            msg: 'Error al obtener los servicios agendados del usuario'
        });
    }
};


export const getLimitedScheduleServices = async (req, res) => {
    try {
        const services = await ScheduleService.find()
            .limit(50) // Limita los resultados a los primeros 50 registros
            .populate('user', 'name apellidoP apellidoM direccion genero') 
            .populate({
                path: 'service',
                populate: [
                    { path: 'tipoDeServicio' }, 
                ]
            })
            .populate({
                path: 'products.product',
                select: 'product price unit provider',
                populate: [
                    { path: 'unit', select: 'name' }, 
                    { path: 'provider', select: 'providerName contact' } 
                ]
            })
            .populate('employeds', 'name apellidoP apellidoM')
            .populate('typePay', 'type') 
            .exec();

        const reversedServices = services.reverse();
        return res.json({
            success: true,
            services: reversedServices
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los servicios de agenda.'
        });
    }
};


export const getScheduleServices = async (req, res) => {
    try {
        const services = await ScheduleService.find()
        .populate('user', 'name apellidoP apellidoM direccion genero') 
        .populate({
            path : 'service',
            populate:[
                { path: 'tipoDeServicio'}, 
            ]
        })
        .populate({
            path: 'products.product',
            select: 'product price unit provider',
            populate: [
            { path: 'unit', select: 'name' }, 
            { path: 'provider', select: 'providerName contact' } 
            ]
        })
        .populate('employeds', 'name apellidoP apellidoM')
        .populate('typePay', 'type') // 
        .exec();

        const reversedServices = services.reverse();
        return res.json({
            success: true,
            services: reversedServices
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los servicios de agenda.'
        });
    }
};

export const getUpcomingScheduleServices = async (req, res) => {
    try {
        const today = new Date(); // Fecha actual
        const services = await ScheduleService.find({
            "dates.scheduledTime": { $gte: today } // Filtra servicios con fecha programada mayor o igual a hoy
        })
        .populate('user', 'name apellidoP apellidoM direccion genero')
        .populate({
            path: 'service',
            populate: [
                { path: 'tipoDeServicio' }
            ]
        })
        .populate({
            path: 'products.product',
            select: 'product price unit provider',
            populate: [
                { path: 'unit', select: 'name' },
                { path: 'provider', select: 'providerName contact' }
            ]
        })
        .populate('employeds', 'name apellidoP apellidoM')
        .populate('typePay', 'type')
        .sort({ "dates.scheduledTime": 1 }) // Ordenar del más cercano al más lejano
        .exec();

        return res.json({
            success: true,
            services
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los servicios de agenda.'
        });
    }
};
export const getScheduleServicesByMonth = async (req, res) => {
    try {
        const { month, year } = req.params;

        const startDate = new Date(year, month - 1, 1); // Inicio del mes
        const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Fin del mes

        const services = await ScheduleService.find({
            "dates.scheduledTime": { $gte: startDate, $lte: endDate } // Filtra por rango de fechas
        })
        .populate('user', 'name apellidoP apellidoM direccion genero img')
        .populate({
            path: 'service',
            populate: [
                { path: 'tipoDeServicio' }
            ]
        })
        .populate({
            path: 'products.product',
            select: 'product price unit provider',
            populate: [
                { path: 'unit', select: 'name' },
                { path: 'provider', select: 'providerName contact' }
            ]
        })
        .populate('employeds', 'name apellidoP apellidoM')
        .populate('typePay', 'type')
        .sort({ "dates.scheduledTime": 1 }) // Ordenar del más cercano al más lejano
        .exec();

        return res.json({
            success: true,
            services
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los servicios por mes.'
        });
    }
};


export const getSchedulesServicesByUserAndStatus = async (req, res) => {
    try {
        const id = req.uid.id;  // ID del usuario autenticado
        const { status } = req.params;  // Obtener el status desde los parámetros de la ruta

        // Verificar si el usuario existe
        const existUser = await User.findById(id);
        if (!existUser) {
            return res.json({
                success: false,
                msg: "El usuario no existe"
            });
        }

        // Buscar los servicios del usuario según el status
        let services = await ScheduleService.find({ user: id, status })
            .populate('service', 'name description')
            .populate({
                path: 'products.product',
                select: 'product price unit provider',
                populate: [
                    { path: 'unit', select: 'name' },
                    { path: 'provider', select: 'providerName contact' }
                ]
            })
            .populate('employeds', 'name apellidoP apellidoM')
            .populate('typePay', 'type')
            .exec();

        // Invertir el orden de los servicios para mostrarlos del más reciente al más antiguo
        services = services.reverse();

        // Retornar los servicios encontrados
        return res.json({
            success: true,
            services
        });

    } catch (error) {
        console.error("Error al obtener los servicios agendados del usuario:", error);
        return res.status(500).json({
            success: false,
            msg: 'Error al obtener los servicios agendados del usuario'
        });
    }
};


export const getScheduleServicesByStatus = async (req, res) => {
    try {
        const { status } = req.params; // Obtener el status desde los parámetros de la ruta

        // Buscar servicios de agenda por status
        const services = await ScheduleService.find({ status })
            .populate('user', 'name apellidoP apellidoM direccion')
            // .populate('service', 'name description')
            .populate({
                path : 'service',
                select : 'name description',
                populate : [
                    {path: 'tipoDeServicio', select: 'tipo'}
                ]
            })
            .populate({
                path: 'products.product',
                select: 'product price unit provider',
                populate: [
                    { path: 'unit', select: 'name' },
                    { path: 'provider', select: 'providerName contact' }
                ]
            })
            .populate('employeds', 'name apellidoP apellidoM')
            .populate('typePay', 'type')
            .exec();

        return res.json({
            success: true,
            services
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los servicios de agenda.'
        });
    }
};


export const changeStatus = async (req, res) =>{
    try {
        const {id} = req.params
        const userId = req.uid.id
        const updateData = req.body;


        console.log(updateData)

        const service = await ScheduleService.findByIdAndUpdate(id, updateData, { new: true })

        if(!service){
            return res.json({
                success : true,
                msg : 'No se actualizo el status del servicio'
            })
        }
        const user = await User.findById(userId)
        
        return res.json({
            success: true,
            msg: 'Se actualizo el status'
        });
    } catch (error) {
        console.log('Error al cambiar el status')
        return res.json({
            success : true,
            msg : 'No se actualizo el status del servicio'
        })
    }
}

export const getScheduleService = async (req, res) => {
    try {
        const { id } = req.params;
        const scheduledService = await ScheduleService.findById(id)
            .populate('user', 'name apellidoP apellidoM direccion')
            .populate('service', 'name description')
            .populate({
                path: 'products.product',
                select: 'product price unit provider',
                populate: [
                    { path: 'unit', select: 'name' },
                    { path: 'provider', select: 'providerName contact' }
                ]
            })
            .populate('employeds', 'name apellidoP apellidoM img')
            .populate('typePay', 'type')
            .exec();

        if (!scheduledService) {
            return res.json({
                success: false,
                msg: 'No se encontró el servicio'
            });
        }


        return res.json({
            success: true,
            scheduledService
        });
    } catch (error) {
        console.error("Error al buscar un servicio agendado:", error);
        return res.status(500).json({
            success: false,
            msg: 'Error al buscar un servicio agendado'
        });
    }
};


export const cancelService = async (req, res) => {
    try {
        const { serviceId } = req.params
        console.log(serviceId)
        // Verifica si el servicio existe
        const existingService = await ScheduleService.findById(serviceId);
        if (!existingService) {
            return res.json({
                success: false,
                msg: req.t('schedule.cancelService.dontExist'),
            });
        }

        if(existingService.quote !== 0){
            if(existingService.pending !== 0){
                return res.json({
                    success: false,
                    msg : 'No puedes cancelar tu servicio sin antes haber pagado su totalidad esto de acuerdo a las politicas'
                })
            }
        }
        // Actualiza el estado del servicio a 'canceled'
        existingService.status = 'canceled';
        await existingService.save();
        const user = await User.findById(existingService.user)
        if(!user){
            return res.json({
                success: false,
                msg: req.t('schedule.cancelService.notUser'),
            });
        }

        const service = await Service.findById(existingService.service)
        if(!service){
            return res.json({
                success: false,
                msg: req.t('schedule.cancelService.dontService'),
            });
        }

        // mandar el email de la reagenda
        const template = getAdminTemplate(user.userName, service.name, new Date(existingService.dates.scheduledTime), 'cancelado')
        await sendEmail(
            process.env.USER, 
            'Servicio cancelado', 
            template, 
            'Servicio cancelado'
            )

            const serviceCancelled = {
                title: "❌ Service Cancelled!",
                message: "Your service has been cancelled. Contact us for more details."
            }
            await createNewNotification(user._id, 'serviceCancelled', serviceId, serviceCancelled.title, serviceCancelled.message)
        // mandar el email de cancelacion
        return res.json({
            success: true,
            msg: req.t('schedule.cancelService.candeled')
        });

    } catch (error) {
        console.log("Error");
        console.log(error);
        return res.json({
            success: false,
            msg: req.t('schedule.cancelService.error'),
        });
    }
};


export const rescheduleService = async (req, res) => {
    try {
        
        const { serviceId } = req.params;
        const { newDate } = req.body;

        // Verifica si el servicio existe
        const existingService = await ScheduleService.findById(serviceId);
        if (!existingService) {
            return res.json({
                success: false,
                msg: req.t('schedule.rescheduleService.dontService'),
            });
        }

        // Verifica si la fecha proporcionada es mayor que la fecha actual + 4 días
        const currentDate = new Date();
        
        // Calcula la diferencia en milisegundos entre la fecha actual y la fecha programada del servicio
        const differenceInMs = existingService.dates.scheduledTime - currentDate;

        // Convierte la diferencia de milisegundos a días
        const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);
        // Si la diferencia es igual o menor a 4 días, entonces se permite reprogramar el servicio
        if (differenceInDays <= 4) {
            return res.json({
                success: false,
                msg:  req.t('schedule.rescheduleService.day')
            });
        }

        // Verifica si la fecha proporcionada es mayor que la fecha actual del servicio
        if (new Date(newDate) <= existingService.dates.scheduledTime) {
            return res.json({
                success: false,
                msg:  req.t('schedule.rescheduleService.date')
            });
        }
        
        // Actualiza la fecha programada del servicio
        existingService.dates.scheduledTime = new Date(newDate);
        await existingService.save();

        const user = await User.findById(existingService.user)
        if(!user){
            return res.json({
                success: false,
                msg:  req.t('schedule.rescheduleService.dontUser')
            });
        }

        const service = await Service.findById(existingService.service)
        if(!service){
            return res.json({
                success: false,
                msg:  req.t('schedule.rescheduleService.dontService')
            });
        }

        // mandar el email de la reagenda
        const template = getAdminTemplate(user.userName, service.name, newDate, 'reagendado')
        await sendEmail(
            process.env.USER, 
            'Servicio reagendado', 
            template, 
            'Servicio reagendado'
            )

        const serviceRescheduled = {
            title: "🔄 Service Rescheduled!",
            message: "Your service has been rescheduled. Check the new date and time!"
        }
        await createNewNotification(user._id, 'serviceRescheduled', existingService._id, serviceRescheduled.title, serviceRescheduled.message)

        return res.json({
            success: true,
            msg:  req.t('schedule.rescheduleService.success')
        });

    } catch (error) {
        console.log("Error");
        console.log(error);
        return res.json({
            success: false,
            msg:  req.t('schedule.rescheduleService.error')
        });
    }
};
