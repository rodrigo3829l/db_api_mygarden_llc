import { Satisfaction } from "../models/Satisfaction.js";
import { User } from "../models/Users.js";

// Función para guardar las respuestas de satisfacción
export const saveSatisfaction = async (req, res) => {
    try {
        const { question1, question2, question3, satisfactionLevel, plataform } = req.body;
        const id = req.uid.id;
        // Verificar si el usuario existe
        const user = await User.findById(id);
        if (!user) {
            return res.json({
                success: false,
                msg: 'Usuario no encontrado'
            });
        }

        // Crear y guardar un nuevo registro de satisfacción
        const newSatisfaction = new Satisfaction({
            user: user._id,
            question1,
            question2,
            question3,
            satisfactionLevel,
            plataform
        });

        await newSatisfaction.save();

        // Popular el usuario completo para la respuesta
        const populatedSatisfaction = await newSatisfaction.populate('user');

        return res.json({
            success: true,
            msg: 'Satisfacción guardada exitosamente',
            satisfaction: populatedSatisfaction
        });

    } catch (error) {
        console.error("Error al guardar satisfacción", error);
        return res.json({
            success: false,
            msg: 'Error al guardar la satisfacción'
        });
    }
};

// Función para obtener resultados según el grado de satisfacción
export const getSatisfactionByLevel = async (req, res) => {
    try {
        const { level } = req.params;

        // Buscar las satisfacciones con el nivel especificado y popular los usuarios
        const satisfactions = await Satisfaction.find({ satisfactionLevel: level }).populate('user');

        return res.json({
            success: true,
            satisfactions
        });

    } catch (error) {
        console.error("Error al obtener satisfacciones", error);
        return res.json({
            success: false,
            msg: 'Error al obtener los resultados'
        });
    }
};

export const getAllSatisfactions = async (req, res) => {
    try {
        // Obtener todas las encuestas de satisfacción y popular los usuarios
        const satisfactions = await Satisfaction.find().populate('user');

        return res.json({
            success: true,
            satisfactions
        });

    } catch (error) {
        console.error("Error al obtener todas las encuestas de satisfacción", error);
        return res.json({
            success: false,
            msg: 'Error al obtener todas las encuestas de satisfacción'
        });
    }
};

// Función para obtener resultados por ID de usuario
export const getSatisfactionByUser = async (req, res) => {
    try {
        const id = req.uid.id;
        
        // Buscar las satisfacciones del usuario especificado y popular el usuario
        const satisfactions = await Satisfaction.find({ user: id }).populate('user');

        if (!satisfactions.length) {
            return res.json({
                success: false,
                msg: 'No se encontraron registros para este usuario'
            });
        }

        return res.json({
            success: true,
            satisfactions
        });

    } catch (error) {
        console.error("Error al obtener satisfacción por usuario", error);
        return res.json({
            success: false,
            msg: 'Error al obtener los resultados'
        });
    }
};

// Función para obtener resultados según una respuesta específica en una pregunta
export const getSatisfactionByQuestionValue = async (req, res) => {
    try {
        const { questionNumber, value } = req.params;

        // Seleccionar la pregunta que corresponde al número pasado en los params
        const questionField = `question${questionNumber}`;
        
        const query = {};
        query[questionField] = value;

        // Buscar las satisfacciones con el valor en la pregunta especificada y popular los usuarios
        const satisfactions = await Satisfaction.find(query).populate('user');

        if (!satisfactions.length) {
            return res.json({
                success: false,
                msg: `No se encontraron registros con el valor ${value} en la pregunta ${questionNumber}`
            });
        }

        return res.json({
            success: true,
            satisfactions
        });

    } catch (error) {
        console.error("Error al obtener satisfacción por valor de pregunta", error);
        return res.json({
            success: false,
            msg: 'Error al obtener los resultados'
        });
    }
};
