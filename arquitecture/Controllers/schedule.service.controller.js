import { ScheduleService } from "../models/ScheduledService.js";
import { Service } from "../models/Services.js";
import { User } from "../models/Users.js";
import { Products } from "../models/Products.js";
import {getToken, getTokenData, generateRefreshToken} from "../../helpers/middlewares/JWT.config.js"

import { getAdminTemplate, getTemplate, sendEmail } from "../../helpers/config/mail.config.js";

export const bookService = async (req, res) => {
    try {
        const {
            user,
            service,
            description,
            img,
            typeReserve,
            scheduledTime
        } = req.body    
        // const scheduledTime = new Date()

        const data = getTokenData(user)
        const id = data.uid
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

        const newBookService = new ScheduleService({
            user: id,
            service: existSevice._id,
            description,
            img,
            typeReserve,
            dates: {
                scheduledTime: scheduledTime
            }
        });
        
        await newBookService.save(); 
        
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
        const adminTemplate = getAdminTemplate(existUser.name, existSevice.name, scheduledTime)

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

        service.additionalCosts = additionalCosts

        service.employeds = employeds

        // al total anterior se le suuman los costos adicionales
        totalGeneral = totalGeneral + additionalCosts.labor + additionalCosts.machinery

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

export const payService = async (req, res) => {
    try {
        
        
    } catch (error) {
        console.log("Error")
        console.log(error)
        return res.json({
            success: false,
            msg : ''
        })
    }
}

export const getSchedulesServicesByUser = async (req, res) => {
    try {
        const {token} = req.params;
        // console.log("El token")
        // console.log(token)
        const data = getTokenData(token);
        const id = data.uid;
        // console.log(id);

        const existUser = await User.findById(id);

        if (!existUser) {
            return res.json({
                success: false,
                msg: "No existe el usuario",
            });
        }

        // Asumiendo que el campo que relaciona el servicio con el usuario se llama 'user'
        const services = await ScheduleService.find({ user: id });

        // Devuelve los servicios encontrados
        return res.json({
            success: true,
            services, // Esto devolverá el arreglo de servicios asociados al usuario
        });

    } catch (error) {
        console.log("Error");
        console.log(error);
        return res.json({
            success: false,
            msg: 'Error al obtener los servicios',
        });
    }
};

export const getScheduleService = async (req, res) => {
    try {
        const {id} = req.params

        const scheduledService = await ScheduleService.findById(id)

        if (!scheduledService) {
            return res.json({
                success: false,
                msg: 'No se encontro el servicio'
            })
        }

        const service = await Service.findById(scheduledService.service)

        const newService = {
            id: scheduledService._id,
            // user : scheduledService.user,
            service : service.name,
            description : scheduledService.description,
            img : scheduledService.img.secure_url,
            status : scheduledService.status,
            quote : scheduledService.quote,
            pay : scheduledService.pay,
            // aqui van los productos
            typeReserve : scheduledService.typeReserve,
            dates : scheduledService.dates,
            pending : scheduledService.pending
        }

        // Obtener y agregar los nombres de los empleados asignados
        if (scheduledService.employeds && scheduledService.employeds.length > 0) {
            const employedsNames = await Promise.all(scheduledService.employeds.map(async (employeeId) => {
                const { name, apellidoP, apellidoM } = await User.findById(employeeId); // Usa el modelo User adecuado
                return `${name} ${apellidoP} ${apellidoM}`; // Concatena los nombres
            }));

            newService.employeds = employedsNames; // Agrega los nombres al nuevo servicio
        }

        const productsNames = [];

        for (const { product, quantity, total } of scheduledService.products) {
            const productExist = await Products.findById(product);

            if (!productExist) {
                // Manejar el caso en que el producto no se encuentra
                console.log(`Producto con ID ${product} no encontrado`);
                continue; // Salta a la siguiente iteración del ciclo
            }

            productsNames.push({
                product: productExist.product,
                quantity,
                total
            });
        }
        if(scheduledService.status !== 'quoting'){
            newService.products = productsNames
            newService.typePay = scheduledService.typePay
            newService.additionalCosts = scheduledService.additionalCosts

        }

        return res.json({
            success: true,
            newService
        })
    } catch (error) {
        console.log("Error aln buscar un servicio agendado")
        console.log(error)
        return res.json({
            success: false,
            msg: 'No se encontro el servicio agendado'
        })
    }
}