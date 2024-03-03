import { TypeService } from "../models/TypeServices.js";

export const addTypeService = async (req, res) => {
    try {
        const { tipo } = req.body;
        

        const existingType = await TypeService.findOne({ tipo });

        if (existingType) {
            return res.json({
                success: false,
                msg: req.t('typeServices.addTypeService.existService')
            });
        }

        const newTypeService = new TypeService({
            tipo
        });

        await newTypeService.save(); // Guardar el nuevo tipo de servicio en la base de datos

        return res.json({
            success: true,
            msg: req.t('typeServices.addTypeService.success')
        });

    } catch (error) {
        console.log("Error en el registro del tipo de servicio");
        console.log(error);
        return res.json({
            success: false,
            msg: 'Error al registrar el tipo de servicio'
        });
    }
};


export const getTipeServices = async (req, res) =>{
    try {
        const tipesServices = await TypeService.find()
        return res.json ({
            success: true,
            tipesServices
        })
    } catch (error) {
        console.log("Error al obtener los tipos de servicios")
        console.log(error);
        return res.json({
            success: false,
            msg: 'Error al obtener los tipos de servicios'
        });
    }
}

export const updateTypeService = async (req, res) => {
    try {
        const { id } = req.params; 
        const updateData = req.body;

        const updatedTypeService = await TypeService.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if (!updatedTypeService) {
            return res.json({
                success: false,
                msg: req.t('typeServices.updateTypeService.existService')
            });
        }

        return res.json({
            success: true,
            msg: req.t('typeServices.updateTypeService.success'),
            updatedTypeService
        });

    } catch (error) {
        console.log("Error al actualizar el tipo de servicio");
        console.log(error);
        return res.json({
            success: false,
            msg: 'Error al actualizar el tipo de servicio'
        });
    }
};


export const setServiceSuspendStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await TypeService.findById(id);

        if (!service) {
            return res.json({
                success: false,
                msg: req.t('typeServices.setServiceSuspendStatus.existService')
            });
        }

        service.isUsable = !service.isUsable
        await service.save();

        return res.json({
            success: true,
            msg: req.t('typeServices.setServiceSuspendStatus.success'),
            data: service
        });

    } catch (error) {
        console.log("Error al establecer la suspensión del tipo de servicio", error);
        return res.json({
            success: false,
            msg: 'Error al actualizar el estado de suspensión del tipo de servicio'
        });
    }
};
