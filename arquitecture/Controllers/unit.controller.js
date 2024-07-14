import { Unit } from "../models/Unit.js";

// Agregar una nueva unidad
export const addUnit = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.json({
                success: false,
                msg: "El nombre de la unidad es obligatorio"
            });
        }

        const newUnit = new Unit({ name });
        await newUnit.save();
        res.json({
            success: true,
            msg: "Unidad a",
            data: newUnit
        });
    } catch (error) {
        res.json({
            success: false,
            msg: "Error al agregar la unidad",
            error
        });
    }
};

// Eliminar una unidad
export const deleteUnit = async (req, res) => {
    try {
        const { id } = req.params;
        const unit = await Unit.findByIdAndDelete(id);

        if (!unit) {
            return res.json({
                success: false,
                msg: "Unidad no encontrada"
            });
        }

        res.json({
            success: true,
            msg: "Unidad eliminada correctamente"
        });
    } catch (error) {
        res.json({
            success: false,
            msg: "Error al eliminar la unidad",
            error
        });
    }
};

// Editar una unidad
export const editUnit = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.json({
                success: false,
                msg: "El nombre de la unidad es obligatorio"
            });
        }

        const unit = await Unit.findByIdAndUpdate(id, { name }, { new: true });

        if (!unit) {
            return res.json({
                success: false,
                msg: "Unidad no encontrada"
            });
        }

        res.json({
            success: true,
            data: unit
        });
    } catch (error) {
        res.json({
            success: false,
            msg: "Error al editar la unidad",
            error
        });
    }
};

// Mostrar todas las unidades
export const getAllUnits = async (req, res) => {
    try {
        const units = await Unit.find();
        res.json({
            success: true,
            data: units
        });
    } catch (error) {
        res.json({
            success: false,
            msg: "Error al obtener las unidades",
            error
        });
    }
};
