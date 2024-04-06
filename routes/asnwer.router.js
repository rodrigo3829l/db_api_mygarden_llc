import { 
    addAnwer, 
    removeAnswer, 
    updateAnswer, 
    getAnswers } from '../arquitecture/Controllers/answer.controller.js';
import express from 'express';
import { requireToken } from '../helpers/middlewares/JWT.config.js';
const router = express.Router();

router.get('/get', [], getAnswers) //optener todo

router.post('/add', requireToken, addAnwer) //agregar

router.put('/update/:id', requireToken, updateAnswer) //es para actualizar

router.delete('/delete/:id', requireToken, removeAnswer) //eliminar

export default router