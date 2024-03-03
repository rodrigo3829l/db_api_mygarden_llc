import {Service} from '../models/Services.js'
import { TypeService } from "../models/TypeServices.js";

export const addService = async (req, res) => {
    try {
        const {
            name,
            description,
            typeService,
            img,
        } = req.body;

        const existingType = await TypeService.findOne({ tipo : typeService });

        if (!existingType) {
            return res.json ({
                success : false,
                msg : req.t('services.addService.notTypeService')
            })
        }
        const newService = new Service ({
            name,
            description,
            tipoDeServicio : existingType._id,
            img,
        })

        await newService.save()

        return res.json ({
            success: true,
            msg : req.t('services.addService.success')
        })
    } catch (error) {
        console.log("Error en el registro del nuevi servicio");
        console.log(error);
        return res.json({
            success: false,
            msg: 'Eroro al registrar el nuevo servicio'
        });
    }
}

export const getServices = async (req, res) =>{
    try {
        const services = await Service.find();
        return res.json({
            success : true,
            services
        })
    } catch (error) {
        console.log("Error al obtener los servicios")
        console.log(error);
        return res.json({
            success: false,
            msg: 'Error al obtener los servicios'
        });
    }
}

export const getServiceById = async (req, res) => {
    try {
        const {id} = req.params

        const service = await Service.findById(id)

        if (!service){
            return res.json({
                success: false,
                msg : req.t('services.getServiceById.notService')
            })
        }

        return res.json({
            success: true,
            msg : req.t('services.getServiceById.success'),
            service
        })
    } catch (error) {
        console.log("Error al obtener el servicio")
        console.log(error);
        return res.json({
            success: false,
            msg: 'Error al obtener el servicio'
        });
    }
}

export const updateServiceById = async (req, res) => {
    try {
        const { id } = req.params; // Asume que el ID del producto se pasa como parámetro en la URL
        const updateData = req.body;

        const updateService =  await Service.findByIdAndUpdate(id, updateData, {new : true, runValidators: true})
    
        if (!updateService) {
            return res.json({
                success: false,
                msg: req.t('services.updateService.notService')
            });
        }

        return res.json({
            success: true,
            msg: req.t('services.updateService.success'),
            data: updateService
        });
    } catch (error) {
        console.log("Error al obtener el servicio")
        console.log(error);
        return res.json({
            success: false,
            msg: 'Error al obtener el servicio'
        });
    }
}

export const setServiceUsability = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await Service.findById(id)

        if (!service) {
            return res.json({
                success: false,
                msg: req.t('services.setServiceUsability.notService')
            });
        }

        service.isUsable = !service.isUsable
        await service.save()

        return res.json({
            success: true,
            msg: req.t('services.setServiceUsability.success'),
            data: product
        });
    } catch (error) {
        console.log("Error")
        console.log(error)
        return res.json({
            success: false,
            msg : 'Error al actualizar la usabilidad del servicio'
        })
    }
}


