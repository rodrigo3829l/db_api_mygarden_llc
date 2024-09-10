import express from 'express';
const router = express.Router();

import { 
    saveSatisfaction, 
    getSatisfactionByLevel, 
    getSatisfactionByUser, 
    getSatisfactionByQuestionValue  
} from '../arquitecture/Controllers/satisfaction.controller';

// Ruta para guardar una nueva respuesta de satisfacción
router.post('/save', saveSatisfaction);

// Ruta para obtener todas las respuestas que tengan un determinado grado de satisfacción (1 a 5)
router.get('/level/:level', getSatisfactionByLevel);

// Ruta para obtener las respuestas de satisfacción por el ID del usuario
router.get('/user/:userId', getSatisfactionByUser);

// Ruta para obtener respuestas que tengan un valor específico en una pregunta
// Por ejemplo: pregunta 1 con valor 4 -> /satisfaction/question/1/value/4
router.get('/question/:questionNumber/value/:value', getSatisfactionByQuestionValue);

export default router;