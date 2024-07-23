import express from 'express';
import { getEmployeds, getServicesByEmployee, toggleEmployeeStatus, registerEmployee, updateEmployee, getEmployeeById } from '../arquitecture/Controllers/employed.controller.js';
import { requireToken } from '../helpers/middlewares/JWT.config.js';
import { handleImageUpload } from '../helpers/middlewares/images.config.js';
const router = express.Router();

router.get('/get', getEmployeds)
router.get('/getEmployed/:id', getEmployeeById)
router.put('/change/:id', requireToken, toggleEmployeeStatus)

router.get('/services', requireToken, getServicesByEmployee)
router.post('/register', requireToken, handleImageUpload, registerEmployee);
router.put('/update/:id', requireToken, handleImageUpload, updateEmployee); 


export default router