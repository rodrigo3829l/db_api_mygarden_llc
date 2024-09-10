import { Satisfaction } from "../models/Satisfaction.js";
import { User } from "../models/Users.js"

// Función para guardar las respuestas de satisfacción
export const saveSatisfaction = async (req, res) => {
    try {
        const { userId, question1, question2, question3, satisfactionLevel } = req.body;

        // Verificar si el usuario existe
        const user = await User.findById(userId);
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
            satisfactionLevel
        });

        await newSatisfaction.save();

        return res.json({
            success: true,
            msg: 'Satisfacción guardada exitosamente',
            satisfaction: newSatisfaction
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

        const satisfactions = await Satisfaction.find({ satisfactionLevel: level });

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

// Función para obtener resultados por ID de usuario
export const getSatisfactionByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const satisfactions = await Satisfaction.find({ user: userId });

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

        const satisfactions = await Satisfaction.find(query);

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
