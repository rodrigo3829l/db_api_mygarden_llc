import express from 'express';
import { getEmployeds, getServicesByEmployee, toggleEmployeeStatus } from '../arquitecture/Controllers/employed.controller.js';
import { requireToken } from '../helpers/middlewares/JWT.config.js';
const router = express.Router();

router.get('/get', getEmployeds)
router.put('/change/:id', requireToken, toggleEmployeeStatus)

router.get('/services', requireToken, getServicesByEmployee)

export default router