import { Pays } from "../models/Pays.js";
import { User } from "../models/Users.js";
import { ScheduleService } from "../models/ScheduledService.js";
import {getToken, getTokenData, generateRefreshToken} from "../../helpers/middlewares/JWT.config.js"

export const payScheduledService = async (req, res) => {
    try {
        const { user, mount, scheduleService, type } = req.body;
        const amount = (mount).toFixed(2)
        const data = getTokenData(user);
        const userId = data.uid;

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
