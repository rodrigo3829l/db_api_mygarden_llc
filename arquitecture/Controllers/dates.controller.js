import { Dates } from "../models/Dates.js";

// Función para agregar una fecha
export const addDate = async (req, res) => {
    try {
        let { fecha } = req.body;
        const currentDate = new Date();

        // Normalizar la fecha a las 12:00:00.000Z
        const normalizedDate = new Date(fecha);
        normalizedDate.setUTCHours(12, 0, 0, 0);

        // Verificar si la fecha ya existe en la base de datos
        const existingDate = await Dates.findOne({ date: normalizedDate });

        if (existingDate) {
            return res.json({
                success: false,
                msg: req.t('dates.addDate.existDate')
            });
        }

        const newDate = new Dates({
            date: normalizedDate
        });

        await newDate.save();

        // Eliminar todas las fechas anteriores a la fecha actual
        await Dates.deleteMany({ date: { $lt: currentDate } });

        return res.json({
            success: true,
            msg: req.t('dates.addDate.success')
        });

    } catch (error) {
        console.log("Error al agregar fecha");
        console.log(error);
        return res.json({
            success: false,
            msg: 'Error al agregar la fecha'
        });
    }
};

// Función para eliminar una fecha
export const removeDate = async (req, res) => {
    try {
        const { id } = req.params;
        const currentDate = new Date();

        const date = await Dates.findByIdAndDelete(id);

        if (!date) {
            return res.json({
                success: false,
                msg: req.t('dates.removeDate.notDate')
            });
        }

        // Eliminar todas las fechas anteriores a la fecha actual
        await Dates.deleteMany({ date: { $lt: currentDate } });

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

// Función para obtener todas las fechas
export const getDates = async (req, res) => {
    try {
        const clientIP = req.ip;
        const currentDate = new Date();

        // Eliminar todas las fechas anteriores a la fecha actual
        await Dates.deleteMany({ date: { $lt: currentDate } });

        const dates = await Dates.find();
        return res.json({
            success: true,
            dates
        });
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            msg: 'Error al obtener las fechas'
        });
    }
};

// Función para actualizar una fecha
export const updateDate = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha } = req.body;
        const currentDate = new Date();

        const existingDate = await Dates.findOne({ _id: id });

        if (!existingDate) {
            return res.json({
                success: false,
                // msg: req.t('No existe el servicio a actualizar')
                msg: 'No existe el servicio a actualizar'
            });
        }

        existingDate.date = fecha;
        await existingDate.save();

        // Eliminar todas las fechas anteriores a la fecha actual
        await Dates.deleteMany({ date: { $lt: currentDate } });

        return res.json({
            success: true,
            msg: 'Actualizado correctamente',
            date: existingDate
        });

    } catch (error) {
        console.log("Error al actualizar la fecha");
        console.log(error);
        return res.json({
            success: false,
            msg: 'Error al actualizar la fecha'
        });
    }
};
