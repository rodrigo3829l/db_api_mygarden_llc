import express from 'express';
import { addDate, removeDate, getDates } from '../arquitecture/Controllers/dates.controller.js';

const router = express.Router();


router.post ('/add', [], addDate)
router.post ('/remove:id', [], removeDate)
router.get ('/get', [], getDates)


export default router