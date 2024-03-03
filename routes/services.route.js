import express from 'express';

import { 
    addService,
    getServices,
    getServiceById
 } from '../arquitecture/Controllers/services.controller.js';

 const router = express.Router();

 router.post('/add', [], addService)

router.get('/get', [], getServices)
router.get('/getService/:id', [], getServiceById)

export default router;