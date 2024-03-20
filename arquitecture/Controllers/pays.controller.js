import { Pays } from "../models/Pays.js";
import { User } from "../models/Users.js";
import { ScheduleService } from "../models/ScheduledService.js";
import { Service } from "../models/Services.js";
import { TypePay } from "../models/TypePay.js";
import { newLog } from "../../helpers/config/log.config.js";
import {getToken, getTokenData, generateRefreshToken} from "../../helpers/middlewares/JWT.config.js"

export const payScheduledService = async (req, res) => {
    try {
        const { user, mount, scheduleService, type } = req.body;
        const amount = (mount).toFixed(2)
        const data = getTokenData(user);
        const userId = data.uid.id;

        const existUser = await User.findById(userId);
        if (!existUser) {
            return res.status(404).json({
                success: false,
                msg: req.t('pays.payService.notUser')
            });
        }

        const existService = await ScheduleService.findById(scheduleService);
        if (!existService) {
            return res.status(404).json({
                success: false,
                msg:req.t('pays.payService.notService')
            });
        }

        const halfQuote = (existService.pending / 2).toFixed(2);
        if (amount < halfQuote || (amount > halfQuote && amount < existService.pending)) {
            return res.status(400).json({
                success: false,
                msg: req.t('pays.payService.onlyPorcentaje')
            });
        }

        let isTotally = amount >= existService.pending;
        let porcentage = isTotally ? 100 : 50;
        existService.pending = existService.pending - amount
        existService.pay = { 
            porcentage,
            totalPay: isTotally,
        };
        existService.typePay = type;
        if(isTotally) existService.status = 'pay'

        await existService.save();

        const newPay = new Pays({
            user: existUser._id,
            amount,
            scheduleService,
            isTotally,
            type,
        });

        

        await newPay.save();

        return res.json({
            success: true,
            msg: req.t('pays.payService.success')
        });

    } catch (error) {
        console.log("Error al pagar el servicio", error);
        return res.status(500).json({
            success: false,
            msg: 'Error al procesar el pago del servicio',
        });
    }
};

export const updatePay = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const existUser = await User.findById(req.uid.id);
        if (!existUser) {
            return res.status(404).json({
                success: false,
                msg: req.t('pays.payService.notUser')
            });
        }

        // Actualizar el servicio programado
        const updatePay = await Pays.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatePay) {
            return res.status(404).json({
                success: false,
                msg: req.t('pays.updateService.notFound')
            });
        }
        const description = 'Actualizacion de datos en el departamento de finanzas'
        await newLog(
            description, 
            req.ip,
            existUser._id, 
        )

        return res.json({
            success: true,
            msg: req.t('pays.updateService.success'),
            updatePay
        });
    } catch (error) {
        console.log("Error al actualizar el servicio", error);
        return res.status(500).json({
            success: false,
            msg: 'Error al procesar la actualización del servicio',
        });
    }
};

export const deletePay = async (req, res) => {
    try {
        const { id } = req.params;

        // Eliminar el servicio programado
        const pay = await Pays.findByIdAndDelete(id);

        if (!pay) {
            return res.status(404).json({
                success: false,
                msg: req.t('pays.deleteService.notFound')
            });
        }
        const description = 'Eliminacion de datos sensibles en el departamento de finanzas'
        await newLog(
            description, 
            req.ip,
            req.uid.id, 
        )
        return res.json({
            success: true,
            msg: req.t('pays.deleteService.success'),
            pay
        });
    } catch (error) {
        console.log("Error al eliminar el servicio", error);
        return res.status(500).json({
            success: false,
            msg: 'Error al procesar la eliminación del servicio',
        });
    }
};


export const getPays = async (req, res) =>{
    try {
        // Obtener los pagos de la base de datos
        const pays = await Pays.find();

        // Crear un nuevo arreglo para almacenar los pagos actualizados
        const updatedPays = [];

        // Iterar sobre cada pago
        for (const pay of pays) {
            // Buscar el usuario correspondiente
            const user = await User.findById(pay.user);

            // Buscar el servicio agendado correspondiente
            const scheduleService = await ScheduleService.findById(pay.scheduleService);

            const service = await Service.findById(scheduleService.service)

            const typePay = await TypePay.findById(pay.type)

            // Crear un objeto para almacenar el pago actualizado
            const updatedPay = {
                _id : pay._id,
                date: pay.date,
                user: `${user.name} ${user.apellidoP} ${user.apellidoM}`,
                amount: pay.amount,
                service: service.name,
                description: scheduleService.description,
                type: typePay.type
            };

            // Agregar el pago actualizado al arreglo de pagos actualizados
            updatedPays.push(updatedPay);
        }

        // Regresar el nuevo arreglo de pagos actualizados
        return res.json({
            success: true,
            pays: updatedPays
        });
    } catch (error) {
        console.log("Error al obtener pagos")
        console.log(error)
        return res.status(500).json({ success: false, message: "Error al obtener pagos" });
    }
}

