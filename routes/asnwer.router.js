import { addAnwer, removeAnswer, updateAnswer, getAnswers } from '../arquitecture/Controllers/answer.controller.js';
import express from 'express';
const router = express.Router();

router.get('/get', [], getAnswers)

router.post('/add', [], addAnwer)

router.put('/update/:id', [], updateAnswer)

router.delete('/delete/:id', [], removeAnswer)

export default router