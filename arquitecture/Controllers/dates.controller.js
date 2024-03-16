import { Dates } from "../models/Dates.js";


export const addDate = async  (req, res) => {
    try {
        const {fecha} = req.body;

        // Verificar si la fecha ya existe en la base de datos
        const existingDate = await Dates.findOne({ date: fecha });

        if (existingDate) {
            return res.json({
                success: false,
                msg:  req.t('dates.addDate.existDate')
            });
        }

        const newDate = new Dates({
            date : fecha
        })

        await newDate.save()

        return res.json({
            success: true,
            msg: req.t('dates.addDate.success')
        }); 

    } catch (error) {
        console.log("Error al agregar fecha")
        console.log(error)
        return res.json ({
            success : false,
            msg : 'Error al agregar la fecha'
        })
    }
}

export const removeDate = async (req, res) => {
    try {
        const { id } = req.params;

        const date = await Dates.findByIdAndRemove(id);

        if (!date) {
            return res.json({
                success: false,
                msg: req.t('dates.removeDate.notDate')
            });
        }

        return res.json({
            success: true,
            msg: req.t('dates.removeDate.success')
        });

    } catch (error) {
        console.log("Error al eliminar fecha");
        console.log(error);
        return res.json({
            success: false,
            msg: 'Error al eliminar la fecha'
        });
    }
};

export const getDates = async(req, res) =>{
    try {
        const clientIP = req.ip
        // req.headers['cf-connecting-ip'] ||
        // req.headers['x-real-ip'] ||
        // req.headers['x-forwarded-for'] ||
        // req.headers['X-Client-IP'] ||
        // req.socket.remoteAddress || ''
        console.log(clientIP)
        const dates = await Dates.find()
        return res.json({
            success : true,
            dates
        })
    } catch (error) {
        console.log(error)
    }
}